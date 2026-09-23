import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { decryptPassword } from "./decrypt.ts";
import { loginMillennium, logoutMillennium, millenniumBaseUrl } from "./millenniumAuth.ts";
import {
  fetchEventosListaTodos,
  resolveSalesEventIds,
} from "./millenniumEvents.ts";
import { fetchSalesLista } from "./millenniumSales.ts";
import { fetchFilialGeradorMap, fetchBrandRevenueReport } from "./millenniumBrandReport.ts";
import { fetchConsultaDetMov } from "./millenniumDetMov.ts";
import { fetchRelatorioMargem } from "./millenniumMargem.ts";
import {
  fetchCategorySalesReport,
  fetchProductTipos,
} from "./millenniumCategoryReport.ts";
import { fetchProductBrandMap } from "./millenniumProductDivision.ts";
import {
  nextHistoryWindow,
  runSyncJob,
  seedWindow,
  ymdInTz,
  type SyncCredential,
  type SyncJob,
  type SyncJobDeps,
  type SyncJobKind,
  type SyncStore,
} from "./runSyncJob.ts";
import type {
  SalesCategoryDayAgg,
  SalesDayAgg,
  SalesHourAgg,
  SalesPaymentDayAgg,
} from "../../../src/data/wedash/salesTypes.ts";

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
  let eventsCache: import("./millenniumEvents.ts").MillenniumEvent[] | null = null;

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
        .select("id, millennium_store_id, code, timezone, opened_at")
        .eq("tenant_id", tenantId)
        .eq("active", true)
        .order("millennium_store_id");
      if (error) throw error;
      return ((data ?? []) as Array<{
        id: string;
        millennium_store_id: number;
        code: string | null;
        timezone: string;
        opened_at: string | null;
      }>).map(
        (r): SyncStore => ({
          id: r.id,
          millenniumStoreId: r.millennium_store_id,
          code: r.code || String(r.millennium_store_id).padStart(5, "0"),
          timezone: r.timezone || "America/Campo_Grande",
          openedAt: r.opened_at ? String(r.opened_at).slice(0, 10) : null,
        }),
      );
    },

    async listExistingDays({ tenantId, storeId, from, to }) {
      const { data, error } = await sb
        .from("sales_day_agg")
        .select("day")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .gte("day", from)
        .lte("day", to);
      if (error) throw error;
      const days = new Set<string>();
      for (const r of data ?? []) {
        const d = String((r as { day: string }).day).slice(0, 10);
        if (d) days.add(d);
      }
      return [...days];
    },

    async listDaysWithCmv({ tenantId, storeId, from, to }) {
      const { data, error } = await sb
        .from("sales_day_agg")
        .select("day")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .eq("brand", "ALL")
        .not("cmv_cents", "is", null)
        .gte("day", from)
        .lte("day", to);
      if (error) throw error;
      const days = new Set<string>();
      for (const r of data ?? []) {
        const d = String((r as { day: string }).day).slice(0, 10);
        if (d) days.add(d);
      }
      return [...days];
    },

    async listDaysWithCategory({ tenantId, storeId, from, to }) {
      const { data, error } = await sb
        .from("sales_category_day_agg")
        .select("day")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .gte("day", from)
        .lte("day", to);
      if (error) throw error;
      const days = new Set<string>();
      for (const r of data ?? []) {
        const d = String((r as { day: string }).day).slice(0, 10);
        if (d) days.add(d);
      }
      return [...days];
    },

    async earliestSalesDay({ tenantId, storeId }) {
      const { data, error } = await sb
        .from("sales_day_agg")
        .select("day")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .order("day", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return String((data as { day: string }).day).slice(0, 10);
    },

    login: loginMillennium,
    logout: logoutMillennium,

    async resolveEventoIds(session, codFilial) {
      if (!eventsCache) {
        eventsCache = await fetchEventosListaTodos({
          session,
          baseUrl: millenniumBaseUrl(),
        });
      }
      return resolveSalesEventIds(eventsCache, codFilial);
    },

    async fetchSalesLista(params) {
      return fetchSalesLista({
        ...params,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchFilialGeradorMap(session) {
      return fetchFilialGeradorMap({
        session,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchProductBrandMap(params) {
      return fetchProductBrandMap({
        session: params.session,
        geradorIds: params.geradorIds,
        stores: params.stores,
        from: params.from,
        to: params.to,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchBrandRevenueReport(params) {
      return fetchBrandRevenueReport({
        session: params.session,
        geradorIds: params.geradorIds,
        from: params.from,
        to: params.to,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchConsultaDetMov(params) {
      return fetchConsultaDetMov({
        session: params.session,
        codOperacao: params.codOperacao,
        nf: params.nf,
        tipoOperacao: params.tipoOperacao,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchRelatorioMargem(params) {
      return fetchRelatorioMargem({
        session: params.session,
        millenniumStoreId: params.millenniumStoreId,
        from: params.from,
        to: params.to,
        baseUrl: millenniumBaseUrl(),
      });
    },

    async fetchProductTipos(session) {
      return fetchProductTipos({ session, baseUrl: millenniumBaseUrl() });
    },

    async fetchCategorySalesReport(params) {
      return fetchCategorySalesReport({
        session: params.session,
        geradorId: params.geradorId,
        from: params.from,
        to: params.to,
        tipoId: params.tipoId,
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
        // cmv_cents omitido de propósito — patchDayCmv; upsert não zera CMV.
      }));
      const { error } = await sb.from("sales_day_agg").upsert(payload, {
        onConflict: "tenant_id,store_id,day,brand",
      });
      if (error) throw error;
    },

    async patchDayCmv(rows) {
      if (rows.length === 0) return;
      for (const r of rows) {
        const { error } = await sb
          .from("sales_day_agg")
          .update({ cmv_cents: r.cmvCents })
          .eq("tenant_id", r.tenantId)
          .eq("store_id", r.storeId)
          .eq("day", r.day)
          .eq("brand", "ALL");
        if (error) throw error;
        // Se ainda não existe linha ALL (dia sem Lista), cria stub com CMV.
        const { data: existing } = await sb
          .from("sales_day_agg")
          .select("day")
          .eq("tenant_id", r.tenantId)
          .eq("store_id", r.storeId)
          .eq("day", r.day)
          .eq("brand", "ALL")
          .maybeSingle();
        if (!existing) {
          const { error: insErr } = await sb.from("sales_day_agg").insert({
            tenant_id: r.tenantId,
            store_id: r.storeId,
            day: r.day,
            brand: "ALL",
            revenue_cents: 0,
            sales_count: 0,
            item_count: 0,
            cmv_cents: r.cmvCents,
          });
          if (insErr) throw insErr;
        }
      }
    },

    async upsertCategoryDayAggs(rows: SalesCategoryDayAgg[]) {
      if (rows.length === 0) return;
      const payload = rows.map((r) => ({
        tenant_id: r.tenantId,
        store_id: r.storeId,
        day: r.day,
        category_id: r.categoryId,
        category_name: r.categoryName,
        brand: r.brand,
        revenue_cents: r.revenueCents,
        item_count: r.itemCount,
      }));
      const { error } = await sb.from("sales_category_day_agg").upsert(payload, {
        onConflict: "tenant_id,store_id,day,category_id",
      });
      if (error) throw error;
    },

    async replacePaymentDayAggs(args: {
      tenantId: string;
      storeId: string;
      from: string;
      to: string;
      rows: SalesPaymentDayAgg[];
    }) {
      const { error: delErr } = await sb
        .from("sales_payment_day_agg")
        .delete()
        .eq("tenant_id", args.tenantId)
        .eq("store_id", args.storeId)
        .gte("day", args.from)
        .lte("day", args.to);
      if (delErr) throw delErr;
      if (args.rows.length === 0) return;
      const payload = args.rows.map((r) => ({
        tenant_id: r.tenantId,
        store_id: r.storeId,
        day: r.day,
        payment_method: r.paymentMethod,
        brand: r.brand,
        revenue_cents: r.revenueCents,
        sales_count: r.salesCount,
      }));
      const { error } = await sb.from("sales_payment_day_agg").upsert(payload, {
        onConflict: "tenant_id,store_id,day,payment_method",
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

    async setStoresHasWpink(rows) {
      for (const r of rows) {
        const { error } = await sb
          .from("store")
          .update({ has_wpink: r.hasWpink })
          .eq("id", r.storeId);
        if (error) throw error;
      }
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

    async getStoredSession(credentialId) {
      const { data, error } = await sb
        .from("erp_credential")
        .select("millennium_session")
        .eq("id", credentialId)
        .maybeSingle();
      if (error) throw error;
      const s = (data as { millennium_session?: string | null } | null)?.millennium_session;
      return typeof s === "string" && s.length > 0 ? s : null;
    },

    async setStoredSession(credentialId, session) {
      const { error } = await sb
        .from("erp_credential")
        .update(
          session
            ? {
                millennium_session: session,
                millennium_session_at: new Date().toISOString(),
                millennium_session_by: "worker",
              }
            : {
                millennium_session: null,
                millennium_session_at: null,
                millennium_session_by: null,
              },
        )
        .eq("id", credentialId);
      if (error) throw error;
    },

    async enqueueHistoryFollowUp({ tenantId, credentialId }) {
      // MVP: só SEED (mês ant. → hoje). Histórico maior sob demanda (HISTORY_AFTER_SEED=1).
      if (process.env.HISTORY_AFTER_SEED !== "1") return false;

      // Tenant ainda no onboarding? Não enfileira histórico.
      const { data: onboarding } = await sb
        .from("membership")
        .select("id")
        .eq("tenant_id", tenantId)
        .not("onboarding_step", "is", null)
        .limit(1)
        .maybeSingle();
      if (onboarding) return false;

      // Já tem HISTORY na fila? Não duplica.
      const { data: open } = await sb
        .from("sync_job")
        .select("id")
        .eq("credential_id", credentialId)
        .eq("kind", "HISTORY")
        .eq("status", "QUEUED")
        .limit(1)
        .maybeSingle();
      if (open) return false;

      const { data: storeRows, error: storeErr } = await sb
        .from("store")
        .select("id, timezone, opened_at")
        .eq("tenant_id", tenantId)
        .eq("active", true);
      if (storeErr) throw storeErr;

      const now = new Date();
      let needs = false;
      for (const row of storeRows ?? []) {
        const tz = (row.timezone as string) || "America/Campo_Grande";
        const today = ymdInTz(now, tz);
        const { from: seedFrom } = seedWindow(today);
        const storeId = row.id as string;
        const { data: earliestRow } = await sb
          .from("sales_day_agg")
          .select("day")
          .eq("tenant_id", tenantId)
          .eq("store_id", storeId)
          .order("day", { ascending: true })
          .limit(1)
          .maybeSingle();
        const earliest = earliestRow
          ? String((earliestRow as { day: string }).day).slice(0, 10)
          : null;
        const openedAt = row.opened_at ? String(row.opened_at).slice(0, 10) : null;
        const win = nextHistoryWindow({
          today,
          openedAt,
          earliestExisting: earliest,
          seedFrom,
        });
        if (win) {
          needs = true;
          break;
        }
      }
      if (!needs) return false;

      const { error } = await sb.from("sync_job").insert({
        tenant_id: tenantId,
        credential_id: credentialId,
        kind: "HISTORY",
        status: "QUEUED",
        payload: {},
      });
      if (error) throw error;
      return true;
    },

    now: () => new Date(),
  };
}

/** Peek oldest QUEUED job whose credential is connected and has no RUNNING job. */
export async function claimNextJob(sb: SupabaseClient): Promise<SyncJob | null> {
  const { data: rows, error } = await sb
    .from("sync_job")
    .select("id, tenant_id, credential_id, kind, status, payload")
    .eq("status", "QUEUED")
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) throw error;
  if (!rows?.length) return null;

  for (const row of rows) {
    const credentialId = row.credential_id as string;

    const { data: running } = await sb
      .from("sync_job")
      .select("id")
      .eq("credential_id", credentialId)
      .eq("status", "RUNNING")
      .limit(1)
      .maybeSingle();
    if (running) continue;

    const { data: cred } = await sb
      .from("erp_credential")
      .select("sync_paused")
      .eq("id", credentialId)
      .maybeSingle();
    if (!isIntegrationActive(cred as { sync_paused?: boolean } | null)) continue;

    const payload = (row.payload ?? {}) as {
      from?: string;
      to?: string;
      storeIds?: unknown;
    };
    const storeIds = Array.isArray(payload.storeIds)
      ? payload.storeIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : undefined;
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      credentialId,
      kind: row.kind as SyncJobKind,
      status: "QUEUED",
      payload: {
        from: typeof payload.from === "string" ? payload.from : undefined,
        to: typeof payload.to === "string" ? payload.to : undefined,
        ...(storeIds && storeIds.length > 0 ? { storeIds } : {}),
      },
    };
  }
  return null;
}

/**
 * Integração ERP ativa = não pausada.
 * Presença WeDash NÃO é exigida (HISTORY pode rodar com app fechado).
 */
export function isIntegrationActive(
  cred: { sync_paused?: boolean | null } | null | undefined,
): boolean {
  return !cred?.sync_paused;
}

/**
 * No boot: limpa RUNNING órfãos e cancela fila de tenants ainda no onboarding.
 * Evita worker brigar com a sessão do wizard (busy / onboarding preso).
 */
export async function disconnectTenantSessions(
  sb: SupabaseClient,
  logout: (session: string) => Promise<void>,
): Promise<number> {
  const { data, error } = await sb
    .from("erp_credential")
    .select("id, millennium_session")
    .not("millennium_session", "is", null);
  if (error) throw error;
  let n = 0;
  for (const row of data ?? []) {
    const token = String((row as { millennium_session?: string }).millennium_session ?? "").trim();
    const id = (row as { id: string }).id;
    if (token) {
      try {
        await logout(token);
        n += 1;
      } catch {
        /* best-effort */
      }
    }
    await sb
      .from("erp_credential")
      .update({
        millennium_session: null,
        millennium_session_at: null,
        millennium_session_by: null,
        sync_paused: true,
      })
      .eq("id", id);
  }
  return n;
}

/**
 * No boot: RUNNING órfãos voltam pra fila (QUEUED), não falham.
 * Assim um Ctrl+C / crash no meio do SEED não deixa a UI presa em “Buscando”.
 * Também cancela fila de tenants ainda no onboarding.
 */
export async function recoverOnStartup(sb: SupabaseClient): Promise<void> {
  const nowIso = new Date().toISOString();

  const { data: running, error: runErr } = await sb
    .from("sync_job")
    .select("id")
    .eq("status", "RUNNING");
  if (runErr) throw runErr;
  if (running && running.length > 0) {
    const { error } = await sb
      .from("sync_job")
      .update({
        status: "QUEUED",
        locked_at: null,
        error: null,
        finished_at: null,
      })
      .eq("status", "RUNNING");
    if (error) throw error;
    console.log(`Recuperação: ${running.length} job(s) RUNNING órfão(s) → QUEUED`);
  }

  const { data: boarding, error: boardErr } = await sb
    .from("membership")
    .select("tenant_id")
    .not("onboarding_step", "is", null);
  if (boardErr) throw boardErr;
  const tenantIds = [...new Set((boarding ?? []).map((m) => m.tenant_id as string))];
  if (tenantIds.length === 0) return;

  const { data: cancelled, error: cancelErr } = await sb
    .from("sync_job")
    .update({
      status: "FAILED",
      error: "pausado — tenant em onboarding",
      finished_at: nowIso,
    })
    .in("tenant_id", tenantIds)
    .in("status", ["QUEUED", "RUNNING"])
    .select("id");
  if (cancelErr) throw cancelErr;
  if (cancelled && cancelled.length > 0) {
    console.log(`Recuperação: ${cancelled.length} job(s) cancelados (onboarding aberto)`);
  }
}

/**
 * Durante o poll: RUNNING parado demais (worker morreu no meio) → refila.
 * Sem isso a UI fica em “Buscando” e o log do worker fica mudo.
 */
export async function recoverStaleRunningJobs(
  sb: SupabaseClient,
  maxAgeMs = 12 * 60_000,
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
  const { data, error } = await sb
    .from("sync_job")
    .select("id, locked_at, created_at")
    .eq("status", "RUNNING");
  if (error) throw error;
  let n = 0;
  for (const row of data ?? []) {
    const lockedAt = (row as { locked_at?: string | null }).locked_at;
    const createdAt = (row as { created_at?: string }).created_at;
    const stamp = lockedAt || createdAt;
    if (!stamp || stamp > cutoff) continue;
    const { error: upErr } = await sb
      .from("sync_job")
      .update({
        status: "QUEUED",
        locked_at: null,
        error: null,
        finished_at: null,
      })
      .eq("id", (row as { id: string }).id)
      .eq("status", "RUNNING");
    if (!upErr) {
      n += 1;
      console.log(
        `Recuperação: job ${(row as { id: string }).id.slice(0, 8)}… RUNNING parado → QUEUED`,
      );
    }
  }
  return n;
}

/**
 * Enqueue LIGHT for credentials due (interval elapsed, no open job).
 * Runs after processing claimed jobs so force/backfill stay priority.
 */
export async function enqueueDueLightJobs(sb: SupabaseClient): Promise<number> {
  const { data: creds, error } = await sb
    .from("erp_credential")
    .select(
      "id, tenant_id, light_interval_min, last_light_sync_at, last_error_at, last_error, status, sync_paused",
    )
    .eq("status", "VALID");
  if (error) throw error;

  let enqueued = 0;
  const now = Date.now();
  const busyBackoffMs = 10 * 60_000;

  for (const c of creds ?? []) {
    if (!isIntegrationActive(c as { sync_paused?: boolean })) continue;

    // Não dispara LIGHT enquanto algum membership do tenant ainda está no onboarding.
    const { data: onboarding } = await sb
      .from("membership")
      .select("id")
      .eq("tenant_id", c.tenant_id)
      .not("onboarding_step", "is", null)
      .limit(1)
      .maybeSingle();
    if (onboarding) continue;

    const intervalMin = Number(c.light_interval_min) || 5;
    const last = c.last_light_sync_at ? new Date(c.last_light_sync_at as string).getTime() : 0;
    const due = !last || now - last >= intervalMin * 60_000;
    if (!due) continue;

    // Millennium session limit / 401 — don't spam LIGHT every poll while broken.
    const errAt = c.last_error_at ? new Date(c.last_error_at as string).getTime() : 0;
    const errText = String(c.last_error ?? "").toLowerCase();
    const busyRecently =
      errAt > 0 &&
      now - errAt < busyBackoffMs &&
      (errText.includes("ultrapassado") ||
        errText.includes("máximo") ||
        errText.includes("maximo") ||
        errText.includes("já está conectado") ||
        errText.includes("ja esta conectado") ||
        errText.includes("busy") ||
        errText.includes("401") ||
        errText.includes("unauthorized") ||
        errText.includes("sessão") ||
        errText.includes("sessao"));
    if (busyRecently) continue;

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

  // Nunca compete com o wizard: onboarding usa a mesma sessão Millennium.
  const { data: onboarding } = await sb
    .from("membership")
    .select("id")
    .eq("tenant_id", job.tenantId)
    .not("onboarding_step", "is", null)
    .limit(1)
    .maybeSingle();
  if (onboarding) {
    // claimNextJob já deixou RUNNING — não filtrar por QUEUED.
    await sb
      .from("sync_job")
      .update({
        status: "FAILED",
        error: "pausado — tenant em onboarding",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .in("status", ["QUEUED", "RUNNING"]);
    console.log(`Job ${job.id.slice(0, 8)}… ignorado (onboarding em andamento)`);
    return true;
  }

  // Usuário pausou sync (liberou ERP) — não compete com sessão desktop.
  const { data: credPause } = await sb
    .from("erp_credential")
    .select("sync_paused")
    .eq("id", job.credentialId)
    .maybeSingle();
  if ((credPause as { sync_paused?: boolean } | null)?.sync_paused) {
    console.log(`Job ${job.id.slice(0, 8)}… ignorado (sync pausado pelo usuário)`);
    return true; // deixa QUEUED; volta quando resume
  }

  const deps = buildDeps(sb, erpSecret);
  const result = await runSyncJob(job, deps);
  if (!result.ok) {
    if (result.reason === "locked") {
      // Outro job da mesma credencial ainda RUNNING — deixa QUEUED, sem FAILED/spam.
      return false;
    }
    console.log(`Job ${job.id.slice(0, 8)}… falhou (${result.reason})`);
  }
  return true;
}
