/**
 * erp-sync-enqueue — JWT OWNER/MANAGER enfileira LIGHT | FORCE_LIGHT | BACKFILL.
 * Rate limit: FORCE_LIGHT at most once per 5 minutes per tenant.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

type JobKind = "BACKFILL" | "LIGHT" | "FORCE_LIGHT";

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
      return "FORCE_LIGHT";
    case "backfill":
      return "BACKFILL";
    default:
      return null;
  }
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

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const kind = mapAction(String(body.action ?? "").trim().toLowerCase());
  if (!kind) return json({ error: "invalid_action" }, 400);

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

  const { data: credential, error: credErr } = await admin
    .from("erp_credential")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (credErr || !credential) return json({ error: "credential_missing" }, 400);
  if (credential.status === "INVALID" || credential.status === "NOT_CONFIGURED") {
    return json({ error: "credential_invalid" }, 400);
  }

  if (kind === "FORCE_LIGHT") {
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await admin
      .from("sync_job")
      .select("id, created_at")
      .eq("tenant_id", tenantId)
      .eq("kind", "FORCE_LIGHT")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentErr) return json({ error: "rate_check_failed" }, 500);
    if (recent) {
      const created = new Date(recent.created_at as string).getTime();
      const retryAfterSec = Math.max(1, Math.ceil((created + 5 * 60 * 1000 - Date.now()) / 1000));
      return json({ ok: false, error: "rate_limited", retryAfterSec }, 429);
    }
  }

  const { data: job, error: jobErr } = await admin
    .from("sync_job")
    .insert({
      tenant_id: tenantId,
      credential_id: credential.id,
      kind,
      status: "QUEUED",
      payload: {},
    })
    .select("id, kind, status, created_at")
    .single();

  if (jobErr || !job) {
    console.error("sync_job insert failed", jobErr);
    return json({ error: "enqueue_failed" }, 500);
  }

  return json({ ok: true, job });
});
