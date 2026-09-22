/**
 * erp-sync-enqueue — JWT OWNER/MANAGER enfileira SEED | LIGHT | FORCE | RANGE.
 * Rate limit: FORCE at most once per 5 minutes per tenant.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

type JobKind = "SEED" | "LIGHT" | "FORCE" | "FORCE_LIGHT" | "RANGE" | "BACKFILL";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapAction(action: string): JobKind | null {
  switch (action) {
    case "light":
      return "LIGHT";
    case "force":
    case "force_light":
      return "FORCE";
    case "seed":
    case "backfill":
      return "SEED";
    case "range":
      return "RANGE";
    default:
      return null;
  }
}

function isIsoDay(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

  let body: { action?: string; from?: string; to?: string; storeIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const kind = mapAction(String(body.action ?? "").trim().toLowerCase());
  if (!kind) return json({ error: "invalid_action" }, 400);

  const payload: { from?: string; to?: string; storeIds?: string[] } = {};
  if (kind === "FORCE" || kind === "FORCE_LIGHT" || kind === "RANGE") {
    if (!isIsoDay(body.from) || !isIsoDay(body.to)) {
      return json({ error: "from_to_required" }, 400);
    }
    payload.from = body.from <= body.to ? body.from : body.to;
    payload.to = body.from <= body.to ? body.to : body.from;
    // Cap 90 days per request
    const [y1, m1, d1] = payload.from.split("-").map(Number);
    const [y2, m2, d2] = payload.to.split("-").map(Number);
    const a = Date.UTC(y1, m1 - 1, d1);
    const b = Date.UTC(y2, m2 - 1, d2);
    const days = Math.floor((b - a) / 86_400_000) + 1;
    if (days > 90) return json({ error: "range_too_large", maxDays: 90 }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: identity, error: idErr } = await admin
    .from("identity")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (idErr || !identity) return json({ error: "identity_not_found" }, 403);

  const { data: membership, error: memErr } = await admin
    .from("membership")
    .select("id, tenant_id, role, status")
    .eq("identity_id", identity.id)
    .eq("status", "ACTIVE")
    .in("role", ["OWNER", "MANAGER"])
    .limit(1)
    .maybeSingle();
  if (memErr || !membership) return json({ error: "forbidden" }, 403);

  const tenantId = membership.tenant_id as string;

  // FORCE/RANGE: opcionalmente só as lojas do StorePicker (não "Todas").
  if (
    (kind === "FORCE" || kind === "FORCE_LIGHT" || kind === "RANGE") &&
    Array.isArray(body.storeIds) &&
    body.storeIds.length > 0
  ) {
    const ids = [
      ...new Set(
        body.storeIds.filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    ];
    if (ids.length === 0) {
      return json({ error: "invalid_store" }, 400);
    }
    const { data: stores, error: storeErr } = await admin
      .from("store")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("id", ids);
    if (storeErr) return json({ error: "store_check_failed" }, 500);
    if (!stores || stores.length !== ids.length) {
      return json({ error: "invalid_store" }, 400);
    }
    payload.storeIds = ids;
  }

  const { data: credential, error: credErr } = await admin
    .from("erp_credential")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (credErr || !credential) return json({ error: "credential_missing" }, 400);
  if (credential.status === "INVALID" || credential.status === "NOT_CONFIGURED") {
    return json({ error: "credential_invalid" }, 400);
  }

  if (kind === "FORCE" || kind === "FORCE_LIGHT") {
    const windowMs = 5 * 60 * 1000;
    const since = new Date(Date.now() - windowMs).toISOString();
    const { data: recentJobs, error: recentErr } = await admin
      .from("sync_job")
      .select("id, created_at, payload")
      .eq("tenant_id", tenantId)
      .in("kind", ["FORCE", "FORCE_LIGHT"])
      .in("status", ["QUEUED", "RUNNING", "SUCCEEDED"])
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50);
    if (recentErr) return json({ error: "rate_check_failed" }, 500);

    const requestedIds = payload.storeIds ?? null; // null = Todas as lojas
    const jobStoreIds = (p: unknown): string[] | null => {
      if (!p || typeof p !== "object") return null;
      const ids = (p as { storeIds?: unknown }).storeIds;
      if (!Array.isArray(ids) || ids.length === 0) return null;
      return ids.filter((id): id is string => typeof id === "string" && id.length > 0);
    };

    let blocking: { created_at: string } | null = null;
    for (const row of recentJobs ?? []) {
      const recentIds = jobStoreIds((row as { payload?: unknown }).payload);
      // Opção A: FORCE "Todas" bloqueia se houver QUALQUER FORCE recente.
      if (requestedIds == null) {
        blocking = row as { created_at: string };
        break;
      }
      // FORCE "Todas" recente bloqueia qualquer loja.
      if (recentIds == null) {
        blocking = row as { created_at: string };
        break;
      }
      // Sobreposição de lojas.
      if (requestedIds.some((id) => recentIds.includes(id))) {
        blocking = row as { created_at: string };
        break;
      }
    }

    if (blocking) {
      const created = new Date(blocking.created_at).getTime();
      const retryAfterSec = Math.max(1, Math.ceil((created + windowMs - Date.now()) / 1000));
      return json({ ok: false, error: "rate_limited", retryAfterSec }, 429);
    }
  }

  // Avoid duplicate SEED/RANGE while one is already queued/running
  if (kind === "SEED" || kind === "RANGE") {
    const { data: open } = await admin
      .from("sync_job")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("kind", kind)
      .in("status", ["QUEUED", "RUNNING"])
      .limit(1)
      .maybeSingle();
    if (open) {
      return json({ ok: true, job: open, deduped: true });
    }
  }

  const { data: job, error: jobErr } = await admin
    .from("sync_job")
    .insert({
      tenant_id: tenantId,
      credential_id: credential.id,
      kind,
      status: "QUEUED",
      payload,
    })
    .select("id, kind, status, created_at")
    .single();

  if (jobErr || !job) {
    console.error("sync_job insert failed", jobErr);
    return json({ error: "enqueue_failed" }, 500);
  }

  return json({ ok: true, job });
});
