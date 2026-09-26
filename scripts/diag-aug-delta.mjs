/**
 * Isola os R$ 53,80: soma bruta vs mapeada vs fuso vs DB.
 * Usage: node scripts/diag-aug-delta.mjs
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
    if (o[k] != null && o[k] !== "") return o[k];
  }
  const lower = Object.fromEntries(
    Object.entries(o).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const k of keys) {
    if (lower[k.toLowerCase()] != null && lower[k.toLowerCase()] !== "") {
      return lower[k.toLowerCase()];
    }
  }
  return null;
}

function localDay(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
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

console.log("1) carregando sessão/loja…");
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
const { data: cred } = await sb
  .from("erp_credential")
  .select("millennium_session")
  .eq("tenant_id", m.tenant_id)
  .maybeSingle();
const { data: store } = await sb
  .from("store")
  .select("id, code, millennium_store_id, timezone")
  .eq("tenant_id", m.tenant_id)
  .eq("code", "00010")
  .single();

const candidates = [];
if (cred?.millennium_session) candidates.push(cred.millennium_session);
const sessFile = path.join(
  root,
  "workers/millennium-sync/.millennium-sessions.json",
);
if (fs.existsSync(sessFile)) {
  for (const v of Object.values(JSON.parse(fs.readFileSync(sessFile, "utf8")))) {
    if (typeof v === "string" && v && !candidates.includes(v)) candidates.push(v);
  }
}

const tz = store.timezone || "America/Campo_Grande";
const eventoIds = [17, 24, 107]; // S-03, S-10, S-X
const body = {
  EVENTO: `(${eventoIds.join(",")})`,
  DATAI: "2026-08-01T04:00:00.000Z",
  DATAF: "2026-09-01T04:00:00.000Z",
  FILIAL: store.millennium_store_id,
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

async function fetchLista(session) {
  const origin = base.replace(/\/api\/?$/, "");
  const res = await fetch(`${base}/millenium.VENDAS.Lista`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Origin: origin,
      Referer: `${origin}/files/web-apps/millennium.html`,
      "X-DateFormat": "ISOTZ",
      "X-IdentifierCase": "upper",
      "X-HTTP-Method": "GET",
      "WTS-Session": session,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 200)}`);
  return extractList(JSON.parse(raw));
}

let list = null;
for (const s of candidates) {
  try {
    console.log("2) VENDAS.Lista ago/2026 filial", store.millennium_store_id, "…");
    list = await fetchLista(s);
    console.log("   linhas", list.length);
    break;
  } catch (e) {
    console.warn("   sessão falhou:", e instanceof Error ? e.message : e);
  }
}
if (!list) {
  console.error("sem Lista");
  process.exit(1);
}

let rawSum = 0;
let mappedAug = 0;
let outsideAug = 0;
let skipped = 0;
let skippedCents = 0;
const outsideSamples = [];
const skippedSamples = [];

for (const row of list) {
  const vf = asNum(pick(row, "VALOR_FINAL", "valor_final")) ?? 0;
  rawSum += vf;
  const cents = Math.round(vf * 100);
  const op = String(pick(row, "COD_OPERACAO", "cod_operacao") ?? "").trim();
  const dh = pick(row, "DATA_H", "data_h");
  if (!op || !dh) {
    skipped += 1;
    skippedCents += cents;
    if (skippedSamples.length < 5) {
      skippedSamples.push({ op, dh, vf, keys: Object.keys(row).slice(0, 12) });
    }
    continue;
  }
  const d = new Date(dh);
  if (Number.isNaN(d.getTime())) {
    skipped += 1;
    skippedCents += cents;
    continue;
  }
  const day = localDay(d, tz);
  if (day >= "2026-08-01" && day <= "2026-08-31") {
    mappedAug += cents;
  } else {
    outsideAug += cents;
    if (outsideSamples.length < 8) {
      outsideSamples.push({ day, vf, op, data_h: dh });
    }
  }
}

const { data: days } = await sb
  .from("sales_day_agg")
  .select("revenue_cents")
  .eq("tenant_id", m.tenant_id)
  .eq("store_id", store.id)
  .gte("day", "2026-08-01")
  .lte("day", "2026-08-31");
const db = (days ?? []).reduce((a, r) => a + (r.revenue_cents || 0), 0);

const brl = (c) => (c / 100).toFixed(2);
console.log("--- resultado ---");
console.log("ERP UI (você):     366435.03");
console.log("Σ VALOR_FINAL raw:", rawSum.toFixed(2));
console.log("mapped Aug (TZ):   ", brl(mappedAug), "tz=", tz);
console.log("fora de ago (TZ): ", brl(outsideAug));
console.log("skipped linhas:   ", skipped, "Σ", brl(skippedCents));
console.log("WeDash DB:        ", brl(db));
console.log("raw − mappedAug:  ", (rawSum - mappedAug / 100).toFixed(2));
console.log("ERP − DB:         ", (366435.03 - db / 100).toFixed(2));
console.log("mapped − DB:      ", ((mappedAug - db) / 100).toFixed(2));
if (outsideSamples.length) console.log("amostras fora ago:", JSON.stringify(outsideSamples));
if (skippedSamples.length) console.log("amostras skip:", JSON.stringify(skippedSamples));
