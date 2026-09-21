/**
 * erp-credential-persist — OWNER onboarding: encrypt ERP password, upsert
 * erp_credential + store rows, remap membership_store to store uuids.
 *
 * // SPEC_DEVIATION: Edge Function required (task listed authApi only).
 * // Reason: password must be AES-encrypted with ERP_SECRET_KEY server-side;
 * // sync tables allow writes only via service_role.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

type StoreIn = {
  storeId: number;
  code?: string;
  name?: string;
  tradeName?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

async function encryptPassword(plain: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const keyHash = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  const key = await crypto.subtle.importKey("raw", keyHash, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return `${b64(iv)}.${b64(cipher)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const erpSecret = Deno.env.get("ERP_SECRET_KEY");
  if (!supabaseUrl || !supabaseAnon || !serviceKey || !erpSecret) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

  let body: {
    tenantId?: string;
    membershipId?: string;
    username?: string;
    password?: string;
    dedicated?: boolean;
    stores?: StoreIn[];
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const tenantId = String(body.tenantId ?? "").trim();
  const membershipId = String(body.membershipId ?? "").trim();
  const username = String(body.username ?? "").trim().toUpperCase();
  const password = String(body.password ?? "");
  const dedicated = Boolean(body.dedicated);
  const stores = Array.isArray(body.stores) ? body.stores : [];

  if (!tenantId || !membershipId || !username || !password || stores.length === 0) {
    return json({ error: "invalid_body" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: identity } = await admin
    .from("identity")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (!identity) return json({ error: "identity_not_found" }, 403);

  const { data: membership } = await admin
    .from("membership")
    .select("id, tenant_id, role, status")
    .eq("id", membershipId)
    .eq("identity_id", identity.id)
    .eq("tenant_id", tenantId)
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (!membership || !["OWNER", "MANAGER"].includes(membership.role as string)) {
    return json({ error: "forbidden" }, 403);
  }

  const ciphertext = await encryptPassword(password, erpSecret);
  const lightInterval = dedicated ? 2 : 30;

  const { data: cred, error: credErr } = await admin
    .from("erp_credential")
    .upsert(
      {
        tenant_id: tenantId,
        username,
        password_ciphertext: ciphertext,
        dedicated,
        status: "VALID",
        light_interval_min: lightInterval,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" },
    )
    .select("id")
    .single();
  if (credErr || !cred) {
    console.error("erp_credential upsert", credErr);
    return json({ error: "credential_upsert_failed" }, 500);
  }

  const storeIds: string[] = [];
  for (const s of stores) {
    const milleniumId = Number(s.storeId);
    if (!Number.isFinite(milleniumId)) continue;
    const { data: row, error: storeErr } = await admin
      .from("store")
      .upsert(
        {
          tenant_id: tenantId,
          millennium_store_id: milleniumId,
          code: s.code ?? String(milleniumId),
          name: s.name ?? s.tradeName ?? String(milleniumId),
          trade_name: s.tradeName ?? s.name ?? String(milleniumId),
          timezone: "America/Campo_Grande",
          active: true,
        },
        { onConflict: "tenant_id,millennium_store_id" },
      )
      .select("id")
      .single();
    if (storeErr || !row) {
      console.error("store upsert", storeErr);
      return json({ error: "store_upsert_failed" }, 500);
    }
    storeIds.push(row.id as string);
  }

  await admin.from("membership_store").delete().eq("membership_id", membershipId);
  if (storeIds.length > 0) {
    const { error: msErr } = await admin.from("membership_store").insert(
      storeIds.map((store_id) => ({ membership_id: membershipId, store_id })),
    );
    if (msErr) {
      console.error("membership_store insert", msErr);
      return json({ error: "membership_store_failed" }, 500);
    }
  }

  return json({
    ok: true,
    credentialId: cred.id,
    storeIds,
    lightIntervalMin: lightInterval,
  });
});
