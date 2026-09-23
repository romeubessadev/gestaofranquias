/**
 * RELATORIOMARGEM — fonte de CMV (custo de mercadoria).
 * Path UI: MILLENIUM!FRANQUIAS.RELATORIOS.RELATORIOMARGEM
 *
 * CMV v1 = Σ CUSTO_TOTAL (= CUSTO_FRANQUIAS × QTDE_VENDIDA), imposto% = 0.
 * TODO(Configurações>Custos): aplicar imposto_sobre_custo_pct por loja.
 */
import { millenniumBaseUrl } from "./millenniumAuth.ts";
import { milleniumDayBoundIso } from "./millenniumSales.ts";

export const RELATORIO_MARGEM_PATH = "MILLENIUM!FRANQUIAS.RELATORIOS.RELATORIOMARGEM";

/**
 * RELATORIOMARGEM trata DATAI/DATAF como **datas de calendário inclusivas**
 * (UI: Data Inicial → Data Final). Não usar `milleniumDataRange` (DATAF exclusivo
 * da VENDAS.Lista / +1 dia) — isso puxa o dia seguinte e dobra o CMV no somatório
 * dia a dia.
 */
export function milleniumMargemDataRange(
  from: string,
  to: string,
): { datai: string; dataf: string } {
  return {
    datai: milleniumDayBoundIso(from),
    dataf: milleniumDayBoundIso(to),
  };
}

export type MargemLine = {
  codProduto: string;
  qty: number;
  /** Custo unitário fábrica (reais). */
  custoFranquias: number;
  /** CUSTO_TOTAL = custoFranquias × qty (reais). */
  custoTotal: number;
  totalVenda: number;
};

export type FetchRelatorioMargemParams = {
  session: string;
  millenniumStoreId: number;
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

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function asStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  for (const k of ["value", "Value", "data", "Data", "items", "Items", "RAW_DATA"]) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

/** Parse payload → linhas de produto (ignora TOTALVENDA como faturamento). */
export function parseRelatorioMargemPayload(payload: unknown): MargemLine[] {
  const out: MargemLine[] = [];
  for (const raw of extractList(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const cod = asStr(pick(o, "COD_PRODUTO", "cod_produto"));
    const qty = asNum(pick(o, "QTDE_VENDIDA", "qtde_vendida")) ?? 0;
    const custoFranquias = asNum(pick(o, "CUSTO_FRANQUIAS", "custo_franquias")) ?? 0;
    let custoTotal = asNum(pick(o, "CUSTO_TOTAL", "custo_total"));
    if (custoTotal == null) custoTotal = custoFranquias * qty;
    const totalVenda = asNum(pick(o, "TOTALVENDA", "totalvenda")) ?? 0;
    if (!cod && qty === 0 && custoTotal === 0) continue;
    out.push({
      codProduto: cod,
      qty,
      custoFranquias,
      custoTotal,
      totalVenda,
    });
  }
  return out;
}

/** Soma CMV do período em centavos (imposto% = 0 nesta versão). */
export function cmvCentsFromMargemLines(lines: MargemLine[]): number {
  let reais = 0;
  for (const line of lines) {
    reais += line.custoTotal;
  }
  return Math.round(reais * 100);
}

export async function fetchRelatorioMargem(
  params: FetchRelatorioMargemParams,
): Promise<MargemLine[]> {
  const base = (params.baseUrl ?? millenniumBaseUrl()).replace(/\/$/, "");
  const fetchImpl = params.fetchImpl ?? fetch;
  const { datai, dataf } = milleniumMargemDataRange(params.from, params.to);
  const body = {
    FILIAL: params.millenniumStoreId,
    DESC: null,
    DATAI: datai,
    DATAF: dataf,
    TIPO: null,
  };
  const res = await fetchImpl(`${base}/${RELATORIO_MARGEM_PATH}`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      "WTS-Session": params.session,
      "X-DateFormat": "ISOTZ",
      "X-HTTP-Method": "GET",
      "X-IdentifierCase": "upper",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`RELATORIOMARGEM ${params.from}→${params.to} → ${res.status} ${text.slice(0, 240)}`);
  }
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : [];
  } catch {
    throw new Error(`RELATORIOMARGEM JSON inválido: ${text.slice(0, 120)}`);
  }
  return parseRelatorioMargemPayload(parsed);
}
