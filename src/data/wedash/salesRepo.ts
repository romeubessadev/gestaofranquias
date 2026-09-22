import { getSupabase } from "@/lib/supabase";
import type { SalesBrand, SalesDayAgg, SalesHourAgg } from "./salesTypes";

export type SalesDayQuery = {
  tenantId: string;
  /** Empty = all stores for tenant. */
  storeIds: string[];
  from: string;
  to: string;
  brand?: SalesBrand | null;
};

export type SalesHourQuery = {
  tenantId: string;
  storeIds: string[];
  day: string;
  brand?: SalesBrand | null;
};

/** Minimal thenable query surface for unit tests (Supabase-compatible). */
export type SalesQueryClient = {
  from: (table: string) => {
    select: (cols: string) => unknown;
  };
};

type DayRow = {
  tenant_id: string;
  store_id: string;
  day: string;
  brand: SalesBrand;
  revenue_cents: number;
  sales_count: number;
  item_count: number;
};

type HourRow = DayRow & { hour: number };

function mapDay(r: DayRow): SalesDayAgg {
  return {
    tenantId: r.tenant_id,
    storeId: r.store_id,
    day: r.day,
    brand: r.brand,
    revenueCents: Number(r.revenue_cents) || 0,
    salesCount: Number(r.sales_count) || 0,
    itemCount: Number(r.item_count) || 0,
  };
}

function mapHour(r: HourRow): SalesHourAgg {
  return {
    ...mapDay(r),
    hour: Number(r.hour),
  };
}

function clientOrNull(override?: SalesQueryClient): SalesQueryClient | null {
  if (override) return override;
  return getSupabase() as unknown as SalesQueryClient | null;
}

/** Fetch daily aggregates for scope. Empty array when none — never mock R$. */
export async function fetchSalesDayAggs(
  query: SalesDayQuery,
  clientOverride?: SalesQueryClient,
): Promise<SalesDayAgg[]> {
  const client = clientOrNull(clientOverride);
  if (!client) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (client.from("sales_day_agg") as any)
    .select("tenant_id, store_id, day, brand, revenue_cents, sales_count, item_count")
    .eq("tenant_id", query.tenantId)
    .gte("day", query.from)
    .lte("day", query.to);

  if (query.storeIds.length > 0) q = q.in("store_id", query.storeIds);
  if (query.brand) q = q.eq("brand", query.brand);

  const { data, error } = await q.order("day", { ascending: true });
  if (error) {
    console.warn("fetchSalesDayAggs:", error.message ?? error);
    return [];
  }
  return ((data as DayRow[] | null) ?? []).map(mapDay);
}

/** Fetch hourly aggregates for one local day. */
export async function fetchSalesHourAggs(
  query: SalesHourQuery,
  clientOverride?: SalesQueryClient,
): Promise<SalesHourAgg[]> {
  const client = clientOrNull(clientOverride);
  if (!client) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (client.from("sales_hour_agg") as any)
    .select("tenant_id, store_id, day, hour, brand, revenue_cents, sales_count, item_count")
    .eq("tenant_id", query.tenantId)
    .eq("day", query.day);

  if (query.storeIds.length > 0) q = q.in("store_id", query.storeIds);
  if (query.brand) q = q.eq("brand", query.brand);

  const { data, error } = await q.order("hour", { ascending: true });
  if (error) {
    console.warn("fetchSalesHourAggs:", error.message ?? error);
    return [];
  }
  return ((data as HourRow[] | null) ?? []).map(mapHour);
}

/** Tenant watermark of last successful light sync. */
export async function fetchSyncWatermark(
  tenantId: string,
  clientOverride?: SalesQueryClient,
): Promise<Date | null> {
  const client = clientOrNull(clientOverride);
  if (!client) return null;

  // Prefer light watermark; fall back to any successful sync (e.g. onboarding BACKFILL).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("erp_credential") as any)
    .select("last_light_sync_at, last_success_at")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    console.warn("fetchSyncWatermark:", error.message ?? error);
    return null;
  }
  const row = data as {
    last_light_sync_at?: string | null;
    last_success_at?: string | null;
  } | null;
  const raw = row?.last_light_sync_at ?? row?.last_success_at ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function requestForceRefresh(opts: {
  from: string;
  to: string;
  /** Empty / omit = all stores; otherwise only these store UUIDs. */
  storeIds?: string[];
}): Promise<
  | { ok: true; jobId?: string }
  | { ok: false; retryAfterSec?: number; error: string }
> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_unavailable" };
  const { data, error } = await sb.functions.invoke("erp-sync-enqueue", {
    body: {
      action: "force",
      from: opts.from,
      to: opts.to,
      ...(opts.storeIds && opts.storeIds.length > 0 ? { storeIds: opts.storeIds } : {}),
    },
  });

  // Em non-2xx o invoke preenche `error` e às vezes deixa `data` vazio —
  // o JSON real (rate_limited etc.) vem em error.context.
  let body = data as {
    ok?: boolean;
    error?: string;
    retryAfterSec?: number;
    job?: { id?: string };
  } | null;
  if ((!body || typeof body !== "object") && error && typeof error === "object") {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        body = (await ctx.json()) as typeof body;
      } catch {
        /* ignore */
      }
    }
  }

  if (body?.ok === true) {
    const jobId = body.job?.id ? String(body.job.id) : undefined;
    return { ok: true, jobId };
  }
  if (body?.error === "rate_limited" || body?.error === "range_too_large") {
    return {
      ok: false,
      error: body.error,
      retryAfterSec: body.retryAfterSec,
    };
  }
  if (body?.ok === false && body.error) {
    return { ok: false, error: body.error, retryAfterSec: body.retryAfterSec };
  }
  if (error) {
    const msg = error.message ?? "enqueue_failed";
    if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
      return { ok: false, error: "rate_limited", retryAfterSec: 300 };
    }
    return { ok: false, error: msg };
  }
  return { ok: false, error: body?.error ?? "enqueue_failed" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SyncJobWaitResult =
  | { status: "SUCCEEDED" }
  | { status: "FAILED"; error: string | null }
  | { status: "TIMEOUT" }
  | { status: "CANCELLED" };

/**
 * Espera o sync_job chegar em SUCCEEDED/FAILED (poll).
 * FORCE pode demorar (Lista + DetMov); default 12 min.
 */
export async function waitForSyncJob(
  jobId: string,
  opts?: { timeoutMs?: number; pollMs?: number; signal?: AbortSignal },
): Promise<SyncJobWaitResult> {
  const sb = getSupabase();
  if (!sb) return { status: "FAILED", error: "supabase_unavailable" };
  const timeoutMs = opts?.timeoutMs ?? 12 * 60 * 1000;
  const pollMs = opts?.pollMs ?? 2_000;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (opts?.signal?.aborted) return { status: "CANCELLED" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb.from("sync_job") as any)
      .select("status, error")
      .eq("id", jobId)
      .maybeSingle();
    if (error) {
      console.warn("waitForSyncJob:", error.message ?? error);
    } else if (data) {
      const row = data as { status?: string; error?: string | null };
      const st = String(row.status ?? "");
      if (st === "SUCCEEDED") return { status: "SUCCEEDED" };
      if (st === "FAILED" || st === "CANCELLED") {
        return { status: "FAILED", error: row.error ?? null };
      }
    }
    await sleep(pollMs);
  }
  return { status: "TIMEOUT" };
}

/** Fallback quando o enqueue não devolveu jobId — pega o FORCE mais recente do tenant. */
export async function waitForLatestForceJob(
  tenantId: string,
  opts?: { sinceIso?: string; timeoutMs?: number; pollMs?: number; signal?: AbortSignal },
): Promise<SyncJobWaitResult> {
  const sb = getSupabase();
  if (!sb) return { status: "FAILED", error: "supabase_unavailable" };
  const timeoutMs = opts?.timeoutMs ?? 12 * 60 * 1000;
  const pollMs = opts?.pollMs ?? 2_000;
  const started = Date.now();
  const sinceMs = opts?.sinceIso ? new Date(opts.sinceIso).getTime() : 0;

  while (Date.now() - started < timeoutMs) {
    if (opts?.signal?.aborted) return { status: "CANCELLED" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb.from("sync_job") as any)
      .select("id, status, error, created_at")
      .eq("tenant_id", tenantId)
      .eq("kind", "FORCE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("waitForLatestForceJob:", error.message ?? error);
    } else if (data) {
      const row = data as {
        status?: string;
        error?: string | null;
        created_at?: string | null;
      };
      const created = row.created_at ? new Date(row.created_at).getTime() : 0;
      if (!sinceMs || created >= sinceMs - 5_000) {
        const st = String(row.status ?? "");
        if (st === "SUCCEEDED") return { status: "SUCCEEDED" };
        if (st === "FAILED" || st === "CANCELLED") {
          return { status: "FAILED", error: row.error ?? null };
        }
      }
    }
    await sleep(pollMs);
  }
  return { status: "TIMEOUT" };
}

/** Enfileira RANGE para preencher dias faltantes no período (sem forçar hoje). */
export async function requestRangeSync(opts: {
  from: string;
  to: string;
}): Promise<{ ok: true; deduped?: boolean } | { ok: false; error: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_unavailable" };
  const { data, error } = await sb.functions.invoke("erp-sync-enqueue", {
    body: { action: "range", from: opts.from, to: opts.to },
  });
  const body = data as { ok?: boolean; error?: string; deduped?: boolean } | null;
  if (body?.ok) return { ok: true, deduped: body.deduped };
  if (error) return { ok: false, error: error.message ?? "enqueue_failed" };
  return { ok: false, error: body?.error ?? "enqueue_failed" };
}

/** Status do job SEED mais recente (para tela de sincronização). */
export async function fetchLatestSeedJob(
  tenantId: string,
  clientOverride?: SalesQueryClient,
): Promise<{ status: string; error: string | null; finishedAt: string | null; createdAt: string | null } | null> {
  const client = clientOrNull(clientOverride);
  if (!client) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("sync_job") as any)
    .select("status, error, finished_at, created_at")
    .eq("tenant_id", tenantId)
    .in("kind", ["SEED", "BACKFILL"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("fetchLatestSeedJob:", error.message ?? error);
    return null;
  }
  if (!data) return null;
  const row = data as {
    status: string;
    error: string | null;
    finished_at?: string | null;
    created_at?: string | null;
  };
  return {
    status: String(row.status),
    error: row.error ?? null,
    finishedAt: row.finished_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

/**
 * Libera pós-onboarding só quando:
 * 1) SEED mais recente está SUCCEEDED
 * 2) A cobertura em sales_day_agg cobre a janela SEED (mês ant. → hoje)
 *
 * O flag `since` só evita liberar com SEED antigo **sem** cobertura.
 * Se os dias já estão no banco, libera mesmo se o relógio do retry/F5
 * tiver sido bumpado depois do SUCCEEDED (senão a UI fica em “Buscando” pra sempre).
 */
export async function fetchSyncReady(
  tenantId: string,
  opts?: { sinceIso?: string | null; seedFrom?: string; seedTo?: string },
  clientOverride?: SalesQueryClient,
): Promise<boolean> {
  const seed = await fetchLatestSeedJob(tenantId, clientOverride);
  if (!seed || seed.status !== "SUCCEEDED" || !seed.finishedAt) return false;

  const seedFrom = opts?.seedFrom;
  const seedTo = opts?.seedTo;
  if (seedFrom && seedTo) {
    const days = await countSalesDays(tenantId, seedFrom, seedTo, clientOverride);
    const { expectedDays } = seedCoverageWindow(seedTo);
    const minDays = Math.max(2, Math.ceil(expectedDays * 0.9));
    if (days < minDays) return false;

    const cov = await fetchSalesCoverage(tenantId, [], clientOverride);
    if (!cov.from || cov.from > seedFrom) return false;

    return true;
  }

  if (opts?.sinceIso) {
    const finished = new Date(seed.finishedAt).getTime();
    const since = new Date(opts.sinceIso).getTime();
    if (!Number.isNaN(since) && finished < since) return false;
  }

  return true;
}

/** Janela do SEED (início do mês anterior → hoje) + nº de dias do calendário. */
export function seedCoverageWindow(todayIso: string): {
  from: string;
  to: string;
  expectedDays: number;
} {
  const [y, m] = todayIso.split("-").map(Number);
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const from = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const to = todayIso;
  const a = Date.UTC(prevYear, prevMonth - 1, 1);
  const [ty, tm, td] = to.split("-").map(Number);
  const b = Date.UTC(ty, tm - 1, td);
  const expectedDays = Math.floor((b - a) / 86_400_000) + 1;
  return { from, to, expectedDays };
}

/** Dias distintos com venda no período (UI de progresso). */
export async function countSalesDays(
  tenantId: string,
  from: string,
  to: string,
  clientOverride?: SalesQueryClient,
): Promise<number> {
  const client = clientOrNull(clientOverride);
  if (!client) return 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (client.from("sales_day_agg") as any)
    .select("day")
    .eq("tenant_id", tenantId)
    .gte("day", from)
    .lte("day", to);
  const { data, error } = await q;
  if (error) {
    console.warn("countSalesDays:", error.message ?? error);
    return 0;
  }
  const days = new Set<string>();
  for (const r of (data as { day: string }[] | null) ?? []) {
    days.add(String(r.day).slice(0, 10));
  }
  return days.size;
}

/** Cobertura sincronizada (min/max day) — DateRangePicker bloqueia fora disso. */
export async function fetchSalesCoverage(
  tenantId: string,
  storeIds: string[] = [],
  clientOverride?: SalesQueryClient,
): Promise<{ from: string | null; to: string | null }> {
  const client = clientOrNull(clientOverride);
  if (!client) return { from: null, to: null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qMin: any = (client.from("sales_day_agg") as any)
    .select("day")
    .eq("tenant_id", tenantId)
    .order("day", { ascending: true })
    .limit(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qMax: any = (client.from("sales_day_agg") as any)
    .select("day")
    .eq("tenant_id", tenantId)
    .order("day", { ascending: false })
    .limit(1);
  if (storeIds.length > 0) {
    qMin = qMin.in("store_id", storeIds);
    qMax = qMax.in("store_id", storeIds);
  }

  const [minRes, maxRes] = await Promise.all([qMin.maybeSingle(), qMax.maybeSingle()]);
  if (minRes.error) {
    console.warn("fetchSalesCoverage min:", minRes.error.message ?? minRes.error);
    return { from: null, to: null };
  }
  if (maxRes.error) {
    console.warn("fetchSalesCoverage max:", maxRes.error.message ?? maxRes.error);
    return { from: null, to: null };
  }
  const from = minRes.data?.day ? String(minRes.data.day).slice(0, 10) : null;
  const to = maxRes.data?.day ? String(maxRes.data.day).slice(0, 10) : null;
  return { from, to };
}

/** Dias de calendário inclusivos entre from e to (YYYY-MM-DD). */
export function calendarDaysInclusive(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.floor((b - a) / 86_400_000) + 1;
}

/** Meses civis na janela SEED (igual ao worker). */
export function seedMonthWindows(from: string, to: string): Array<{ from: string; to: string }> {
  if (from > to) return [];
  const out: Array<{ from: string; to: string }> = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const wFrom = monthStart < from ? from : monthStart;
    const wTo = monthEnd > to ? to : monthEnd;
    if (wFrom <= wTo) out.push({ from: wFrom, to: wTo });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export type SyncStoreRow = {
  id: string;
  code: string;
  name: string;
};

/** Lojas ativas do tenant (progresso SEED por filial). */
export async function fetchTenantStores(
  tenantId: string,
  clientOverride?: SalesQueryClient,
): Promise<SyncStoreRow[]> {
  const client = clientOrNull(clientOverride);
  if (!client) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("store") as any)
    .select("id, code, trade_name, name")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("code");
  if (error) {
    console.warn("fetchTenantStores:", error.message ?? error);
    return [];
  }
  return ((data as Array<{ id: string; code: string | null; trade_name: string | null; name: string | null }> | null) ?? []).map(
    (r) => ({
      id: r.id,
      code: r.code || "—",
      name: (r.trade_name || r.name || r.code || "Loja").trim(),
    }),
  );
}

/**
 * Cobertura por loja na janela SEED: storeId → set de dias YYYY-MM-DD.
 * Uma query só (poll da SyncingPage).
 */
export async function fetchSeedDaysByStore(
  tenantId: string,
  from: string,
  to: string,
  clientOverride?: SalesQueryClient,
): Promise<Map<string, Set<string>>> {
  const client = clientOrNull(clientOverride);
  const out = new Map<string, Set<string>>();
  if (!client) return out;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("sales_day_agg") as any)
    .select("store_id, day")
    .eq("tenant_id", tenantId)
    .gte("day", from)
    .lte("day", to);
  if (error) {
    console.warn("fetchSeedDaysByStore:", error.message ?? error);
    return out;
  }
  for (const r of (data as { store_id: string; day: string }[] | null) ?? []) {
    const sid = String(r.store_id);
    const day = String(r.day).slice(0, 10);
    let set = out.get(sid);
    if (!set) {
      set = new Set();
      out.set(sid, set);
    }
    set.add(day);
  }
  return out;
}

/** Quantos dias da janela [from,to] já existem no set. */
export function countDaysInWindow(days: Set<string> | undefined, from: string, to: string): number {
  if (!days || days.size === 0) return 0;
  let n = 0;
  for (const d of days) {
    if (d >= from && d <= to) n += 1;
  }
  return n;
}
