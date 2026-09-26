/**
 * Diag: sales_category_day_agg rows for tenant.
 *   cd workers/millennium-sync && npx tsx scripts/diag-category-agg.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient } from "../src/deps.ts";

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
    return;
  }
}

async function main() {
  loadDotEnv();
  const sb = createAdminClient();
  const { count, error } = await sb
    .from("sales_category_day_agg")
    .select("*", { count: "exact", head: true });
  console.log("total rows", count, error?.message);

  const { data: sample, error: e2 } = await sb
    .from("sales_category_day_agg")
    .select("day, category_id, category_name, brand, revenue_cents, item_count, store_id")
    .order("day", { ascending: false })
    .limit(15);
  console.log("sample err", e2?.message);
  console.log(JSON.stringify(sample, null, 2));

  const { data: byCat } = await sb
    .from("sales_category_day_agg")
    .select("category_name, revenue_cents")
    .gte("day", "2026-09-01")
    .lte("day", "2026-09-23");
  const map = new Map<string, number>();
  for (const r of byCat ?? []) {
    map.set(r.category_name, (map.get(r.category_name) ?? 0) + Number(r.revenue_cents));
  }
  console.log(
    "sep totals",
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([n, c]) => `${n}=${(c / 100).toFixed(2)}`),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
