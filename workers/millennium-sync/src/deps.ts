import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decryptPassword } from "./decrypt.ts";
import { loginMillennium, logoutMillennium, millenniumBaseUrl } from "./millenniumAuth.ts";
import { fetchSalesLista } from "./millenniumSales.ts";
import {
  runSyncJob,
  type SyncCredential,
  type SyncJob,
  type SyncJobDeps,
  type SyncJobKind,
  type SyncStore,
} from "./runSyncJob.ts";
import type { SalesDayAgg, SalesHourAgg } from "../../../src/data/wedash/salesTypes.ts";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function createAdminClient(): SupabaseClient {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function buildDeps(sb: SupabaseClient, erpSecret: string): SyncJobDeps {
  return {
    async hasRunningForCredential(credentialId) {
      const { data, error } = await sb
        .from("sync_job")
        .select("id")
        .eq("credential_id", credentialId)
        .eq("status", "RUNNING")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async markJobRunning(jobId) {
      const { error } = await sb
        .from("sync_job")
        .update({ status: "RUNNING", locked_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("status", "QUEUED");
      if (error) throw error;
    },

    async markJobFinished({ jobId, status, error: errMsg }) {
      const { error } = await sb
        .from("sync_job")
        .update({
          status,
          error: errMsg ?? null,
          finished_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      if (error) throw error;
    },

    async loadCredential(credentialId) {
      const { data, error } = await sb
        .from("erp_credential")
        .select("id, tenant_id, username, password_ciphertext, status")
        .eq("id", credentialId)
        .single();
      if (error || !data) throw error ?? new Error("credential_not_found");
      const password = await decryptPassword(data.password_ciphertext as string, erpSecret);
      return {
        id: data.id as string,
        tenantId: data.tenant_id as string,
        username: data.username as string,
        password,
        status: data.status as SyncCredential["status"],
      };
    },

    async listStores(tenantId) {
      const { data, error } = await sb
        .from("store")
        .select("id, millennium_store_id, timezone")
        .eq("tenant_id", tenantId)
        .eq("active", true)
        .order("millennium_store_id");
      if (error) throw error;
      return ((data ?? []) as Array<{ id: string; millennium_store_id: number; timezone: string }>).map(
        (r): SyncStore => ({
          id: r.id,
          millenniumStoreId: r.millennium_store_id,
          timezone: r.timezone || "America/Campo_Grande",
        }),
      );
    },

    login: loginMillennium,
    logout: logoutMillennium,

    async fetchSalesLista(params) {
      return fetchSalesLista({
        ...params,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async upsertDayAggs(rows: SalesDayAgg[]) {
      if (rows.length === 0) return;
      const payload = rows.map((r) => ({
        tenant_id: r.tenantId,
        store_id: r.storeId,
        day: r.day,
        brand: r.brand,
        revenue_cents: r.revenueCents,
        sales_count: r.salesCount,
        item_count: r.itemCount,
      }));
      const { error } = await sb.from("sales_day_agg").upsert(payload, {
        onConflict: "tenant_id,store_id,day,brand",
      });
      if (error) throw error;
    },

    async upsertHourAggs(rows: SalesHourAgg[]) {
      if (rows.length === 0) return;
      const payload = rows.map((r) => ({
        tenant_id: r.tenantId,
        store_id: r.storeId,
        day: r.day,
        hour: r.hour,
        brand: r.brand,
        revenue_cents: r.revenueCents,
        sales_count: r.salesCount,
        item_count: r.itemCount,
      }));
      const { error } = await sb.from("sales_hour_agg").upsert(payload, {
        onConflict: "tenant_id,store_id,day,hour,brand",
      });
      if (error) throw error;
    },

    async insertSyncRun(args) {
      const { error } = await sb.from("sync_run").insert({
        tenant_id: args.tenantId,
        credential_id: args.credentialId,
        kind: args.kind,
        ok: args.ok,
        stores_done: args.storesDone,
        error: args.error ?? null,
        started_at: args.startedAt.toISOString(),
        finished_at: args.finishedAt.toISOString(),
      });
      if (error) throw error;
    },

    async updateCredential(args) {
      const patch: Record<string, unknown> = {};
      if (args.status) patch.status = args.status;
      if (args.lastError !== undefined) patch.last_error = args.lastError;
      if (args.lastErrorAt) patch.last_error_at = args.lastErrorAt.toISOString();
      if (args.lastSuccessAt) patch.last_success_at = args.lastSuccessAt.toISOString();
      if (args.lastLightSyncAt) patch.last_light_sync_at = args.lastLightSyncAt.toISOString();
      if (Object.keys(patch).length === 0) return;
      const { error } = await sb.from("erp_credential").update(patch).eq("id", args.credentialId);
      if (error) throw error;
    },

    now: () => new Date(),
  };
}

/** Peek oldest QUEUED job; runSyncJob flips it to RUNNING. */
export async function claimNextJob(sb: SupabaseClient): Promise<SyncJob | null> {
  const { data: row, error } = await sb
    .from("sync_job")
    .select("id, tenant_id, credential_id, kind, status")
    .eq("status", "QUEUED")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    credentialId: row.credential_id as string,
    kind: row.kind as SyncJobKind,
    status: "QUEUED",
  };
}

/**
 * Enqueue LIGHT for credentials due (interval elapsed, no open job).
 * Runs after processing claimed jobs so force/backfill stay priority.
 */
export async function enqueueDueLightJobs(sb: SupabaseClient): Promise<number> {
  const { data: creds, error } = await sb
    .from("erp_credential")
    .select("id, tenant_id, light_interval_min, last_light_sync_at, status")
    .eq("status", "VALID");
  if (error) throw error;

  let enqueued = 0;
  const now = Date.now();

  for (const c of creds ?? []) {
    const intervalMin = Number(c.light_interval_min) || 30;
    const last = c.last_light_sync_at ? new Date(c.last_light_sync_at as string).getTime() : 0;
    const due = !last || now - last >= intervalMin * 60_000;
    if (!due) continue;

    const { data: open } = await sb
      .from("sync_job")
      .select("id")
      .eq("credential_id", c.id)
      .in("status", ["QUEUED", "RUNNING"])
      .limit(1)
      .maybeSingle();
    if (open) continue;

    const { error: insErr } = await sb.from("sync_job").insert({
      tenant_id: c.tenant_id,
      credential_id: c.id,
      kind: "LIGHT",
      status: "QUEUED",
      payload: {},
    });
    if (!insErr) enqueued += 1;
  }
  return enqueued;
}

export async function processOneJob(sb: SupabaseClient, erpSecret: string): Promise<boolean> {
  const job = await claimNextJob(sb);
  if (!job) return false;

  const deps = buildDeps(sb, erpSecret);
  console.log(`[sync] start job=${job.id} kind=${job.kind} tenant=${job.tenantId}`);
  const result = await runSyncJob(job, deps);
  console.log(`[sync] done job=${job.id}`, result);
  return true;
}
