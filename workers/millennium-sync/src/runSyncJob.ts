import { aggregatePaymentDay, aggregateSales } from "../../../src/data/wedash/salesAggregate.ts";
import type { SalesDayAgg, SalesHourAgg } from "../../../src/data/wedash/salesTypes.ts";
import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";
import {
  saleRowsFromDetLines,
  uniqueBrandSplitHeaders,
} from "./brandSplitFromDetalhe.ts";
import type { DetMovLine } from "./millenniumDetMov.ts";
import type {
  ProductBrandCatalog,
  ProductBrandMap,
} from "./millenniumProductDivision.ts";
import { millenniumBaseUrl } from "./millenniumAuth.ts";
import {
  brandReportToDayAggs,
  applyBrandDayCounts,
  applyAllCountsToWepinkDays,
  type BrandReportDayRow,
} from "./millenniumBrandReport.ts";
import { cmvCentsFromMargemLines } from "./millenniumMargem.ts";
import {
  aggregateCategoryDay,
  buildProductTipoMap,
  isUsableTipoId,
  type CategorySalesLine,
  type ProductTipo,
} from "./millenniumCategoryReport.ts";
import type { SalesCategoryDayAgg, SalesPaymentDayAgg } from "../../../src/data/wedash/salesTypes.ts";
import {
  partitionRowsByFilial,
  type FetchSalesListaParams,
  type SaleRowWithFilial,
} from "./millenniumSales.ts";

/** Grava formas de pagamento da janela Lista (replace no range). */
async function persistPaymentDayAggs(
  deps: Pick<SyncJobDeps, "replacePaymentDayAggs">,
  args: {
    tenantId: string;
    storeId: string;
    timeZone: string;
    from: string;
    to: string;
    rows: SaleRow[];
    now: Date;
  },
): Promise<void> {
  const pay = aggregatePaymentDay(args.rows, {
    tenantId: args.tenantId,
    timeZone: args.timeZone,
    now: args.now,
    dayFrom: args.from,
    dayTo: args.to,
  });
  await deps.replacePaymentDayAggs({
    tenantId: args.tenantId,
    storeId: args.storeId,
    from: args.from,
    to: args.to,
    rows: pay,
  });
}
import {
  forgetMillenniumSession,
  logoutRememberedSessions,
  rememberMillenniumSession,
} from "./sessionStore.ts";

/** Quantas ConsultaDetMov em paralelo (1 sessão). Default 5. */
export function detMovConcurrency(pending: number): number {
  const raw = Number(process.env.DET_MOV_CONCURRENCY ?? "5");
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.max(1, Math.min(Math.floor(raw), Math.max(1, pending)));
}

/**
 * Grava WEPINK/WPINK:
 * - Receita/dia = relatório oficial {70F9DE61} (bate com ERP "TOTAL VENDA POR DIA").
 * - Contagens (vendas/itens) = DetMov quando há WPINK; senão copia do ALL (loja só WEPINK).
 * - Horas = ConsultaDetMov quando a loja tem WPINK no catálogo.
 * Soft-fail — ALL da Lista já está gravado.
 */
async function upsertBrandSplit(
  deps: SyncJobDeps,
  args: {
    session: string;
    tenantId: string;
    store: SyncStore;
    from: string;
    to: string;
    rows: SaleRowWithFilial[];
    productMap: ProductBrandMap;
    geradorMap: Map<string, number>;
    geradorIdsWithWpink: Set<number>;
  },
): Promise<void> {
  const geradorId = args.geradorMap.get(args.store.code);
  if (geradorId == null) {
    console.log(`  [${args.store.code}] sem GERADOR — skip brand split`);
    return;
  }

  let dayAggs: SalesDayAgg[] = [];

  // 1) Receita por dia × marca (fonte do relatório que o gestor confere)
  try {
    const reportRows = await deps.fetchBrandRevenueReport({
      session: args.session,
      geradorIds: [geradorId],
      from: args.from,
      to: args.to,
    });
    dayAggs = brandReportToDayAggs(reportRows, {
      tenantId: args.tenantId,
      storeId: args.store.id,
    });
    if (dayAggs.length === 0) {
      console.log(
        `  [${args.store.code}] brand report ${args.from}→${args.to} · vazio`,
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSessionDeadError(msg)) throw e;
    console.warn(
      `  [${args.store.code}] brand report falhou (ALL ok): ${msg}`,
    );
  }

  const storeRows = args.rows.filter((r) => r.storeId === args.store.id);
  // Relatório de marca pode ter WPINK mesmo se o mapa de estoque não listou o gerador.
  const reportHasWpink = dayAggs.some((d) => d.brand === "WPINK");
  const hasWpink = args.geradorIdsWithWpink.has(geradorId) || reportHasWpink;

  // 2a) Loja sem WPINK: counts do ALL (Lista) → WEPINK
  if (!hasWpink && dayAggs.length > 0 && storeRows.length > 0) {
    const listaAgg = aggregateSales(
      storeRows.map((r) => ({ ...r, brand: "ALL" as const })),
      {
        tenantId: args.tenantId,
        timeZone: args.store.timezone,
        now: deps.now(),
        dayFrom: args.from,
        dayTo: args.to,
      },
    );
    dayAggs = applyAllCountsToWepinkDays(dayAggs, listaAgg.days);
  }

  // 2b) Loja com WPINK: DetMov → horas + counts por marca (receita continua a do relatório)
  if (hasWpink && args.productMap.size > 0) {
    const headers = uniqueBrandSplitHeaders(storeRows);
    if (headers.length > 0) {
      try {
        const concurrency = detMovConcurrency(headers.length);
        const brandRows: SaleRow[] = [];
        let ok = 0;
        let fail = 0;
        await mapPool(headers, concurrency, async (header) => {
          try {
            const lines = await deps.fetchConsultaDetMov({
              session: args.session,
              codOperacao: header.millenniumOpCode,
              nf: header.nf,
              tipoOperacao: header.tipoOperacao,
            });
            brandRows.push(...saleRowsFromDetLines(header, lines, args.productMap));
            ok += 1;
          } catch (e) {
            fail += 1;
            const msg = e instanceof Error ? e.message : String(e);
            if (isSessionDeadError(msg)) throw e;
            console.warn(
              `  [${args.store.code}] DetMov ${header.millenniumOpCode}/${header.nf}: ${msg}`,
            );
          }
        });
        if (brandRows.length === 0) {
          console.log(
            `  [${args.store.code}] DetMov ${args.from}→${args.to} · 0 linhas · det ${ok}ok/${fail}fail`,
          );
        } else {
          const agg = aggregateSales(brandRows, {
            tenantId: args.tenantId,
            timeZone: args.store.timezone,
            now: deps.now(),
            dayFrom: args.from,
            dayTo: args.to,
          });
          const brandedDays = agg.days.filter(
            (d) => d.brand === "WEPINK" || d.brand === "WPINK",
          );
          const brandedHours = agg.hours.filter(
            (h) => h.brand === "WEPINK" || h.brand === "WPINK",
          );
          if (dayAggs.length > 0) {
            dayAggs = applyBrandDayCounts(dayAggs, brandedDays);
          } else {
            // Relatório caiu — usa receita+counts do DetMov como fallback
            dayAggs = brandedDays;
          }
          if (brandedHours.length > 0) await deps.upsertHourAggs(brandedHours);
          console.log(
            `  [${args.store.code}] DetMov ${args.from}→${args.to} · ${brandedDays.length} dia×marca · ${brandedHours.length} hora×marca · det ${ok}ok/${fail}fail`,
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isSessionDeadError(msg)) throw e;
        console.warn(`  [${args.store.code}] DetMov falhou (report ok): ${msg}`);
      }
    }
  } else if (hasWpink && args.productMap.size === 0) {
    console.log(`  [${args.store.code}] sem mapa produto — skip DetMov`);
  } else if (!hasWpink) {
    console.log(
      `  [${args.store.code}] sem WPINK no cadastro — counts WEPINK ← ALL`,
    );
  }

  if (dayAggs.length > 0) {
    await deps.upsertDayAggs(dayAggs);
    console.log(
      `  [${args.store.code}] brand days ${args.from}→${args.to} · ${dayAggs.length} dia×marca`,
    );
  }
  if (reportHasWpink) {
    await deps.setStoresHasWpink([{ storeId: args.store.id, hasWpink: true }]);
  }
}

function eachIsoDay(from: string, to: string): string[] {
  const days: string[] = [];
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

/** CMV via RELATORIOMARGEM — 1 chamada por dia (imposto% = 0). Soft-fail. */
async function syncCmvForRange(
  deps: SyncJobDeps,
  args: {
    session: string;
    tenantId: string;
    store: SyncStore;
    from: string;
    to: string;
    /** Se passado, só estes dias (pula intermediários). */
    days?: string[];
  },
): Promise<void> {
  const days = args.days ?? eachIsoDay(args.from, args.to);
  if (days.length === 0) return;
  const patches: Array<{ tenantId: string; storeId: string; day: string; cmvCents: number }> = [];
  let ok = 0;
  let fail = 0;
  for (const day of days) {
    try {
      const lines = await deps.fetchRelatorioMargem({
        session: args.session,
        millenniumStoreId: args.store.millenniumStoreId,
        from: day,
        to: day,
      });
      patches.push({
        tenantId: args.tenantId,
        storeId: args.store.id,
        day,
        cmvCents: cmvCentsFromMargemLines(lines),
      });
      ok += 1;
    } catch (e) {
      fail += 1;
      const msg = e instanceof Error ? e.message : String(e);
      if (isSessionDeadError(msg)) throw e;
      console.warn(`  [${args.store.code}] RELATORIOMARGEM ${day}: ${msg}`);
    }
  }
  if (patches.length > 0) await deps.patchDayCmv(patches);
  console.log(
    `  [${args.store.code}] CMV ${days[0]}→${days[days.length - 1]} · ${ok} dia(s) ok · ${fail} fail`,
  );
}

/**
 * Categorias × meta — C5BBF0E2.
 * 1) lookup tipos + N calls filtradas (mapa produto→tipo no período)
 * 2) 1 call/dia sem filtro → agrega por categoria
 */
async function syncCategoriesForRange(
  deps: SyncJobDeps,
  args: {
    session: string;
    tenantId: string;
    store: SyncStore;
    geradorId: number;
    from: string;
    to: string;
    /** Se passado, só estes dias (pula intermediários). */
    days?: string[];
  },
): Promise<void> {
  const days = args.days ?? eachIsoDay(args.from, args.to);
  if (days.length === 0) return;
  const mapFrom = days[0]!;
  const mapTo = days[days.length - 1]!;
  console.log(
    `  [${args.store.code}] categorias… ${days.length} dia(s)`,
  );

  let tipos: ProductTipo[] = [];
  try {
    tipos = (await deps.fetchProductTipos(args.session)).filter((t) => isUsableTipoId(t.id));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSessionDeadError(msg)) throw e;
    console.warn(`  [${args.store.code}] produto.tipo.tipo: ${msg}`);
    return;
  }
  if (tipos.length === 0) {
    console.warn(`  [${args.store.code}] categorias: nenhum tipo utilizável`);
    return;
  }
  console.log(
    `  [${args.store.code}] categorias · mapa produto→tipo · ${tipos.length} tipo(s)`,
  );

  let productToTipo: Map<number, ProductTipo>;
  try {
    productToTipo = await buildProductTipoMap({
      session: args.session,
      geradorId: args.geradorId,
      from: mapFrom,
      to: mapTo,
      tipos,
      concurrency: 2,
      onTipo: ({ done, total, tipo }) => {
        if (done === 1 || done === total || done % 5 === 0) {
          console.log(
            `  [${args.store.code}] produto→tipo ${done}/${total} · ${tipo.name}`,
          );
        }
      },
      fetchReport: (p) =>
        deps.fetchCategorySalesReport({
          session: p.session,
          geradorId: p.geradorId,
          from: p.from,
          to: p.to,
          tipoId: p.tipoId ?? null,
        }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isSessionDeadError(msg)) throw e;
    console.warn(`  [${args.store.code}] mapa produto→tipo: ${msg}`);
    return;
  }
  console.log(
    `  [${args.store.code}] produto→tipo · ${productToTipo.size} SKU(s) · ${tipos.length} tipo(s)`,
  );

  const out: SalesCategoryDayAgg[] = [];
  let ok = 0;
  let fail = 0;
  for (const day of days) {
    try {
      const lines: CategorySalesLine[] = await deps.fetchCategorySalesReport({
        session: args.session,
        geradorId: args.geradorId,
        from: day,
        to: day,
        tipoId: null,
      });
      out.push(
        ...aggregateCategoryDay(lines, productToTipo, {
          tenantId: args.tenantId,
          storeId: args.store.id,
          day,
        }),
      );
      ok += 1;
    } catch (e) {
      fail += 1;
      const msg = e instanceof Error ? e.message : String(e);
      if (isSessionDeadError(msg)) throw e;
      console.warn(`  [${args.store.code}] categorias ${day}: ${msg}`);
    }
  }
  if (out.length > 0) await deps.upsertCategoryDayAggs(out);
  console.log(
    `  [${args.store.code}] categorias ${mapFrom}→${mapTo} · ${ok} dia(s) ok · ${fail} fail · ${out.length} linha(s)`,
  );
}

/** SEED = 1º sync (mês ant. 01 → hoje). HISTORY = opcional (HISTORY_AFTER_SEED=1). RANGE/FORCE = sob demanda. */
export type SyncJobKind =
  | "BACKFILL"
  | "SEED"
  | "LIGHT"
  | "FORCE_LIGHT"
  | "FORCE"
  | "RANGE"
  | "HISTORY";

/** Teto de histórico: não puxa além de N meses atrás (exceto chão opened_at). */
export const HISTORY_CAP_MONTHS = 24;

export type SyncJobPayload = {
  /** Inclusive ISO day YYYY-MM-DD (store TZ calendar). */
  from?: string;
  to?: string;
  /** When set and non-empty, only these store UUIDs are synced. */
  storeIds?: string[];
};

export type SyncJob = {
  id: string;
  tenantId: string;
  credentialId: string;
  kind: SyncJobKind;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
  payload: SyncJobPayload;
};

export type SyncCredential = {
  id: string;
  tenantId: string;
  username: string;
  password: string;
  status: "VALID" | "INVALID" | "NOT_CONFIGURED";
};

export type SyncStore = {
  id: string;
  millenniumStoreId: number;
  /** COD_FILIAL display e.g. "00010" — used to resolve S-{n} EVENTO. */
  code: string;
  timezone: string;
  /** DATA_INAUGURACAO — chão do backfill (null = só teto 24m). */
  openedAt?: string | null;
  /** true = loja já teve WPINK no sync; false = só cosmético; undefined = ainda não sabemos. */
  hasWpink?: boolean | null;
};

export type LoginResult =
  | { ok: true; session: string }
  | { ok: false; reason: "busy" | "password" | "other"; raw: string };

export type SyncJobDeps = {
  hasRunningForCredential: (credentialId: string) => Promise<boolean>;
  markJobRunning: (jobId: string) => Promise<void>;
  markJobFinished: (args: {
    jobId: string;
    status: "SUCCEEDED" | "FAILED";
    error?: string;
  }) => Promise<void>;
  loadCredential: (credentialId: string) => Promise<SyncCredential>;
  listStores: (tenantId: string) => Promise<SyncStore[]>;
  /** Days already in sales_day_agg for this store (any brand). */
  listExistingDays: (args: {
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
  }) => Promise<string[]>;
  /** Dias com CMV preenchido (brand=ALL, cmv_cents not null). */
  listDaysWithCmv: (args: {
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
  }) => Promise<string[]>;
  /** Dias que já têm sales_category_day_agg. */
  listDaysWithCategory: (args: {
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
  }) => Promise<string[]>;
  /**
   * Dias com forma de pagamento “completa”:
   * tem linha em sales_payment_day_agg OU day_agg ALL com revenue 0.
   */
  listDaysPaymentComplete: (args: {
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
  }) => Promise<string[]>;
  /** Earliest day in sales_day_agg for store (any brand). */
  earliestSalesDay: (args: { tenantId: string; storeId: string }) => Promise<string | null>;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: (session: string) => Promise<void>;
  /** EVENTO whitelist ids for this store's COD_FILIAL (from EVENTOS.ListaTodos). */
  resolveEventoIds: (session: string, codFilial: string) => Promise<number[]>;
  fetchSalesLista: (params: FetchSalesListaParams) => Promise<SaleRowWithFilial[] | SaleRow[]>;
  /** Lookup COD_FILIAL → FILIAL_GERADOR_GERADOR (wtsreports). */
  fetchFilialGeradorMap: (session: string) => Promise<Map<string, number>>;
  /** Mapa PRODUTO → WEPINK|WPINK (report + LISTAR; 1× por job, união das lojas). */
  fetchProductBrandMap: (params: {
    session: string;
    geradorIds: number[];
    stores?: Array<{ millenniumStoreId: number; geradorId: number }>;
    from?: string;
    to?: string;
  }) => Promise<ProductBrandCatalog>;
  /** Relatório oficial faturamento por marca (dia) — CATALOG 70F9DE61. */
  fetchBrandRevenueReport: (params: {
    session: string;
    geradorIds: number[];
    from: string;
    to: string;
  }) => Promise<BrandReportDayRow[]>;
  /** Itens da venda (ConsultaDetMov). */
  fetchConsultaDetMov: (params: {
    session: string;
    codOperacao: number;
    nf: string;
    tipoOperacao?: string;
  }) => Promise<DetMovLine[]>;
  /** RELATORIOMARGEM — CMV do período (chamar por dia). */
  fetchRelatorioMargem: (params: {
    session: string;
    millenniumStoreId: number;
    from: string;
    to: string;
  }) => Promise<import("./millenniumMargem.ts").MargemLine[]>;
  /** Lookup produto.tipo.tipo — catálogo de categorias. */
  fetchProductTipos: (session: string) => Promise<ProductTipo[]>;
  /** C5BBF0E2 — linhas produto×vendedor (filtrável por tipo). */
  fetchCategorySalesReport: (params: {
    session: string;
    geradorId: number;
    from: string;
    to: string;
    tipoId?: number | null;
  }) => Promise<CategorySalesLine[]>;
  upsertDayAggs: (rows: SalesDayAgg[]) => Promise<void>;
  /** Patch só cmv_cents em brand=ALL (não zera receita no upsert). */
  patchDayCmv: (
    rows: Array<{ tenantId: string; storeId: string; day: string; cmvCents: number }>,
  ) => Promise<void>;
  upsertCategoryDayAggs: (rows: SalesCategoryDayAgg[]) => Promise<void>;
  /**
   * Substitui formas de pagamento no intervalo [from,to] da loja
   * (delete + upsert — evita CONDICAO órfã após FORCE).
   */
  replacePaymentDayAggs: (args: {
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
    rows: SalesPaymentDayAgg[];
  }) => Promise<void>;
  upsertHourAggs: (rows: SalesHourAgg[]) => Promise<void>;
  /** Persiste flag WPINK por loja (mapa produto / FILIAIS). */
  setStoresHasWpink: (rows: Array<{ storeId: string; hasWpink: boolean }>) => Promise<void>;
  insertSyncRun: (args: {
    tenantId: string;
    credentialId: string;
    kind: SyncJobKind;
    ok: boolean;
    storesDone: number;
    error?: string;
    startedAt: Date;
    finishedAt: Date;
  }) => Promise<void>;
  updateCredential: (args: {
    credentialId: string;
    status?: SyncCredential["status"];
    lastError?: string;
    lastErrorAt?: Date;
    lastSuccessAt?: Date;
    lastLightSyncAt?: Date;
  }) => Promise<void>;
  /** Sessão Millennium persistida no tenant (compartilhada com o app). */
  getStoredSession: (credentialId: string) => Promise<string | null>;
  setStoredSession: (credentialId: string, session: string | null) => Promise<void>;
  /** Enfileira HISTORY se ainda faltar mês atrás do teto/chão (dedupe). */
  enqueueHistoryFollowUp: (args: {
    tenantId: string;
    credentialId: string;
  }) => Promise<boolean>;
  now: () => Date;
};

export type RunSyncResult =
  | { ok: true; storesDone: number }
  | { ok: false; reason: "locked" | "busy" | "password" | "other"; error?: string };

export function ymdInTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDaysIso(isoDay: string, delta: number): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return utc.toISOString().slice(0, 10);
}

function minIso(a: string, b: string): string {
  return a <= b ? a : b;
}

function maxIso(a: string, b: string): string {
  return a >= b ? a : b;
}

/** 401 / sessão morta — não adianta continuar dia a dia. */
function isSessionDeadError(msg: string): boolean {
  const t = msg.toLowerCase();
  return /\b401\b/.test(t) || t.includes("unauthorized");
}

/** Contenção Millennium (sessão única / limite) — vale baixar concorrência e retry. */
export function isContentionError(msg: string): boolean {
  const t = msg.toLowerCase();
  return (
    t.includes("busy") ||
    t.includes("ocupad") ||
    t.includes("limite") ||
    t.includes("too many") ||
    t.includes("max session") ||
    t.includes("concurrent") ||
    t.includes("timeout") ||
    t.includes("timed out") ||
    t.includes("etimedout") ||
    t.includes("econnreset") ||
    t.includes("503") ||
    t.includes("429") ||
    t.includes("rate limit")
  );
}

/** Run up to `concurrency` async tasks over `items` (order of results = input order). */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

/**
 * Processa itens em paralelo; se der contenção Millennium, desce N → ⌊N/2⌋ → 1 e retenta só os que falharam.
 * Índices originais preservados nos resultados.
 */
export async function mapPoolAdaptive<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  opts?: { initialConcurrency?: number },
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let pending = items.map((item, i) => ({ item, i }));
  let concurrency = Math.max(
    1,
    Math.min(opts?.initialConcurrency ?? items.length, items.length || 1),
  );

  while (pending.length > 0) {
    const batch = pending;
    pending = [];
    const limit = Math.min(concurrency, batch.length);
    if (batch.length === items.length) {
      console.log(`Paralelo ×${limit} · ${batch.length} loja(s)/item(s)`);
    } else {
      console.log(`Retry paralelo ×${limit} · ${batch.length} loja(s)/item(s)`);
    }

    const contention: Array<{ item: T; i: number }> = [];
    await mapPool(batch, limit, async (entry) => {
      try {
        results[entry.i] = await fn(entry.item, entry.i);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isContentionError(msg) && concurrency > 1) {
          contention.push(entry);
          console.warn(`  contenção [${entry.i}]: ${msg.slice(0, 120)}`);
        } else {
          throw e;
        }
      }
    });

    if (contention.length === 0) break;
    concurrency = Math.max(1, Math.floor(concurrency / 2));
    console.warn(`↓ concorrência → ${concurrency} · retry ${contention.length} item(ns)`);
    pending = contention;
  }

  return results;
}

/**
 * Quantas lojas em paralelo (1 sessão Millennium).
 * Default = todas as lojas do job. `STORE_CONCURRENCY` opcional só como teto.
 */
export function storeFetchConcurrency(storeCount: number): number {
  const n = Math.max(1, storeCount);
  const raw = process.env.STORE_CONCURRENCY;
  if (raw == null || raw.trim() === "") return n;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return n;
  return Math.max(1, Math.min(Math.floor(parsed), n));
}

/** LIGHT / FORCE: brand report basta; DetMov classifica por descrição se sem mapa. */
function shouldBuildProductBrandMap(
  kind: SyncJobKind,
  stores: SyncStore[],
  lightToday: boolean,
): boolean {
  if (lightToday) return false;
  if (kind === "FORCE" || kind === "FORCE_LIGHT") return false;
  // Nenhuma loja marcada com WPINK → DetMov não roda; brand report basta.
  if (stores.length > 0 && stores.every((s) => s.hasWpink === false)) return false;
  if (kind === "SEED" || kind === "HISTORY" || kind === "BACKFILL" || kind === "RANGE") {
    return true;
  }
  return false;
}

/** Janela do LISTAR enrich: SEED/HISTORY amplo; FORCE/RANGE só o dia (SKU do dia). */
function productCatalogWindow(
  kind: SyncJobKind,
  todayIso: string,
): { from: string; to: string } {
  if (kind === "SEED" || kind === "HISTORY" || kind === "BACKFILL") {
    return seedWindow(todayIso);
  }
  return { from: todayIso, to: todayIso };
}

/** Chunk inclusive range into ≤ maxDays windows. */
export function chunkInclusiveRange(
  start: string,
  end: string,
  maxDays = 30,
): Array<{ from: string; to: string }> {
  if (start > end) return [];
  const chunks: Array<{ from: string; to: string }> = [];
  let cursor = start;
  while (cursor <= end) {
    const chunkEnd = minIso(addDaysIso(cursor, maxDays - 1), end);
    chunks.push({ from: cursor, to: chunkEnd });
    cursor = addDaysIso(chunkEnd, 1);
  }
  return chunks;
}

/** Dias inclusivos em [from, to]. */
export function inclusiveDayCount(from: string, to: string): number {
  if (from > to) return 0;
  let n = 0;
  let cursor = from;
  while (cursor <= to) {
    n += 1;
    cursor = addDaysIso(cursor, 1);
  }
  return n;
}

/**
 * Escada após timeout/vazio: mês → 15d → 7d → 1d.
 * `null` = já é 1 dia (não dá pra fatiar mais).
 */
export function nextFallbackMaxDays(from: string, to: string): number | null {
  const days = inclusiveDayCount(from, to);
  if (days <= 1) return null;
  if (days > 15) return 15;
  if (days > 7) return 7;
  return 1;
}

/** Fatia a janela que falhou no próximo degrau da escada. */
export function splitFailedWindow(
  from: string,
  to: string,
): Array<{ from: string; to: string }> {
  const max = nextFallbackMaxDays(from, to);
  if (max == null) return [];
  return chunkInclusiveRange(from, to, max);
}

/** Particiona em meses de calendário (ex.: ago/01–31, set/01–hoje). */
export function chunkByCalendarMonths(
  start: string,
  end: string,
): Array<{ from: string; to: string }> {
  if (start > end) return [];
  const out: Array<{ from: string; to: string }> = [];
  let cursor = start;
  while (cursor <= end) {
    const [y, m] = cursor.split("-").map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const to = minIso(monthEnd, end);
    out.push({ from: cursor, to });
    cursor = addDaysIso(to, 1);
  }
  return out;
}

/** Start of previous calendar month in store TZ → today (covers default “este mês” + vs mês ant.). */
export function seedWindow(todayIso: string): { from: string; to: string } {
  const [y, m] = todayIso.split("-").map(Number);
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const from = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  return { from, to: todayIso };
}

/** Calendar day N months before `todayIso` (same day-of-month when possible). */
export function monthsBeforeIso(todayIso: string, months: number): string {
  const [y, m, d] = todayIso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1 - months, d));
  return utc.toISOString().slice(0, 10);
}

/** Chão do histórico: o mais recente entre inauguração e teto (hoje − 24m). */
export function historyFloor(todayIso: string, openedAt?: string | null): string {
  const cap = monthsBeforeIso(todayIso, HISTORY_CAP_MONTHS);
  const opened =
    openedAt && /^\d{4}-\d{2}-\d{2}/.test(openedAt) ? openedAt.slice(0, 10) : null;
  return opened ? maxIso(cap, opened) : cap;
}

/** Inclusive calendar month immediately before the month of `dayIso`. */
export function previousCalendarMonth(dayIso: string): { from: string; to: string } {
  const [y, m] = dayIso.split("-").map(Number);
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  const from = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(prevY, prevM, 0)).getUTCDate();
  const to = `${prevY}-${String(prevM).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

/**
 * Próximo mês a buscar no HISTORY (um mês atrás do que já temos).
 * `earliestExisting` null → começa logo antes do SEED (`seedFrom`).
 */
export function nextHistoryWindow(opts: {
  today: string;
  openedAt?: string | null;
  earliestExisting: string | null;
  seedFrom: string;
}): { from: string; to: string } | null {
  const floor = historyFloor(opts.today, opts.openedAt);
  const cursor = opts.earliestExisting ?? opts.seedFrom;
  if (cursor <= floor) return null;
  const { from, to } = previousCalendarMonth(cursor);
  const fromClamped = maxIso(from, floor);
  const toClamped = minIso(to, addDaysIso(cursor, -1));
  if (fromClamped > toClamped) return null;
  return { from: fromClamped, to: toClamped };
}

/** Collapse discrete ISO days into contiguous inclusive windows. */
export function collapseDaysToWindows(days: string[]): Array<{ from: string; to: string }> {
  if (days.length === 0) return [];
  const sorted = [...new Set(days)].sort();
  const out: Array<{ from: string; to: string }> = [];
  let from = sorted[0]!;
  let to = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i]!;
    if (d === addDaysIso(to, 1)) {
      to = d;
    } else {
      out.push(...chunkInclusiveRange(from, to));
      from = d;
      to = d;
    }
  }
  out.push(...chunkInclusiveRange(from, to));
  return out;
}

/**
 * Days to fetch for RANGE/FORCE within [from, to].
 * FORCE always includes today even if already present.
 */
export function missingDays(
  from: string,
  to: string,
  existing: string[],
  opts: { today: string; alwaysToday: boolean },
): string[] {
  const have = new Set(existing);
  const need: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    if (!have.has(cursor)) need.push(cursor);
    cursor = addDaysIso(cursor, 1);
  }
  if (opts.alwaysToday) {
    // Sempre rebusca hoje (venda muda o dia inteiro), mesmo fora do período ou já no banco.
    const set = new Set(need);
    set.add(opts.today);
    return [...set].sort();
  }
  return need.sort();
}

/**
 * CMV / categorias: SEED/HISTORY = janela inteira;
 * FORCE CMV = buracos + hoje; FORCE categorias = só buracos (mapa tipos é caro —
 * reprocessar hoje a cada Atualizar trava o job). RANGE = só buracos.
 */
export async function daysNeedingHeavySync(
  deps: Pick<SyncJobDeps, "listDaysWithCmv" | "listDaysWithCategory">,
  args: {
    kind: SyncJobKind;
    tenantId: string;
    storeId: string;
    from: string;
    to: string;
    today: string;
    which: "cmv" | "category";
  },
): Promise<string[]> {
  const { kind, from, to, today } = args;
  if (kind === "SEED" || kind === "BACKFILL" || kind === "HISTORY") {
    return eachIsoDay(from, to);
  }
  const listHave =
    args.which === "cmv" ? deps.listDaysWithCmv.bind(deps) : deps.listDaysWithCategory.bind(deps);
  const have = await listHave({
    tenantId: args.tenantId,
    storeId: args.storeId,
    from,
    to,
  });
  // Categorias: NÃO forçar hoje — cada refresh = dezenas de wtsreports (1× por tipo).
  // CMV / Lista ainda rebuscam hoje.
  const alwaysToday =
    (kind === "FORCE" || kind === "FORCE_LIGHT") && args.which === "cmv";
  return missingDays(from, to, have, { today, alwaysToday });
}

function kindLabel(kind: SyncJobKind): string {
  switch (kind) {
    case "SEED":
    case "BACKFILL":
      return "carga inicial";
    case "HISTORY":
      return "histórico (mês a mês)";
    case "LIGHT":
      return "sync do dia";
    case "FORCE":
    case "FORCE_LIGHT":
      return "atualização forçada";
    case "RANGE":
      return "período sob demanda";
    default:
      return kind;
  }
}

/** Janela de CMV: FORCE/RANGE usa o período do payload (não só buracos da Lista). */
function cmvWindowForJob(
  job: SyncJob,
  today: string,
): { from: string; to: string } | null {
  const kind = job.kind;
  if (kind === "LIGHT") return null;
  if (kind === "FORCE_LIGHT" && !job.payload.from && !job.payload.to) return null;
  if (kind === "SEED" || kind === "BACKFILL") return seedWindow(today);
  if (kind === "HISTORY") return null; // usa as janelas já buscadas
  const from = job.payload.from ?? today;
  const to = job.payload.to ?? today;
  let a = minIso(from, to);
  let b = maxIso(from, to);
  if (kind === "FORCE" || kind === "FORCE_LIGHT") {
    a = minIso(a, today);
    b = maxIso(b, today);
  }
  return { from: a, to: b };
}

function shouldSyncCmv(kind: SyncJobKind): boolean {
  return (
    kind === "SEED" ||
    kind === "BACKFILL" ||
    kind === "HISTORY" ||
    kind === "FORCE" ||
    kind === "RANGE"
  );
}

/** Categorias: pausado (TODO mapa produto→tipo). Nenhum job synca até retomar. */
function shouldSyncCategories(_kind: SyncJobKind): boolean {
  return false;
}

async function windowsForStore(
  job: SyncJob,
  store: SyncStore,
  now: Date,
  deps: SyncJobDeps,
): Promise<Array<{ from: string; to: string }>> {
  const today = ymdInTz(now, store.timezone);
  const kind = job.kind;

  if (kind === "LIGHT" || (kind === "FORCE_LIGHT" && !job.payload.from && !job.payload.to)) {
    return [{ from: today, to: today }];
  }

  if (kind === "SEED" || kind === "BACKFILL") {
    const { from, to } = seedWindow(today);
    // Mês fechado (menos hits no Millennium). Se vier vazio, o loop cai p/ dia a dia.
    return chunkByCalendarMonths(from, to);
  }

  if (kind === "HISTORY") {
    const { from: seedFrom } = seedWindow(today);
    const earliest = await deps.earliestSalesDay({
      tenantId: job.tenantId,
      storeId: store.id,
    });
    const win = nextHistoryWindow({
      today,
      openedAt: store.openedAt,
      earliestExisting: earliest,
      seedFrom,
    });
    if (!win) return [];
    return chunkByCalendarMonths(win.from, win.to);
  }

  const from = job.payload.from ?? today;
  const to = job.payload.to ?? today;
  const rangeFrom = minIso(from, to);
  const rangeTo = maxIso(from, to);
  const alwaysToday = kind === "FORCE" || kind === "FORCE_LIGHT";

  const existing = await deps.listExistingDays({
    tenantId: job.tenantId,
    storeId: store.id,
    from: alwaysToday ? minIso(rangeFrom, today) : rangeFrom,
    to: alwaysToday ? maxIso(rangeTo, today) : rangeTo,
  });

  // FORCE/RANGE: dia com venda mas sem CONDICAO = buraco (1º Atualizar backfill; 2º = só hoje).
  let have = existing;
  if (kind === "FORCE" || kind === "FORCE_LIGHT" || kind === "RANGE") {
    const payDone = await deps.listDaysPaymentComplete({
      tenantId: job.tenantId,
      storeId: store.id,
      from: alwaysToday ? minIso(rangeFrom, today) : rangeFrom,
      to: alwaysToday ? maxIso(rangeTo, today) : rangeTo,
    });
    const paySet = new Set(payDone);
    have = existing.filter((d) => paySet.has(d));
  }

  const days = missingDays(rangeFrom, rangeTo, have, { today, alwaysToday });
  // FORCE/RANGE: buracos — tenta meses; fallback dia a dia no loop se vazio.
  return collapseDaysToWindows(days).flatMap((w) => chunkByCalendarMonths(w.from, w.to));
}

/** Sessão Millennium aberta neste processo — liberada no finally e no SIGINT. */
let activeMillenniumSession: string | null = null;

export function getActiveMillenniumSession(): string | null {
  return activeMillenniumSession;
}

export async function releaseActiveMillenniumSession(
  logout: (session: string) => Promise<void>,
): Promise<void> {
  const s = activeMillenniumSession;
  if (!s) return;
  activeMillenniumSession = null;
  // Não faz logout no ERP — sessão pertence ao tenant até o usuário desconectar.
  // Só tira da memória do processo.
  void logout;
  console.log("Sessão Millennium mantida no tenant (shutdown só libera memória do worker)");
}

/** Smoke leve: sessão morta → 401 (não usa cache de EVENTOs). */
async function sessionStillAlive(session: string): Promise<boolean> {
  // Testes unitários não batem no Millennium.
  if (process.env.VITEST || process.env.NODE_ENV === "test") return true;
  try {
    const res = await fetch(`${millenniumBaseUrl()}/Millennium.EVENTOS.ListaTodos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "WTS-Session": session,
        "X-HTTP-Method": "GET",
        "X-IdentifierCase": "upper",
      },
      body: "{}",
      signal: AbortSignal.timeout(30_000),
    });
    return res.status !== 401;
  } catch {
    return false;
  }
}

/**
 * Reusa token do tenant; se não houver / 401, faz login e grava.
 * Renova (novo login) quando forceRenew ou smoke falha.
 */
async function ensureMillenniumSession(
  cred: SyncCredential,
  deps: SyncJobDeps,
  opts?: { forceRenew?: boolean },
): Promise<
  | { ok: true; session: string; reused: boolean }
  | { ok: false; reason: "busy" | "password" | "other"; raw: string }
> {
  if (!opts?.forceRenew) {
    const stored = await deps.getStoredSession(cred.id);
    if (stored) {
      const alive = await sessionStillAlive(stored);
      if (alive) {
        rememberMillenniumSession(cred.id, stored);
        return { ok: true, session: stored, reused: true };
      }
      console.warn("Sessão salva morta (401) — login fresco…");
      try {
        await deps.logout(stored);
      } catch {
        /* best-effort */
      }
      await deps.setStoredSession(cred.id, null);
      forgetMillenniumSession(cred.id);
    }
  } else {
    const old = await deps.getStoredSession(cred.id);
    if (old) {
      try {
        await deps.logout(old);
      } catch {
        /* best-effort */
      }
      await deps.setStoredSession(cred.id, null);
      forgetMillenniumSession(cred.id);
    }
  }

  const login = await deps.login(cred.username, cred.password);
  if (!login.ok) {
    return { ok: false, reason: login.reason, raw: login.raw };
  }
  rememberMillenniumSession(cred.id, login.session);
  await deps.setStoredSession(cred.id, login.session);
  return { ok: true, session: login.session, reused: false };
}

/**
 * Claim already happened; runner enforces one RUNNING per credential,
 * sequential stores, always logout after login, busy/password classification.
 */
export async function runSyncJob(job: SyncJob, deps: SyncJobDeps): Promise<RunSyncResult> {
  if (await deps.hasRunningForCredential(job.credentialId)) {
    // Silencioso — claimNextJob já evita isso; se chegar aqui, deixa QUEUED.
    return { ok: false, reason: "locked" };
  }

  await deps.markJobRunning(job.id);
  const startedAt = deps.now();
  let session: string | null = null;
  let storesDone = 0;

  console.log(
    `[sync] start kind=${job.kind} tenant=${job.tenantId.slice(0, 8)} job=${job.id.slice(0, 8)}`,
  );

  try {
    // HISTORY sem janelas: não gasta sessão. RANGE sem buracos ainda precisa CMV.
    if (job.kind === "HISTORY") {
      let previewStores = await deps.listStores(job.tenantId);
      if (job.payload.storeIds && job.payload.storeIds.length > 0) {
        const want = new Set(job.payload.storeIds);
        previewStores = previewStores.filter((s) => want.has(s.id));
      }
      const nowPreview = deps.now();
      let precisaMillennium = false;
      for (const store of previewStores) {
        const w = await windowsForStore(job, store, nowPreview, deps);
        if (w.length > 0) {
          precisaMillennium = true;
          break;
        }
      }
      if (!precisaMillennium) {
        console.log("Histórico completo até o teto/chão — nada a buscar");
        const finishedAt = deps.now();
        await deps.markJobFinished({ jobId: job.id, status: "SUCCEEDED" });
        await deps.insertSyncRun({
          tenantId: job.tenantId,
          credentialId: job.credentialId,
          kind: job.kind,
          ok: true,
          storesDone: previewStores.length,
          startedAt,
          finishedAt,
        });
        return { ok: true, storesDone: previewStores.length };
      }
    }

    const cred = await deps.loadCredential(job.credentialId);

    // Sessão ligada ao tenant: reusa token salvo; só loga se não houver / inválido.
    // Logout explícito fica com o usuário (Configurações / pause), não com o fim do job.
    const ensured = await ensureMillenniumSession(cred, deps);
    if (!ensured.ok) {
      const reason = ensured.reason;
      console.warn(
        `[sync] fail kind=${job.kind} tenant=${job.tenantId.slice(0, 8)} job=${job.id.slice(0, 8)} reason=${reason}`,
      );
      if (reason === "password") {
        await deps.updateCredential({
          credentialId: cred.id,
          status: "INVALID",
          lastError: ensured.raw,
          lastErrorAt: deps.now(),
        });
      } else {
        await deps.updateCredential({
          credentialId: cred.id,
          lastError: ensured.raw,
          lastErrorAt: deps.now(),
        });
      }
      await deps.markJobFinished({
        jobId: job.id,
        status: "FAILED",
        error: ensured.raw,
      });
      await deps.insertSyncRun({
        tenantId: job.tenantId,
        credentialId: job.credentialId,
        kind: job.kind,
        ok: false,
        storesDone: 0,
        error: ensured.raw,
        startedAt,
        finishedAt: deps.now(),
      });
      return { ok: false, reason: reason === "other" ? "other" : reason };
    }

    session = ensured.session;
    activeMillenniumSession = session;
    let storeList = await deps.listStores(job.tenantId);
    if (job.payload.storeIds && job.payload.storeIds.length > 0) {
      const want = new Set(job.payload.storeIds);
      storeList = storeList.filter((s) => want.has(s.id));
      console.log(
        `Escopo FORCE · ${storeList.length} loja(s): ${storeList.map((s) => s.code).join(", ") || "(nenhuma)"}`,
      );
      if (storeList.length === 0) {
        const finishedAt = deps.now();
        await deps.markJobFinished({ jobId: job.id, status: "SUCCEEDED" });
        await deps.insertSyncRun({
          tenantId: job.tenantId,
          credentialId: job.credentialId,
          kind: job.kind,
          ok: true,
          storesDone: 0,
          startedAt,
          finishedAt,
        });
        return { ok: true, storesDone: 0 };
      }
    }
    const now = deps.now();
    let geradorMap = new Map<string, number>();
    try {
      geradorMap = await deps.fetchFilialGeradorMap(session);
      console.log(`GERADOR map · ${geradorMap.size} filial(is)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`GERADOR lookup falhou — brand split desligado neste job: ${msg}`);
    }
    let productMap: ProductBrandMap = new Map();
    let geradorIdsWithWpink = new Set<number>();
    const geradorIds = [...geradorMap.values()];
    const lightToday =
      job.kind === "LIGHT" ||
      (job.kind === "FORCE_LIGHT" && !job.payload.from && !job.payload.to);
    // Pré-marca lojas já conhecidas com WPINK (evita DetMov sem mapa no FORCE).
    for (const s of storeList) {
      if (s.hasWpink === true) {
        const g = geradorMap.get(s.code);
        if (g != null) geradorIdsWithWpink.add(g);
      }
    }
    if (geradorIds.length > 0 && shouldBuildProductBrandMap(job.kind, storeList, lightToday)) {
      try {
        const catalogTz = storeList[0]?.timezone ?? "America/Sao_Paulo";
        const catalogToday = ymdInTz(now, catalogTz);
        const catalogWin = productCatalogWindow(job.kind, catalogToday);
        const brandStores = storeList
          .map((s) => {
            const geradorId = geradorMap.get(s.code);
            if (geradorId == null) return null;
            return { millenniumStoreId: s.millenniumStoreId, geradorId };
          })
          .filter((x): x is { millenniumStoreId: number; geradorId: number } => x != null);
        console.log(
          `Product map · report+LISTAR · ${brandStores.length} filial(is) · ${catalogWin.from}→${catalogWin.to}`,
        );
        const catalog = await deps.fetchProductBrandMap({
          session,
          geradorIds,
          stores: brandStores,
          from: catalogWin.from,
          to: catalogWin.to,
        });
        productMap = catalog.map;
        geradorIdsWithWpink = catalog.geradorIdsWithWpink;
        console.log(
          `Product→marca map · ${productMap.size} SKU(s) · WPINK em ${geradorIdsWithWpink.size}/${geradorIds.length} loja(s)`,
        );
        // Só liga o flag (nunca desliga) — loja pode ter WPINK no relatório
        // mesmo sem SKU WPINK no mapa de estoque do gerador.
        const fromCatalog = storeList
          .filter((s) => {
            const g = geradorMap.get(s.code);
            return g != null && geradorIdsWithWpink.has(g);
          })
          .map((s) => ({ storeId: s.id, hasWpink: true as const }));
        if (fromCatalog.length > 0) await deps.setStoresHasWpink(fromCatalog);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`Product map falhou — brand split desligado neste job: ${msg}`);
      }
    } else if (geradorIds.length === 0) {
      console.warn("Sem GERADOR — brand split desligado neste job");
    } else {
      console.log(
        lightToday
          ? "Product map · skip (LIGHT — brand report basta)"
          : "Product map · skip (nenhuma loja com WPINK)",
      );
    }

    if (lightToday) {
      // LIGHT: 1× VENDAS.Lista sem FILIAL (hoje) → particiona por FILIAL da linha.
      const tz = storeList[0]?.timezone ?? "America/Sao_Paulo";
      const today = ymdInTz(now, tz);
      const eventoSet = new Set<number>();
      for (const store of storeList) {
        const ids = await deps.resolveEventoIds(session, store.code);
        for (const id of ids) eventoSet.add(id);
      }
      const eventoIds = [...eventoSet];
      if (eventoIds.length === 0) {
        throw new Error("Nenhum EVENTO de venda para as lojas do tenant");
      }
      console.log(
        `LIGHT hoje ${today} · ${storeList.length} loja(s) · 1× Lista FILIAL=null · EVENTOs ${eventoIds.join(",")}`,
      );
      const rawRows = await deps.fetchSalesLista({
        session,
        storeId: "",
        millenniumStoreId: null,
        from: today,
        to: today,
        eventoIds,
      });
      const byMillenium = new Map(storeList.map((s) => [s.millenniumStoreId, { id: s.id }]));
      const withFilial: SaleRowWithFilial[] = rawRows.map((r) => {
        const x = r as SaleRowWithFilial;
        if (x.millenniumFilial != null) {
          return {
            ...x,
            millenniumOpCode: x.millenniumOpCode ?? null,
            nf: x.nf ?? null,
            tipoOperacao: x.tipoOperacao ?? null,
          };
        }
        return {
          ...x,
          millenniumFilial: null,
          millenniumOpCode: x.millenniumOpCode ?? null,
          nf: x.nf ?? null,
          tipoOperacao: x.tipoOperacao ?? null,
        };
      });
      const parts = partitionRowsByFilial(withFilial, byMillenium);
      for (const store of storeList) {
        const rows = parts.get(store.id) ?? [];
        const agg = aggregateSales(rows, {
          tenantId: job.tenantId,
          timeZone: store.timezone,
          now,
          dayFrom: today,
          dayTo: today,
        });
        if (agg.days.length === 0) {
          await deps.upsertDayAggs([
            {
              tenantId: job.tenantId,
              storeId: store.id,
              day: today,
              brand: "ALL",
              revenueCents: 0,
              salesCount: 0,
              itemCount: 0,
            },
          ]);
          await persistPaymentDayAggs(deps, {
            tenantId: job.tenantId,
            storeId: store.id,
            timeZone: store.timezone,
            from: today,
            to: today,
            rows: [],
            now,
          });
        } else {
          await deps.upsertDayAggs(agg.days);
          if (agg.hours.length > 0) await deps.upsertHourAggs(agg.hours);
          await persistPaymentDayAggs(deps, {
            tenantId: job.tenantId,
            storeId: store.id,
            timeZone: store.timezone,
            from: today,
            to: today,
            rows,
            now,
          });
        }
        storesDone += 1;
        console.log(
          `Loja ${store.code} · ${rows.length} venda(s) · ${agg.days.length || 1} dia(s)`,
        );
        await upsertBrandSplit(deps, {
          session: session!,
          tenantId: job.tenantId,
          store,
          from: today,
          to: today,
          rows,
          productMap,
          geradorMap,
          geradorIdsWithWpink,
        });
      }
    } else {
      const concurrency = storeFetchConcurrency(storeList.length);
      console.log(
        `Sessão OK (${ensured.reused ? "reusada" : "nova"}) · ${storeList.length} loja(s) · começa paralelo ×${concurrency}`,
      );

      const storeResults = await mapPoolAdaptive(
        storeList,
        async (store, i) => {
        const eventoIds = await deps.resolveEventoIds(session!, store.code);
        if (eventoIds.length === 0) {
          throw new Error(`Nenhum EVENTO de venda para a loja ${store.code}`);
        }
        const windows = await windowsForStore(job, store, now, deps);
        const todayStore = ymdInTz(now, store.timezone);
        const cmvWin =
          cmvWindowForJob(job, todayStore) ??
          (windows.length > 0
            ? {
                from: windows.reduce((a, w) => (w.from < a ? w.from : a), windows[0]!.from),
                to: windows.reduce((a, w) => (w.to > a ? w.to : a), windows[0]!.to),
              }
            : null);

        if (windows.length === 0) {
          console.log(
            `Loja ${i + 1}/${storeList.length} (${store.code}) — nada a buscar (já no banco)`,
          );
          if (shouldSyncCmv(job.kind) && cmvWin) {
            const cmvDays = await daysNeedingHeavySync(deps, {
              kind: job.kind,
              tenantId: job.tenantId,
              storeId: store.id,
              from: cmvWin.from,
              to: cmvWin.to,
              today: todayStore,
              which: "cmv",
            });
            await syncCmvForRange(deps, {
              session: session!,
              tenantId: job.tenantId,
              store,
              from: cmvWin.from,
              to: cmvWin.to,
              days: cmvDays,
            });
          }
          if (shouldSyncCategories(job.kind) && cmvWin) {
            const geradorId = geradorMap.get(store.code);
            if (geradorId == null) {
              console.warn(`  [${store.code}] categorias: sem gerador (pula)`);
            } else {
              const catDays = await daysNeedingHeavySync(deps, {
                kind: job.kind,
                tenantId: job.tenantId,
                storeId: store.id,
                from: cmvWin.from,
                to: cmvWin.to,
                today: todayStore,
                which: "category",
              });
              if (catDays.length === 0) {
                console.log(`  [${store.code}] categorias · skip (sem buraco)`);
              } else {
                await syncCategoriesForRange(deps, {
                  session: session!,
                  tenantId: job.tenantId,
                  store,
                  geradorId,
                  from: cmvWin.from,
                  to: cmvWin.to,
                  days: catDays,
                });
              }
            }
          }
          return 1;
        }
        console.log(
          `Loja ${i + 1}/${storeList.length} (${store.code}) · ${windows.length} janela(s) · EVENTOs ${eventoIds.join(",")}`,
        );
        let storeSales = 0;
        let storeDays = 0;
        let dayErrors = 0;
        let brandFrom = windows[0]!.from;
        let brandTo = windows[0]!.to;
        const listaForBrand: SaleRowWithFilial[] = [];
        for (const w of windows) {
          if (w.from < brandFrom) brandFrom = w.from;
          if (w.to > brandTo) brandTo = w.to;
        }
        const queue: Array<{ from: string; to: string }> = [...windows];
        while (queue.length > 0) {
          const { from, to } = queue.shift()!;
          console.log(`  [${store.code}] Buscando ${from} → ${to}`);
          let rows: Awaited<ReturnType<typeof deps.fetchSalesLista>> = [];
          try {
            rows = await deps.fetchSalesLista({
              session: session!,
              storeId: store.id,
              millenniumStoreId: store.millenniumStoreId,
              from,
              to,
              eventoIds,
            });
          } catch (dayErr) {
            const msg = dayErr instanceof Error ? dayErr.message : String(dayErr);
            if (isSessionDeadError(msg)) {
              throw new Error(`Sessão Millennium inválida (401) em ${from}→${to}`);
            }
            if (job.kind === "SEED" || job.kind === "BACKFILL" || job.kind === "HISTORY") {
              console.warn(`  [${store.code}] Falha em ${from}→${to}: ${msg} — nova tentativa`);
              try {
                rows = await deps.fetchSalesLista({
                  session: session!,
                  storeId: store.id,
                  millenniumStoreId: store.millenniumStoreId,
                  from,
                  to,
                  eventoIds,
                });
              } catch (retryErr) {
                const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                if (isSessionDeadError(retryMsg)) {
                  throw new Error(`Sessão Millennium inválida (401) em ${from}→${to}`);
                }
                dayErrors += 1;
                console.warn(`  [${store.code}] Desistindo de ${from}→${to}: ${retryMsg}`);
                if (from === to) {
                  await deps.upsertDayAggs([
                    {
                      tenantId: job.tenantId,
                      storeId: store.id,
                      day: from,
                      brand: "ALL",
                      revenueCents: 0,
                      salesCount: 0,
                      itemCount: 0,
                    },
                  ]);
                } else {
                  const parts = splitFailedWindow(from, to);
                  const step = nextFallbackMaxDays(from, to);
                  console.warn(
                    `  [${store.code}] Range falhou — caindo para ${step}d (${from}→${to} → ${parts.length} janela(s))`,
                  );
                  queue.unshift(...parts);
                }
                continue;
              }
            } else {
              throw dayErr;
            }
          }

          if (rows.length === 0 && from !== to) {
            const parts = splitFailedWindow(from, to);
            const step = nextFallbackMaxDays(from, to);
            console.warn(
              `  [${store.code}] Range ${from}→${to} vazio — caindo para ${step}d (${parts.length} janela(s))`,
            );
            queue.unshift(...parts);
            continue;
          }

          for (const r of rows) {
            const x = r as SaleRowWithFilial;
            listaForBrand.push({
              ...x,
              storeId: store.id,
              millenniumFilial: x.millenniumFilial ?? store.millenniumStoreId,
              millenniumOpCode: x.millenniumOpCode ?? null,
              nf: x.nf ?? null,
              tipoOperacao: x.tipoOperacao ?? null,
            });
          }

          const agg = aggregateSales(rows, {
            tenantId: job.tenantId,
            timeZone: store.timezone,
            now,
            dayFrom: from,
            dayTo: to,
          });

          if (
            agg.days.length === 0 &&
            from === to &&
            (job.kind === "SEED" || job.kind === "BACKFILL" || job.kind === "HISTORY")
          ) {
            await deps.upsertDayAggs([
              {
                tenantId: job.tenantId,
                storeId: store.id,
                day: from,
                brand: "ALL",
                revenueCents: 0,
                salesCount: 0,
                itemCount: 0,
              },
            ]);
            await persistPaymentDayAggs(deps, {
              tenantId: job.tenantId,
              storeId: store.id,
              timeZone: store.timezone,
              from,
              to,
              rows: [],
              now,
            });
            storeDays += 1;
          } else {
            await deps.upsertDayAggs(agg.days);
            await deps.upsertHourAggs(agg.hours);
            await persistPaymentDayAggs(deps, {
              tenantId: job.tenantId,
              storeId: store.id,
              timeZone: store.timezone,
              from,
              to,
              rows,
              now,
            });
            storeSales += rows.length;
            storeDays += agg.days.length;

            if (
              from !== to &&
              (job.kind === "SEED" || job.kind === "BACKFILL" || job.kind === "HISTORY")
            ) {
              const have = new Set(agg.days.map((d) => d.day));
              const zeros: typeof agg.days = [];
              let cursor = from;
              while (cursor <= to) {
                if (!have.has(cursor)) {
                  zeros.push({
                    tenantId: job.tenantId,
                    storeId: store.id,
                    day: cursor,
                    brand: "ALL",
                    revenueCents: 0,
                    salesCount: 0,
                    itemCount: 0,
                  });
                }
                cursor = addDaysIso(cursor, 1);
              }
              if (zeros.length > 0) {
                await deps.upsertDayAggs(zeros);
                storeDays += zeros.length;
              }
            }
          }
        }
        await upsertBrandSplit(deps, {
          session: session!,
          tenantId: job.tenantId,
          store,
          from: brandFrom,
          to: brandTo,
          rows: listaForBrand,
          productMap,
          geradorMap,
          geradorIdsWithWpink,
        });
        // CMV / categorias: FORCE = buracos + hoje; SEED/HISTORY = janela; RANGE = só buracos.
        if (shouldSyncCmv(job.kind) && cmvWin) {
          const cmvDays = await daysNeedingHeavySync(deps, {
            kind: job.kind,
            tenantId: job.tenantId,
            storeId: store.id,
            from: cmvWin.from,
            to: cmvWin.to,
            today: todayStore,
            which: "cmv",
          });
          await syncCmvForRange(deps, {
            session: session!,
            tenantId: job.tenantId,
            store,
            from: cmvWin.from,
            to: cmvWin.to,
            days: cmvDays,
          });
        }
        if (shouldSyncCategories(job.kind) && cmvWin) {
          const geradorId = geradorMap.get(store.code);
          if (geradorId == null) {
            console.warn(`  [${store.code}] categorias: sem gerador (pula)`);
          } else {
            const catDays = await daysNeedingHeavySync(deps, {
              kind: job.kind,
              tenantId: job.tenantId,
              storeId: store.id,
              from: cmvWin.from,
              to: cmvWin.to,
              today: todayStore,
              which: "category",
            });
            if (catDays.length === 0) {
              console.log(`  [${store.code}] categorias · skip (sem buraco)`);
            } else {
              await syncCategoriesForRange(deps, {
                session: session!,
                tenantId: job.tenantId,
                store,
                geradorId,
                from: cmvWin.from,
                to: cmvWin.to,
                days: catDays,
              });
            }
          }
        }
        console.log(
          `Loja ${i + 1}/${storeList.length} (${store.code}) ok · ${storeSales} venda(s) · ${storeDays} dia(s) gravado(s)` +
            (dayErrors > 0 ? ` · ${dayErrors} janela(s) com falha` : ""),
        );
        return 1;
        },
        { initialConcurrency: concurrency },
      );
      storesDone = storeResults.reduce((a, b) => a + (b ?? 0), 0);
    }

    const finishedAt = deps.now();
    const touchesToday =
      job.kind === "LIGHT" ||
      job.kind === "FORCE_LIGHT" ||
      job.kind === "FORCE" ||
      job.kind === "SEED" ||
      job.kind === "BACKFILL";
    await deps.updateCredential({
      credentialId: job.credentialId,
      lastSuccessAt: finishedAt,
      ...(touchesToday ? { lastLightSyncAt: finishedAt } : {}),
    });
    await deps.markJobFinished({ jobId: job.id, status: "SUCCEEDED" });
    await deps.insertSyncRun({
      tenantId: job.tenantId,
      credentialId: job.credentialId,
      kind: job.kind,
      ok: true,
      storesDone,
      startedAt,
      finishedAt,
    });
    console.log(
      `[sync] ok kind=${job.kind} tenant=${job.tenantId.slice(0, 8)} job=${job.id.slice(0, 8)} stores=${storesDone}`,
    );

    if (job.kind === "SEED" || job.kind === "BACKFILL" || job.kind === "HISTORY") {
      const queued = await deps.enqueueHistoryFollowUp({
        tenantId: job.tenantId,
        credentialId: job.credentialId,
      });
      if (queued) console.log("Enfileirado histórico (próximo mês atrás)");
    }

    return { ok: true, storesDone };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(
      `[sync] fail kind=${job.kind} tenant=${job.tenantId.slice(0, 8)} job=${job.id.slice(0, 8)} reason=other error=${msg}`,
    );
    if (isSessionDeadError(msg)) {
      try {
        await deps.setStoredSession(job.credentialId, null);
        forgetMillenniumSession(job.credentialId);
      } catch {
        /* best-effort */
      }
    }
    await deps.updateCredential({
      credentialId: job.credentialId,
      lastError: msg,
      lastErrorAt: deps.now(),
    });
    await deps.markJobFinished({ jobId: job.id, status: "FAILED", error: msg });
    await deps.insertSyncRun({
      tenantId: job.tenantId,
      credentialId: job.credentialId,
      kind: job.kind,
      ok: false,
      storesDone,
      error: msg,
      startedAt,
      finishedAt: deps.now(),
    });
    return { ok: false, reason: "other", error: msg };
  } finally {
    // Sessão permanece no tenant (DB) até o usuário desconectar em Integrações / pause.
    // Só limpa o ponteiro em memória deste processo.
    if (session) {
      activeMillenniumSession = null;
    }
  }
}
