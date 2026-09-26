/**
 * Backfill sales_seller_day_agg for today from VENDAS.Lista (no full FORCE).
 *   cd workers/millennium-sync && npx tsx scripts/backfill-seller-today.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient, buildDeps } from "../src/deps.ts";
import { loginMillennium, millenniumBaseUrl } from "../src/millenniumAuth.ts";
import { fetchSalesLista } from "../src/millenniumSales.ts";
import { aggregateSellerDay, aggregatePaymentDay } from "../../../src/data/wedash/salesAggregate.ts";
import { fetchEventosListaTodos, resolveSalesEventIds } from "../src/millenniumEvents.ts";
import { ymdInTz } from "../src/runSyncJob.ts";

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
  const secret = process.env.ERP_SECRET_KEY!;
  const sb = createAdminClient();
  const deps = buildDeps(sb, secret);
  const { data: cred } = await sb
    .from("erp_credential")
    .select("id, tenant_id")
    .eq("status", "VALID")
    .limit(1)
    .maybeSingle();
  if (!cred) throw new Error("no cred");

  let session = await deps.getStoredSession(cred.id as string);
  if (!session) {
    const full = await deps.loadCredential(cred.id as string);
    const login = await loginMillennium(full.username, full.password);
    if (!login.ok) throw new Error(String(login.reason));
    session = login.session;
    await deps.setStoredSession(cred.id as string, session);
  }

  const stores = await deps.listStores(cred.tenant_id as string);
  const events = await fetchEventosListaTodos({ session, baseUrl: millenniumBaseUrl() });
  const now = new Date();

  for (const store of stores) {
    const today = ymdInTz(now, store.timezone);
    const eventoIds = resolveSalesEventIds(events, store.code);
    console.log(`→ ${store.code} ${today}…`);
    let rows;
    try {
      rows = await fetchSalesLista({
        session,
        storeId: store.id,
        millenniumStoreId: store.millenniumStoreId,
        from: today,
        to: today,
        eventoIds,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("401")) {
        const full = await deps.loadCredential(cred.id as string);
        const login = await loginMillennium(full.username, full.password);
        if (!login.ok) throw new Error(String(login.reason));
        session = login.session;
        await deps.setStoredSession(cred.id as string, session);
        rows = await fetchSalesLista({
          session,
          storeId: store.id,
          millenniumStoreId: store.millenniumStoreId,
          from: today,
          to: today,
          eventoIds,
        });
      } else throw e;
    }

    const opts = {
      tenantId: cred.tenant_id as string,
      timeZone: store.timezone,
      now,
      dayFrom: today,
      dayTo: today,
    };
    const sellers = aggregateSellerDay(rows, opts);
    const pay = aggregatePaymentDay(rows, opts);
    await deps.replaceSellerDayAggs({
      tenantId: cred.tenant_id as string,
      storeId: store.id,
      from: today,
      to: today,
      rows: sellers,
    });
    await deps.replacePaymentDayAggs({
      tenantId: cred.tenant_id as string,
      storeId: store.id,
      from: today,
      to: today,
      rows: pay,
    });
    console.log(
      `  ${rows.length} vendas · ${sellers.length} vendedora(s) · ${pay.length} forma(s)`,
      sellers.map((s) => `${s.sellerName}=${(s.revenueCents / 100).toFixed(0)}`).join(", "),
    );
  }
  console.log("ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
