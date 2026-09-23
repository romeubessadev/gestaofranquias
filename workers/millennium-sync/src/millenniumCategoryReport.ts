/**
 * Categorias (PRODUTO_TIPO) via wtsreports.
 *
 * ERP UI: **WEPINK - PRODUTOS VENDIDOS POR VENDEDOR**
 * CATALOG_GUID: {C5BBF0E2-23D5-4493-903F-F529968AC0F2}
 *
 * A linha do report NÃO traz o tipo (PRODUTO_TIPO_TIPO=null).
 * Descoberta: 1 call filtrada por tipo no período → mapa produtoId→tipo;
 * depois 1 call/dia sem filtro → classifica e agrega.
 */
import type { SalesBrand, SalesCategoryDayAgg } from "../../../src/data/wedash/salesTypes.ts";
import { millenniumBaseUrl } from "./millenniumAuth.ts";

export const CATEGORY_SALES_CATALOG_GUID = "{C5BBF0E2-23D5-4493-903F-F529968AC0F2}";

/** Tipos “lixo” do lookup — não entram no mapa nem no card. */
const SKIP_TIPO_IDS = new Set<number>([-2_000_000_000, 16]);

export type ProductTipo = {
  id: number;
  name: string;
};

export type CategorySalesLine = {
  productId: number;
  productCode: string;
  productName: string;
  /** Quantidade vendida (F_3887607047). */
  qty: number;
  /** Receita em R$ (F_366619977). */
  revenueReais: number;
  sellerId: number | null;
  sellerName: string;
};

export type { SalesCategoryDayAgg };

function reportHeaders(session: string, base: string): Record<string, string> {
  const origin = base.replace(/\/api\/?$/, "");
  return {
    Accept: "*/*",
    "Content-Type": "application/json",
    Origin: origin,
    Referer: `${origin}/files/web-apps/millennium.html`,
    "WTS-Session": session,
    "X-DateFormat": "ISOTZ",
    "X-HTTP-Method": "POST",
    "X-IdentifierCase": "upper",
  };
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  for (const k of ["RAW_DATA", "value", "Value", "data", "Data", "items", "Items"]) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function asStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function reaisToCents(v: number): number {
  return Math.round(v * 100);
}

/** WPINK suplementos usam ids 201xx+; o resto (cosmético) = WEPINK. */
export function brandFromTipoId(tipoId: number): SalesBrand {
  return tipoId >= 20_100 ? "WPINK" : "WEPINK";
}

export function isUsableTipoId(id: number): boolean {
  return Number.isFinite(id) && !SKIP_TIPO_IDS.has(id) && id > 0;
}

/** "PERFUMARIA" → "Perfumaria"; "BODY SPLASH" → "Body Splash". */
export function formatCategoryName(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return t
    .split(/(\s+|&)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === "&") return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

export function parseProductTiposPayload(payload: unknown): ProductTipo[] {
  const out: ProductTipo[] = [];
  const seen = new Set<number>();
  for (const raw of extractList(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const id = asNum(o.PRODUTO_TIPO_TIPO ?? o.produto_tipo_tipo);
    if (id == null || seen.has(id)) continue;
    const name = asStr(o.PRODUTO_TIPO_DESCRICAO ?? o.produto_tipo_descricao);
    if (!name) continue;
    seen.add(id);
    out.push({ id, name });
  }
  return out;
}

export function parseCategorySalesRawData(payload: unknown): CategorySalesLine[] {
  const out: CategorySalesLine[] = [];
  for (const raw of extractList(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const productId = asNum(o.PRODUTO_PRODUTO_PRODUTO ?? o.produto_produto_produto);
    if (productId == null) continue;
    const qty = asNum(o.F_3887607047 ?? o.f_3887607047) ?? 0;
    const revenueReais = asNum(o.F_366619977 ?? o.f_366619977) ?? 0;
    if (qty === 0 && revenueReais === 0) continue;
    out.push({
      productId,
      productCode: asStr(o.PRODUTO_PRODUTO_COD_PRODUTO ?? o.produto_produto_cod_produto),
      productName: asStr(o.PRODUTO_PRODUTO_DESCRICAO1 ?? o.produto_produto_descricao1),
      qty,
      revenueReais,
      sellerId: asNum(o.FUNCIONARIO_GERADOR_GERADOR ?? o.funcionario_gerador_gerador),
      sellerName: asStr(o.FUNCIONARIO_GERADOR_NOME ?? o.funcionario_gerador_nome),
    });
  }
  return out;
}

/**
 * A partir de linhas de um report **já filtrado por tipo**,
 * registra produtoId → tipo no mapa (última atribuição ganha).
 */
export function absorbProductTipoMap(
  map: Map<number, ProductTipo>,
  lines: CategorySalesLine[],
  tipo: ProductTipo,
): void {
  if (!isUsableTipoId(tipo.id)) return;
  for (const line of lines) {
    map.set(line.productId, tipo);
  }
}

/** Agrega linhas do dia (sem filtro) usando o mapa produto→tipo. */
export function aggregateCategoryDay(
  lines: CategorySalesLine[],
  productToTipo: Map<number, ProductTipo>,
  opts: { tenantId: string; storeId: string; day: string },
): SalesCategoryDayAgg[] {
  const acc = new Map<
    number,
    { name: string; brand: SalesBrand; revenueCents: number; itemCount: number }
  >();
  let unknownCents = 0;
  let unknownQty = 0;

  for (const line of lines) {
    const cents = reaisToCents(line.revenueReais);
    const tipo = productToTipo.get(line.productId);
    if (!tipo) {
      unknownCents += cents;
      unknownQty += line.qty;
      continue;
    }
    const cur = acc.get(tipo.id) ?? {
      name: formatCategoryName(tipo.name),
      brand: brandFromTipoId(tipo.id),
      revenueCents: 0,
      itemCount: 0,
    };
    cur.revenueCents += cents;
    cur.itemCount += Math.round(line.qty);
    acc.set(tipo.id, cur);
  }

  const out: SalesCategoryDayAgg[] = [...acc.entries()].map(([categoryId, v]) => ({
    tenantId: opts.tenantId,
    storeId: opts.storeId,
    day: opts.day,
    categoryId,
    categoryName: v.name,
    brand: v.brand,
    revenueCents: v.revenueCents,
    itemCount: v.itemCount,
  }));

  if (unknownCents > 0 || unknownQty > 0) {
    out.push({
      tenantId: opts.tenantId,
      storeId: opts.storeId,
      day: opts.day,
      categoryId: 16,
      categoryName: "Indefinido",
      brand: "ALL",
      revenueCents: unknownCents,
      itemCount: Math.round(unknownQty),
    });
  }

  return out.sort((a, b) => b.revenueCents - a.revenueCents);
}

export async function fetchProductTipos(params: {
  session: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<ProductTipo[]> {
  const base = (params.baseUrl ?? millenniumBaseUrl()).replace(/\/$/, "");
  const fetchImpl = params.fetchImpl ?? fetch;
  const res = await fetchImpl(`${base}/millenium?$lookup=produto.tipo.tipo&$top=501`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      "WTS-Session": params.session,
      "X-DateFormat": "ISOTZ",
      "X-HTTP-Method": "GET",
      "X-IdentifierCase": "upper",
    },
    body: JSON.stringify({
      SCRIPT: null,
      DATASOURCE: null,
      PRODUTO_TIPO_TIPO: null,
      _DETAILS: true,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`produto.tipo.tipo → ${res.status} ${text.slice(0, 280)}`);
  }
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`produto.tipo.tipo JSON inválido: ${text.slice(0, 200)}`);
  }
  return parseProductTiposPayload(parsed);
}

export type FetchCategorySalesParams = {
  session: string;
  geradorId: number;
  from: string;
  to: string;
  /** null = todas as categorias. */
  tipoId?: number | null;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

/** Report C5BBF0E2 — datas YYYY-MM-DD (ISO com T quebra). */
export async function fetchCategorySalesReport(
  params: FetchCategorySalesParams,
): Promise<CategorySalesLine[]> {
  const base = (params.baseUrl ?? millenniumBaseUrl()).replace(/\/$/, "");
  const fetchImpl = params.fetchImpl ?? fetch;
  const body = {
    CATALOG_GUID: CATEGORY_SALES_CATALOG_GUID,
    PARAMETERS_MODEL: [
      {
        SCRIPT: null,
        DATASOURCE: null,
        DATA_DATA_DATA_INTERVAL: 0,
        DATA_DATA_DATA_START: params.from,
        DATA_DATA_DATA_END: params.to,
        PRODUTO_PRODUTO_PRODUTO: null,
        FUNCIONARIO_GERADOR_GERADOR: null,
        PRODUTO_DIVISAO_DIVISAO: null,
        FILIAL_GERADOR_GERADOR: params.geradorId,
        PRODUTO_TIPO_TIPO: params.tipoId ?? null,
      },
    ],
    UNIVERSE_NAME: "millenium.mdu",
    REPORT_FORMAT: "raw",
    PARAMETERS_DESCRIPTION: `Filial=${params.geradorId} Data=${params.from}..${params.to} Tipo=${params.tipoId ?? "all"}`,
  };
  const res = await fetchImpl(`${base}/millenium:wtsreports/reports/process`, {
    method: "POST",
    headers: reportHeaders(params.session, base),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`wtsreports category → ${res.status} ${text.slice(0, 320)}`);
  }
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`wtsreports category JSON inválido: ${text.slice(0, 240)}`);
  }
  return parseCategorySalesRawData(parsed);
}

/** Monta mapa produto→tipo: 1 call filtrada por tipo no período (em paralelo leve). */
export async function buildProductTipoMap(params: {
  session: string;
  geradorId: number;
  from: string;
  to: string;
  tipos: ProductTipo[];
  fetchReport?: typeof fetchCategorySalesReport;
  /** Default 2 — wtsreports + 1 sessão; mais que isso costuma busy. */
  concurrency?: number;
  onTipo?: (info: { done: number; total: number; tipo: ProductTipo }) => void;
}): Promise<Map<number, ProductTipo>> {
  const fetchReport = params.fetchReport ?? fetchCategorySalesReport;
  const map = new Map<number, ProductTipo>();
  const usable = params.tipos.filter((t) => isUsableTipoId(t.id));
  const concurrency = Math.max(1, Math.min(params.concurrency ?? 2, usable.length || 1));
  let done = 0;
  // Parallel local mapPool (inline) — evita import circular com runSyncJob.
  let next = 0;
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= usable.length) return;
      const tipo = usable[i]!;
      try {
        const lines = await fetchReport({
          session: params.session,
          geradorId: params.geradorId,
          from: params.from,
          to: params.to,
          tipoId: tipo.id,
        });
        absorbProductTipoMap(map, lines, tipo);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`  product→tipo map tipo=${tipo.id} (${tipo.name}): ${msg}`);
      }
      done += 1;
      params.onTipo?.({ done, total: usable.length, tipo });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return map;
}
