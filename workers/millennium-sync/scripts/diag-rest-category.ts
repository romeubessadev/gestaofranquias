import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadDotEnv() {
  for (const path of [resolve(__dirname, "../.env"), resolve(__dirname, "../../../.env")]) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
      process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    }
  }
}

loadDotEnv();
const url = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log("url", url.slice(0, 48));
for (const [label, k] of [
  ["service", key],
  ["anon", anon],
] as const) {
  if (!k) {
    console.log(label, "missing key");
    continue;
  }
  const res = await fetch(
    `${url}/rest/v1/sales_category_day_agg?select=category_name,revenue_cents&limit=2`,
    {
      headers: {
        apikey: k,
        Authorization: `Bearer ${k}`,
        Accept: "application/json",
      },
    },
  );
  const text = await res.text();
  console.log(label, res.status, text.slice(0, 300));
}

// Also try NOTIFY via supabase postgres if DATABASE_URL exists
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
if (dbUrl) {
  console.log("db url present, try notify via fetch to sql — skip");
}
