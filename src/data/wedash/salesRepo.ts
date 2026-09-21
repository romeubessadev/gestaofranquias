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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from("erp_credential") as any)
    .select("last_light_sync_at")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    console.warn("fetchSyncWatermark:", error.message ?? error);
    return null;
  }
  const raw = (data as { last_light_sync_at?: string | null } | null)?.last_light_sync_at;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function requestForceRefresh(): Promise<
  { ok: true } | { ok: false; retryAfterSec?: number; error: string }
> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "supabase_unavailable" };
  const { data, error } = await sb.functions.invoke("erp-sync-enqueue", {
    body: { action: "force_light" },
  });
  if (error) {
    const msg = error.message ?? "enqueue_failed";
    if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
      return { ok: false, error: "rate_limited", retryAfterSec: 300 };
    }
    return { ok: false, error: msg };
  }
  const body = data as { ok?: boolean; error?: string; retryAfterSec?: number } | null;
  if (body && body.ok === false) {
    return {
      ok: false,
      error: body.error ?? "rejected",
      retryAfterSec: body.retryAfterSec,
    };
  }
  return { ok: true };
}
