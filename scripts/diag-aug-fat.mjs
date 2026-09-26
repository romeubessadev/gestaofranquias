/**
 * Compara soma VALOR_FINAL do VENDAS.Lista (ago/2026 filial 00010)
 * com sales_day_agg no Postgres.
 *
 * Usage: node scripts/diag-aug-fat.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const k of ["value", "Value", "data", "Data", "items", "Items"]) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  return [];
}

function asNum(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function pick(o, ...keys) {
  for (const k of keys) {
    if (o[k] != null) return o[k];
  }
  return null;
}

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")),
  "..",
);
const env = {
  ...loadEnv(path.join(root, ".env")),
  ...loadEnv(path.join(root, "workers/millennium-sync/.env")),
};
const base = (env.MILLENNIUM_API_BASE || "http://177.85.160.35:6017/api").replace(
  /\/$/,
  "",
);
const sb = createClient(
  (env.SUPABASE_URL || env.VITE_SUPABASE_URL).replace(/\/$/, ""),
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: identity } = await sb
  .from("identity")
  .select("id")
  .ilike("email", "santanaebessaltda@gmail.com")
  .maybeSingle();
const { data: m } = await sb
  .from("membership")
  .select("tenant_id")
  .eq("identity_id", identity.id)
  .maybeSingle();
const tenantId = m.tenant_id;
const { data: cred } = await sb
  .from("erp_credential")
  .select("id, millennium_session")
  .eq("tenant_id", tenantId)
  .maybeSingle();
const { data: store } = await sb
  .from("store")
  .select("id, code, millennium_store_id, timezone")
  .eq("tenant_id", tenantId)
  .eq("code", "00010")
  .maybeSingle();

const candidates = [];
if (cred?.millennium_session) candidates.push(cred.millennium_session);
const sessFile = path.join(
  root,
  "workers/millennium-sync/.millennium-sessions.json",
);
if (fs.existsSync(sessFile)) {
  const remembered = JSON.parse(fs.readFileSync(sessFile, "utf8"));
  for (const v of Object.values(remembered)) {
    if (typeof v === "string" && v && !candidates.includes(v)) candidates.push(v);
  }
}

async function fetchLista(session, eventoIds) {
  const body = {
    DATAI: "2026-08-01T04:00:00.000Z",
    DATAF: "2026-09-01T04:00:00.000Z",
    FILIAL: store.millennium_store_id,
    EVENTO: `(${eventoIds.join(",")})`,
    $top: 0,
  };
  const res = await fetch(`${base}/millenium.vendas.lista`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-HTTP-Method": "GET",
      "X-DateFormat": "ISOTZ",
      "X-IdentifierCase": "upper",
      "WTS-Session": session,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 180)}`);
  const list = extractList(JSON.parse(raw));
  let sumFinal = 0;
  let sumMapped = 0;
  let skipped = 0;
  let lines = 0;
  const byOp = new Map();
  for (const rawRow of list) {
    lines += 1;
    const o = rawRow;
    const vf = asNum(pick(o, "VALOR_FINAL", "valor_final")) ?? 0;
    sumFinal += vf;
    const op = String(pick(o, "COD_OPERACAO", "cod_operacao") ?? "").trim();
    const dh = pick(o, "DATA_H", "data_h");
    if (!op || !dh) {
      skipped += 1;
      continue;
    }
    const cents = Math.round(vf * 100);
    sumMapped += cents;
    byOp.set(op, (byOp.get(op) ?? 0) + cents);
  }
  return { lines, skipped, sumFinal, sumMappedCents: sumMapped, ops: byOp.size };
}

let session = null;
for (const s of candidates) {
  try {
    await fetchLista(s, [107, 24]); // smoke
    session = s;
    break;
  } catch (e) {
    console.warn("sessão:", e instanceof Error ? e.message : e);
  }
}
if (!session) {
  console.error("sem sessão");
  process.exit(1);
}

// 107=S-X, 24=S-10, 17=S-03 (ids confirmados no worker log)
const sxS10 = await fetchLista(session, [107, 24]);
const withS03 = await fetchLista(session, [107, 24, 17]);
const onlyS03 = await fetchLista(session, [17]);

const { data: days } = await sb
  .from("sales_day_agg")
  .select("day, revenue_cents, sales_count, item_count")
  .eq("tenant_id", tenantId)
  .eq("store_id", store.id)
  .gte("day", "2026-08-01")
  .lte("day", "2026-08-31");

const dbCents = (days ?? []).reduce((a, r) => a + (r.revenue_cents ?? 0), 0);
const dbDays = days?.length ?? 0;

function brl(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

console.log("loja", store.code, "FILIAL", store.millennium_store_id);
console.log("--- ERP VENDAS.Lista ago/2026 ---");
console.log(
  "S-X+S-10 (107,24):",
  "linhas",
  sxS10.lines,
  "skip",
  sxS10.skipped,
  "Σ VALOR_FINAL",
  sxS10.sumFinal.toFixed(2),
  "mapped",
  brl(sxS10.sumMappedCents),
);
console.log(
  "S-X+S-10+S-03 (107,24,17):",
  "linhas",
  withS03.lines,
  "skip",
  withS03.skipped,
  "Σ VALOR_FINAL",
  withS03.sumFinal.toFixed(2),
  "mapped",
  brl(withS03.sumMappedCents),
);
console.log(
  "só S-03 (17):",
  "linhas",
  onlyS03.lines,
  "Σ",
  onlyS03.sumFinal.toFixed(2),
);
console.log("--- WeDash sales_day_agg ---");
console.log("dias", dbDays, "Σ revenue_cents", brl(dbCents));
console.log("--- deltas ---");
console.log(
  "ERP S-X+S-10 − WeDash:",
  (sxS10.sumFinal - dbCents / 100).toFixed(2),
);
console.log(
  "ERP com S-03 − WeDash:",
  (withS03.sumFinal - dbCents / 100).toFixed(2),
);
console.log(
  "ERP S-X+S-10 − ERP mapped cents:",
  (sxS10.sumFinal - sxS10.sumMappedCents / 100).toFixed(4),
);
