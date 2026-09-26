/** Check Santana reset state. Usage: node scripts/check-santana.mjs */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const EMAIL = "santanaebessaltda@gmail.com";

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[t.slice(0, i).trim()] = val;
  }
  return env;
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const env = {
  ...loadEnv(path.join(root, ".env")),
  ...loadEnv(path.join(root, "workers/millennium-sync/.env")),
};
const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) {
  console.error("FAIL: missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data: identity, error: idErr } = await sb
  .from("identity")
  .select("id, email")
  .ilike("email", EMAIL)
  .maybeSingle();
if (idErr || !identity) {
  console.error("identity:", idErr?.message ?? "not found");
  process.exit(1);
}

const { data: m, error: mErr } = await sb
  .from("membership")
  .select("id, tenant_id, onboarding_step")
  .eq("identity_id", identity.id)
  .maybeSingle();
if (mErr || !m) {
  console.error("membership:", mErr?.message ?? "not found");
  process.exit(1);
}

const tid = m.tenant_id;
const { count: days } = await sb
  .from("sales_day_agg")
  .select("*", { count: "exact", head: true })
  .eq("tenant_id", tid);
const { count: hours } = await sb
  .from("sales_hour_agg")
  .select("*", { count: "exact", head: true })
  .eq("tenant_id", tid);
const { count: ms } = await sb
  .from("membership_store")
  .select("*", { count: "exact", head: true })
  .eq("membership_id", m.id);
const { count: openJobs } = await sb
  .from("sync_job")
  .select("*", { count: "exact", head: true })
  .eq("tenant_id", tid)
  .in("status", ["QUEUED", "RUNNING"]);
const { data: ec } = await sb
  .from("erp_credential")
  .select("status, last_success_at, last_light_sync_at, millennium_session, sync_paused")
  .eq("tenant_id", tid)
  .maybeSingle();

const clean =
  (days ?? 0) === 0 &&
  (hours ?? 0) === 0 &&
  (ms ?? 0) === 0 &&
  (openJobs ?? 0) === 0 &&
  m.onboarding_step != null;

console.log(
  JSON.stringify(
    {
      clean,
      email: EMAIL,
      onboarding_step: m.onboarding_step,
      day_rows: days ?? 0,
      hour_rows: hours ?? 0,
      membership_stores: ms ?? 0,
      open_jobs: openJobs ?? 0,
      erp: ec
        ? {
            status: ec.status,
            last_success_at: ec.last_success_at,
            last_light_sync_at: ec.last_light_sync_at,
            has_session: Boolean(ec.millennium_session),
            sync_paused: ec.sync_paused ?? null,
          }
        : null,
    },
    null,
    2,
  ),
);
