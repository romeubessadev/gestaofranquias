import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";

export type FetchSalesListaParams = {
  session: string;
  /** WeDash store.id (uuid) stamped on each SaleRow. Empty when FILIAL is null (partition later). */
  storeId: string;
  /**
   * Millennium FILIAL / COD.
   * `null` / omitted = all stores (allowed only for a single calendar day).
   */
  millenniumStoreId?: number | null;
  /** Inclusive local calendar bounds YYYY-MM-DD. */
  from: string;
  to: string;
  /**
   * EVENTO ids from EVENTOS.ListaTodos (sales whitelist).
   * Sent as EVENTO: "(17,24,…)". Required for BI-parity faturamento.
   */
  eventoIds: number[];
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

/** Sale row plus Millennium FILIAL from the Lista payload (for all-stores partition). */
export type SaleRowWithFilial = SaleRow & {
  millenniumFilial: number | null;
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

/** Add Δ days to YYYY-MM-DD (calendar, not TZ-shifted). */
export function addDaysYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return utc.toISOString().slice(0, 10);
}

/**
 * Local calendar day → Millennium bound at MS midnight (UTC−4 → T04:00:00.000Z).
 * DATAF in the UI is exclusive (next local midnight).
 */
export function milleniumDayBoundIso(ymd: string): string {
  return `${ymd}T04:00:00.000Z`;
}

/** Inclusive [from,to] → UI DATAI / exclusive DATAF. */
export function milleniumDataRange(from: string, to: string): { datai: string; dataf: string } {
  return {
    datai: milleniumDayBoundIso(from),
    dataf: milleniumDayBoundIso(addDaysYmd(to, 1)),
  };
}

/** Map anonymized / live VENDAS.Lista JSON → SaleRow[] (keeps Millennium FILIAL). */
export function mapVendasListaPayload(
  payload: unknown,
  opts: { storeId: string },
): SaleRowWithFilial[] {
  const out: SaleRowWithFilial[] = [];
  for (const raw of extractList(payload)) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const operationCode = asStr(pick(o, "COD_OPERACAO", "cod_operacao"));
    const occurredAt = parseDataH(pick(o, "DATA_H", "data_h"));
    if (!operationCode || !occurredAt) continue;
    const millenniumFilial = asNum(pick(o, "FILIAL", "filial", "COD_FILIAL", "cod_filial"));
    out.push({
      operationCode,
      occurredAt,
      revenueCents: reaisToCents(pick(o, "VALOR_FINAL", "valor_final")),
      itemQty: asNum(pick(o, "QUANTIDADE", "quantidade")) ?? 0,
      storeId: opts.storeId,
      brand: "ALL",
      millenniumFilial,
    });
  }
  return out;
}

/**
 * Split all-stores Lista rows by Millennium FILIAL → WeDash storeId.
 * Rows whose FILIAL is missing or unknown are dropped.
 */
export function partitionRowsByFilial(
  rows: SaleRowWithFilial[],
  storesByMillenniumId: Map<number, { id: string }>,
): Map<string, SaleRow[]> {
  const out = new Map<string, SaleRow[]>();
  for (const row of rows) {
    if (row.millenniumFilial == null) continue;
    const store = storesByMillenniumId.get(row.millenniumFilial);
    if (!store) continue;
    const { millenniumFilial: _f, ...sale } = row;
    const stamped: SaleRow = { ...sale, storeId: store.id };
    const list = out.get(store.id);
    if (list) list.push(stamped);
    else out.set(store.id, [stamped]);
  }
  return out;
}

function defaultBaseUrl(): string {
  return (process.env.MILLENNIUM_API_BASE ?? "http://127.0.0.1:6017/api").replace(/\/$/, "");
}

function uiBody(params: FetchSalesListaParams) {
  const { datai, dataf } = milleniumDataRange(params.from, params.to);
  const filial = params.millenniumStoreId ?? null;
  return {
    EVENTO: `(${params.eventoIds.join(",")})`,
    DATAI: datai,
    DATAF: dataf,
    FILIAL: filial,
    DOCUMENTO: null,
    CANCELADA: false,
    GERADOR: "C",
    COD: null,
    ORDEM: 0,
    CONTA: null,
    NOTAI: null,
    NOTAF: null,
    TIPO_PAGTO: null,
    CONDICAO: null,
    EMBARQUE: null,
    N_DOCEXTERNO: null,
    VENDEDOR: null,
    PEDIDOREF: null,
    FILIAL_DESTINO: null,
    PRODUCAO: null,
    CONFERIDO: null,
    TIPO_PEDIDO: null,
    COD_PEDIDO: null,
    PEDIDO: false,
    GRUPO_LOJA: null,
    NUMERO_CARTAO: null,
    GERADOR_COM: "V",
    COD_COM: null,
    LIM_CRED_MOV_EXCEDEU: null,
    LIM_CRED_EX_VLR_INI: null,
    LIM_CRED_EX_VLR_FIM: null,
    NUMERO_PREFAT: null,
    PREFATURAMENTO: false,
    COD_VOLUME: null,
    ENTREGA_CONFIRMADA: null,
    VOID: null,
  };
}

type Attempt = {
  label: string;
  url: string;
  init: RequestInit;
};

/**
 * millenium.VENDAS.Lista — HTTP POST with JSON body (curl --data-raw).
 * Browser also sends X-HTTP-Method: GET; we try both header variants.
 *
 * `millenniumStoreId: null` = all stores; only allowed when from === to (1 day).
 */
export async function fetchSalesLista(params: FetchSalesListaParams): Promise<SaleRowWithFilial[]> {
  if (!params.eventoIds.length) {
    throw new Error("VENDAS.Lista requires eventoIds (sales event whitelist)");
  }
  const allStores = params.millenniumStoreId == null;
  if (allStores && params.from !== params.to) {
    throw new Error("VENDAS.Lista without FILIAL requires a single-day window");
  }

  const base = (params.baseUrl ?? defaultBaseUrl()).replace(/\/$/, "");
  const fetchImpl = params.fetchImpl ?? fetch;
  const timeoutMs = Number(process.env.MILLENNIUM_FETCH_TIMEOUT_MS ?? "180000") || 180_000;
  const session = params.session;
  const body = uiBody(params);
  const bodyJson = JSON.stringify(body);
  const { datai, dataf } = milleniumDataRange(params.from, params.to);
  const evento = `(${params.eventoIds.join(",")})`;

  const origin = base.replace(/\/api\/?$/, "");

  const browserHeaders = (xHttpMethod: string | null): Record<string, string> => {
    const h: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
      Origin: origin,
      Referer: `${origin}/files/web-apps/millennium.html`,
      "X-DateFormat": "ISOTZ",
      "X-IdentifierCase": "upper",
      "WTS-Session": session,
    };
    if (xHttpMethod) h["X-HTTP-Method"] = xHttpMethod;
    return h;
  };

  const attempts: Attempt[] = [];
  const path = "millenium.VENDAS.Lista";
  const url = `${base}/${path}`;

  // 1) Exact browser curl: POST + X-HTTP-Method: GET
  attempts.push({
    label: "POST+X-HTTP-Method:GET",
    url,
    init: {
      method: "POST",
      headers: browserHeaders("GET"),
      body: bodyJson,
      signal: AbortSignal.timeout(timeoutMs),
    },
  });

  // 2) Plain POST (no X-HTTP-Method) — some WTS builds treat body as POST only
  attempts.push({
    label: "POST",
    url,
    init: {
      method: "POST",
      headers: browserHeaders(null),
      body: bodyJson,
      signal: AbortSignal.timeout(timeoutMs),
    },
  });

  // 3) Query-string GET fallback (worked for unfiltered sync on this host)
  const q = new URLSearchParams({
    $format: "json",
    $dateformat: "iso",
    DATAI: datai,
    DATAF: dataf,
    CANCELADA: "false",
    GERADOR: "C",
    GERADOR_COM: "V",
    EVENTO: evento,
  });
  if (params.millenniumStoreId != null) {
    q.set("FILIAL", String(params.millenniumStoreId));
  }
  attempts.push({
    label: "GET query",
    url: `${base}/${path}?${q.toString()}`,
    init: {
      method: "GET",
      headers: {
        Accept: "application/json",
        "WTS-Session": session,
      },
      signal: AbortSignal.timeout(timeoutMs),
    },
  });

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      const res = await fetchImpl(attempt.url, attempt.init);
      const raw = await res.text();
      if (!res.ok) {
        errors.push(`${attempt.label} → ${res.status} ${raw.slice(0, 160)}`);
        continue;
      }
      const parsed = raw ? JSON.parse(raw) : [];
      const rows = mapVendasListaPayload(parsed, { storeId: params.storeId });
      const multiDay = params.from !== params.to;
      if (multiDay && rows.length === 0) {
        console.warn(
          `[sync] VENDAS.Lista VAZIO em range ${params.from}→${params.to} via ${attempt.label} · raw=${raw.length}b · preview=${raw.slice(0, 120).replace(/\s+/g, " ")}`,
        );
      } else {
        console.log(
          `[sync] VENDAS.Lista ok via ${attempt.label} · ${params.from}→${params.to}` +
            `${allStores ? " · FILIAL=null" : ""} · ${rows.length} linha(s)`,
        );
      }
      return rows;
    } catch (e) {
      errors.push(`${attempt.label} → ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(errors.join(" | ") || "VENDAS.Lista failed");
}
