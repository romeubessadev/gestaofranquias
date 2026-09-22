/**
 * Mapa PRODUTO (id interno) → WEPINK | WPINK via wtsreports CATALOG {9701602B…}.
 * ConsultaDetMov usa PRODUTO int; ESTOQUEEMCOMPRA só traz COD_PRODUTO.
 */
import type { SalesBrand } from "../../../src/data/wedash/salesTypes.ts";
import { millenniumBaseUrl } from "./millenniumAuth.ts";

export const PRODUCT_DIVISION_CATALOG_GUID = "{9701602B-B363-4770-989C-8C4459B7E105}";

/** WPINK SUPLEMENTOS */
export const DIVISAO_WPINK = 101;
/** WEPINK (cosméticos) */
export const DIVISAO_WEPINK = 102;

export type ProductBrandMap = Map<number, SalesBrand>;

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

function extractRawData(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  if (Array.isArray(o.RAW_DATA)) return o.RAW_DATA;
  for (const k of ["value", "Value", "data", "Data"]) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

/** Parse RAW_DATA → productId ints (ignora custo / estoque). */
export function parseProductDivisionRawData(payload: unknown): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  for (const raw of extractRawData(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const v = o.PRODUTO_PRODUTO_PRODUTO ?? o.produto_produto_produto;
    const id =
      typeof v === "number" && Number.isFinite(v)
        ? v
        : typeof v === "string" && /^\d+$/.test(v.trim())
          ? Number(v.trim())
          : null;
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function mergeProductBrandMaps(
  parts: Array<{ brand: SalesBrand; productIds: number[] }>,
): ProductBrandMap {
  const map: ProductBrandMap = new Map();
  for (const part of parts) {
    for (const id of part.productIds) {
      // última divisão ganha se houver overlap (não esperado)
      map.set(id, part.brand);
    }
  }
  return map;
}

async function fetchDivisionProducts(opts: {
  session: string;
  geradorId: number;
  divisao: number;
  baseUrl: string;
  fetchImpl: typeof fetch;
}): Promise<number[]> {
  const body = {
    CATALOG_GUID: PRODUCT_DIVISION_CATALOG_GUID,
    PARAMETERS_MODEL: [
      {
        SCRIPT: null,
        DATASOURCE: null,
        TABELA_DE_CUSTO: null,
        FILIAL_GERADOR_GERADOR: `(${opts.geradorId})`,
        PRODUTO_DIVISAO_DIVISAO: opts.divisao,
      },
    ],
    UNIVERSE_NAME: "millenium.mdu",
    REPORT_FORMAT: "raw",
    PARAMETERS_DESCRIPTION: `Filial=(${opts.geradorId}) Divisao=${opts.divisao}`,
  };
  const res = await opts.fetchImpl(`${opts.baseUrl}/millenium:wtsreports/reports/process`, {
    method: "POST",
    headers: reportHeaders(opts.session, opts.baseUrl),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`product division ${opts.divisao} → ${res.status} ${text.slice(0, 280)}`);
  }
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`product division JSON inválido: ${text.slice(0, 200)}`);
  }
  return parseProductDivisionRawData(parsed);
}

/**
 * N geradores → Map<PRODUTO, marca> (união — loja sem WPINK no estoque ainda contribui ids).
 */
export async function fetchProductBrandMap(opts: {
  session: string;
  /** Um ou mais geradores; produtos são união (cadastro/estoque varia por loja). */
  geradorIds: number[];
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<ProductBrandMap> {
  const ids = [...new Set(opts.geradorIds.filter((n) => Number.isFinite(n)))];
  if (ids.length === 0) return new Map();
  const base = (opts.baseUrl ?? millenniumBaseUrl()).replace(/\/$/, "");
  const fetchImpl = opts.fetchImpl ?? fetch;

  const parts = await Promise.all(
    ids.flatMap((geradorId) => [
      fetchDivisionProducts({
        session: opts.session,
        geradorId,
        divisao: DIVISAO_WPINK,
        baseUrl: base,
        fetchImpl,
      }).then((productIds) => ({ brand: "WPINK" as const, productIds })),
      fetchDivisionProducts({
        session: opts.session,
        geradorId,
        divisao: DIVISAO_WEPINK,
        baseUrl: base,
        fetchImpl,
      }).then((productIds) => ({ brand: "WEPINK" as const, productIds })),
    ]),
  );
  return mergeProductBrandMaps(parts);
}
