import { aggregateSales } from "../../../src/data/wedash/salesAggregate.ts";
import type { SalesDayAgg, SalesHourAgg } from "../../../src/data/wedash/salesTypes.ts";
import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";
import {
  partitionRowsByFilial,
  type FetchSalesListaParams,
  type SaleRowWithFilial,
} from "./millenniumSales.ts";
import {
  forgetMillenniumSession,
  logoutRememberedSessions,
  rememberMillenniumSession,
} from "./sessionStore.ts";

/** SEED = 1º sync (mês ant. → hoje). HISTORY = mês a mês até teto 24m. RANGE/FORCE = sob demanda. */
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
  /** Earliest day in sales_day_agg for store (any brand). */
  earliestSalesDay: (args: { tenantId: string; storeId: string }) => Promise<string | null>;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: (session: string) => Promise<void>;
  /** EVENTO whitelist ids for this store's COD_FILIAL (from EVENTOS.ListaTodos). */
  resolveEventoIds: (session: string, codFilial: string) => Promise<number[]>;
  fetchSalesLista: (params: FetchSalesListaParams) => Promise<SaleRowWithFilial[] | SaleRow[]>;
  upsertDayAggs: (rows: SalesDayAgg[]) => Promise<void>;
  upsertHourAggs: (rows: SalesHourAgg[]) => Promise<void>;
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

/** Quantas lojas consultam VENDAS.Lista ao mesmo tempo (1 sessão Millennium). Default = 1 (sequencial). */
export function storeFetchConcurrency(storeCount: number): number {
  const raw = Number(process.env.STORE_CONCURRENCY ?? "1");
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.max(1, Math.min(Math.floor(raw), Math.max(1, storeCount)));
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

  const days = missingDays(rangeFrom, rangeTo, existing, { today, alwaysToday });
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

/**
 * Reusa token do tenant; se não houver, faz login e grava.
 * Renova (novo login) só quando pedido (ex.: 401) via forceRenew.
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
      rememberMillenniumSession(cred.id, stored);
      return { ok: true, session: stored, reused: true };
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

  console.log(`Iniciando ${kindLabel(job.kind)} · tenant ${job.tenantId.slice(0, 8)}…`);

  try {
    // HISTORY sem janelas / RANGE sem buracos: não gasta sessão no Millennium.
    if (job.kind === "RANGE" || job.kind === "HISTORY") {
      const previewStores = await deps.listStores(job.tenantId);
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
        console.log(
          job.kind === "HISTORY"
            ? "Histórico completo até o teto/chão — nada a buscar"
            : "Período já está no banco — nada a buscar no Millennium",
        );
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
      const msgPt =
        reason === "busy"
          ? "Sessão ocupada no Millennium — nova tentativa em breve"
          : reason === "password"
            ? "Senha do ERP inválida — reconecte em Configurações"
            : `Falha no login Millennium: ${ensured.raw}`;
      console.warn(msgPt);
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
    const storeList = await deps.listStores(job.tenantId);
    const now = deps.now();
    const lightToday =
      job.kind === "LIGHT" ||
      (job.kind === "FORCE_LIGHT" && !job.payload.from && !job.payload.to);

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
      const withFilial: SaleRowWithFilial[] = rawRows.map((r) =>
        "millenniumFilial" in r && (r as SaleRowWithFilial).millenniumFilial != null
          ? (r as SaleRowWithFilial)
          : { ...r, millenniumFilial: null },
      );
      const parts = partitionRowsByFilial(withFilial, byMillenium);
      for (const store of storeList) {
        const rows = parts.get(store.id) ?? [];
        const agg = aggregateSales(rows, {
          tenantId: job.tenantId,
          timeZone: store.timezone,
          now,
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
        } else {
          await deps.upsertDayAggs(agg.days);
          if (agg.hours.length > 0) await deps.upsertHourAggs(agg.hours);
        }
        storesDone += 1;
        console.log(
          `Loja ${store.code} · ${rows.length} venda(s) · ${agg.days.length || 1} dia(s)`,
        );
      }
    } else {
      const concurrency = storeFetchConcurrency(storeList.length);
      console.log(
        `Sessão OK (${ensured.reused ? "reusada" : "nova"}) · ${storeList.length} loja(s) · paralelo ×${concurrency}`,
      );

      const storeResults = await mapPool(storeList, concurrency, async (store, i) => {
        const eventoIds = await deps.resolveEventoIds(session!, store.code);
        if (eventoIds.length === 0) {
          throw new Error(`Nenhum EVENTO de venda para a loja ${store.code}`);
        }
        const windows = await windowsForStore(job, store, now, deps);
        if (windows.length === 0) {
          console.log(
            `Loja ${i + 1}/${storeList.length} (${store.code}) — nada a buscar (já no banco)`,
          );
          return 1;
        }
        console.log(
          `Loja ${i + 1}/${storeList.length} (${store.code}) · ${windows.length} janela(s) · EVENTOs ${eventoIds.join(",")}`,
        );
        let storeSales = 0;
        let storeDays = 0;
        let dayErrors = 0;
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
                  console.warn(`  [${store.code}] Range falhou — caindo para dia a dia (${from}→${to})`);
                  queue.unshift(...chunkInclusiveRange(from, to, 1));
                }
                continue;
              }
            } else {
              throw dayErr;
            }
          }

          if (rows.length === 0 && from !== to) {
            console.warn(`  [${store.code}] Range ${from}→${to} vazio — caindo para dia a dia`);
            queue.unshift(...chunkInclusiveRange(from, to, 1));
            continue;
          }

          const agg = aggregateSales(rows, {
            tenantId: job.tenantId,
            timeZone: store.timezone,
            now,
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
            storeDays += 1;
          } else {
            await deps.upsertDayAggs(agg.days);
            await deps.upsertHourAggs(agg.hours);
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
        console.log(
          `Loja ${i + 1}/${storeList.length} (${store.code}) ok · ${storeSales} venda(s) · ${storeDays} dia(s) gravado(s)` +
            (dayErrors > 0 ? ` · ${dayErrors} janela(s) com falha` : ""),
        );
        return 1;
      });
      storesDone = storeResults.reduce((a, b) => a + b, 0);
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
    console.log(`Concluído (${kindLabel(job.kind)}) · ${storesDone} loja(s)`);

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
    console.error(`Erro no sync: ${msg}`);
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
