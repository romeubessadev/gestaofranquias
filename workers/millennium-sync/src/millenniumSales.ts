import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";

export type FetchSalesListaParams = {
  session: string;
  /** WeDash store.id (uuid) stamped on each SaleRow. */
  storeId: string;
  /** Millennium FILIAL / COD. */
  millenniumStoreId: number;
  /** Inclusive local calendar bounds YYYY-MM-DD (passed as DATAI/DATAF). */
  from: string;
  to: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

function pick(o: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null) return o[k];
  }
  const lower = Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toLowerCase(), v]));
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function asStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  for (const k of ["value", "Value", "data", "Data", "items", "Items"]) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  if (typeof o.value === "string") {
    try {
      const inner = JSON.parse(o.value);
      if (Array.isArray(inner)) return inner;
    } catch {
      /* ignore */
    }
  }
  return [];
}

function reaisToCents(v: unknown): number {
  const n = asNum(v);
  if (n == null) return 0;
  return Math.round(n * 100);
}

function parseDataH(v: unknown): Date | null {
  const s = asStr(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Map anonymized / live VENDAS.Lista JSON → SaleRow[]. */
export function mapVendasListaPayload(
  payload: unknown,
  opts: { storeId: string },
): SaleRow[] {
  const out: SaleRow[] = [];
  for (const raw of extractList(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const operationCode = asStr(pick(o, "COD_OPERACAO", "cod_operacao"));
    const occurredAt = parseDataH(pick(o, "DATA_H", "data_h"));
    if (!operationCode || !occurredAt) continue;
    out.push({
      operationCode,
      occurredAt,
      revenueCents: reaisToCents(pick(o, "VALOR_FINAL", "valor_final")),
      itemQty: asNum(pick(o, "QUANTIDADE", "quantidade")) ?? 0,
      storeId: opts.storeId,
      brand: "ALL",
    });
  }
  return out;
}

function defaultBaseUrl(): string {
  return (process.env.MILLENNIUM_API_BASE ?? "http://127.0.0.1:6017/api").replace(/\/$/, "");
}

/**
 * GET millenium VENDAS.Lista for one store/window.
 * Paths tried: VENDAS.Lista variants used by WTS clients.
 */
export async function fetchSalesLista(params: FetchSalesListaParams): Promise<SaleRow[]> {
  const base = (params.baseUrl ?? defaultBaseUrl()).replace(/\/$/, "");
  const fetchImpl = params.fetchImpl ?? fetch;
  const q = new URLSearchParams({
    $format: "json",
    $dateformat: "iso",
    DATAI: params.from,
    DATAF: params.to,
    FILIAL: String(params.millenniumStoreId),
    CANCELADA: "false",
    GERADOR: "C",
    GERADOR_COM: "V",
  });
  const paths = ["VENDAS.Lista", "millenium.vendas.lista", "Millennium.VENDAS.Lista"];
  let lastErr = "";

  for (const path of paths) {
    const url = `${base}/${path}?${q.toString()}`;
    try {
      const res = await fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "WTS-Session": params.session,
        },
      });
      const raw = await res.text();
      if (!res.ok) {
        lastErr = `GET ${path} → ${res.status} ${raw.slice(0, 240)}`;
        continue;
      }
      const parsed = raw ? JSON.parse(raw) : [];
      return mapVendasListaPayload(parsed, { storeId: params.storeId });
    } catch (e) {
      lastErr = `GET ${path} → ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  throw new Error(lastErr || "VENDAS.Lista failed");
}
