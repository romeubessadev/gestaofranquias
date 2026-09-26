/**
 * Dump VENDEDOR* keys from live VENDAS.Lista (1 day, 1 store).
 *   cd workers/millennium-sync && npx tsx scripts/probe-lista-vendedor.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient, buildDeps } from "../src/deps.ts";
import { loginMillennium, millenniumBaseUrl } from "../src/millenniumAuth.ts";
import { fetchSalesLista, mapVendasListaPayload, milleniumDataRange } from "../src/millenniumSales.ts";
import { fetchEventosListaTodos, resolveSalesEventIds } from "../src/millenniumEvents.ts";

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

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const o = payload as Record<string, unknown>;
  for (const k of ["value", "Value", "data", "Data", "items", "Items"]) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

async function main() {
  loadDotEnv();
  const secret = process.env.ERP_SECRET_KEY;
  if (!secret) throw new Error("ERP_SECRET_KEY missing");
  const sb = createAdminClient();
  const deps = buildDeps(sb, secret);
  const { data: cred } = await sb
    .from("erp_credential")
    .select("id, username, tenant_id")
    .eq("status", "VALID")
    .limit(1)
    .maybeSingle();
  if (!cred) throw new Error("no VALID erp_credential");

  let session = await deps.getStoredSession(cred.id as string);
  if (!session) {
    const full = await deps.loadCredential(cred.id as string);
    const login = await loginMillennium(full.username, full.password);
    if (!login.ok) throw new Error(String(login.reason));
    session = login.session;
    await deps.setStoredSession(cred.id as string, session);
  }

  const stores = await deps.listStores(cred.tenant_id as string);
  const store = stores[0];
  if (!store) throw new Error("no stores");

  const events = await fetchEventosListaTodos({ session, baseUrl: millenniumBaseUrl() });
  const eventoIds = resolveSalesEventIds(events, store.code);
  const today =
    process.argv[2] ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: store.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const base = millenniumBaseUrl().replace(/\/$/, "");
  const origin = base.replace(/\/api\/?$/, "");
  const { datai, dataf } = milleniumDataRange(today, today);
  const body = {
    EVENTO: `(${eventoIds.join(",")})`,
    DATAI: datai,
    DATAF: dataf,
    FILIAL: store.millenniumStoreId,
    DOCUMENTO: null,
    CANCELADA: false,
    GERADOR: "C",
    COD: null,
    ORDEM: 0,
    CONTA: null,
    NOTAI: null,
    NOTAF: null,
    TIPO_PAGTO: null,
    CONDICAO: null,
    EMBARQUE: null,
    N_DOCEXTERNO: null,
    VENDEDOR: null,
    PEDIDOREF: null,
    FILIAL_DESTINO: null,
    PRODUCAO: null,
    CONFERIDO: null,
    TIPO_PEDIDO: null,
    COD_PEDIDO: null,
    PEDIDO: false,
    GRUPO_LOJA: null,
    NUMERO_CARTAO: null,
    GERADOR_COM: "V",
    COD_COM: null,
    LIM_CRED_MOV_EXCEDEU: null,
    LIM_CRED_EX_VLR_INI: null,
    LIM_CRED_EX_VLR_FIM: null,
    NUMERO_PREFAT: null,
    PREFATURAMENTO: false,
    COD_VOLUME: null,
    ENTREGA_CONFIRMADA: null,
    VOID: null,
  };

  async function callLista(sess: string) {
    return fetch(`${base}/millenium.VENDAS.Lista`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/files/web-apps/millennium.html`,
        "X-DateFormat": "ISOTZ",
        "X-IdentifierCase": "upper",
        "WTS-Session": sess,
        "X-HTTP-Method": "GET",
      },
      body: JSON.stringify(body),
    });
  }

  let res = await callLista(session);
  if (res.status === 401) {
    console.log("401 — login fresco…");
    const full = await deps.loadCredential(cred.id as string);
    const login = await loginMillennium(full.username, full.password);
    if (!login.ok) throw new Error(String(login.reason));
    session = login.session;
    await deps.setStoredSession(cred.id as string, session);
    res = await callLista(session);
  }

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("status", res.status, "non-json", text.slice(0, 500));
    process.exit(1);
  }
  const list = extractList(parsed);
  console.log(
    `store=${store.code} millenium=${store.millenniumStoreId} today=${today} status=${res.status} rows=${list.length}`,
  );
  if (list.length === 0) {
    console.log("empty lista — try another store?");
    process.exit(0);
  }
  const sample = list[0] as Record<string, unknown>;
  const allKeys = Object.keys(sample).sort();
  console.log("all keys:", allKeys.join(", "));
  const interesting = allKeys.filter((k) =>
    /vend|func|nome|user|oper|gerador|com|vended/i.test(k),
  );
  console.log("interesting keys:", interesting.join(", "));
  for (const row of list.slice(0, 8)) {
    const o = row as Record<string, unknown>;
    const pick: Record<string, unknown> = { VALOR_FINAL: o.VALOR_FINAL, CONDICAO: o.CONDICAO };
    for (const k of interesting) pick[k] = o[k];
    console.log(JSON.stringify(pick));
  }

  const mapped = mapVendasListaPayload(parsed, { storeId: store.id });
  console.log(
    `mapped=${mapped.length} withSeller=`,
    mapped.filter((r) => r.sellerName).length,
    "names=",
    [...new Set(mapped.map((r) => r.sellerName).filter(Boolean))].slice(0, 15),
  );

  const rows = await fetchSalesLista({
    session,
    storeId: store.id,
    millenniumStoreId: store.millenniumStoreId,
    from: today,
    to: today,
    eventoIds,
  });
  console.log(
    `fetchSalesLista=${rows.length} sellers=`,
    [...new Set(rows.map((r) => r.sellerName).filter(Boolean))].slice(0, 15),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
