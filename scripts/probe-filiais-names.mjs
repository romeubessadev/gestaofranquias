/** Probe FILIAIS.Lista name fields. Usage: node scripts/probe-filiais-names.mjs */
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
  for (const k of ["value", "Value", "data", "Data", "filiais", "Filiais", "d"]) {
    if (Array.isArray(payload[k])) return payload[k];
  }
  return [];
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
const { data: cred } = await sb
  .from("erp_credential")
  .select("id, millennium_session")
  .eq("tenant_id", m.tenant_id)
  .maybeSingle();

const candidates = [];
if (cred?.millennium_session) candidates.push(cred.millennium_session);
const sessFile = path.join(
  root,
  "workers/millennium-sync/.millennium-sessions.json",
);
if (fs.existsSync(sessFile)) {
  try {
    const remembered = JSON.parse(fs.readFileSync(sessFile, "utf8"));
    for (const v of Object.values(remembered)) {
      if (typeof v === "string" && v && !candidates.includes(v)) {
        candidates.push(v);
      }
    }
  } catch {
    /* ignore */
  }
}

async function listWith(session) {
  const paths = ["millenium.filiais.lista", "millennium.filiais.lista"];
  for (const p of paths) {
    const q = new URLSearchParams({
      $format: "json",
      $dateformat: "iso",
      $top: "0",
    });
    const res = await fetch(`${base}/${p}?${q}`, {
      headers: { Accept: "application/json", "WTS-Session": session },
    });
    if (res.ok) {
      return { via: `GET ${p}`, list: extractList(await res.json()) };
    }
  }
  const p = "millenium.filiais.lista";
  const res = await fetch(`${base}/${p}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-HTTP-Method": "GET",
      "WTS-Session": session,
    },
    body: JSON.stringify({ $top: 0 }),
  });
  if (!res.ok) throw new Error(`POST ${res.status}`);
  return { via: `POST ${p}`, list: extractList(JSON.parse(await res.text())) };
}

let hit = null;
for (const s of candidates) {
  try {
    hit = await listWith(s);
    break;
  } catch (e) {
    console.warn("sessão falhou:", e instanceof Error ? e.message : e);
  }
}
if (!hit) {
  console.error("nenhuma sessão válida — worker precisa estar com token vivo");
  process.exit(1);
}

console.log("via", hit.via, "total", hit.list.length);
for (const r of hit.list) {
  const nameKeys = Object.keys(r).filter((k) =>
    /nome|fantasia|razao|descr|titulo|label/i.test(k),
  );
  console.log(
    JSON.stringify({
      FILIAL: r.FILIAL ?? r.filial,
      COD_FILIAL: r.COD_FILIAL ?? r.cod_filial,
      NOME: r.NOME ?? r.nome ?? null,
      FANTASIA: r.FANTASIA ?? r.fantasia ?? null,
      CIDADE: r.CIDADE ?? r.cidade ?? null,
      UF: r.UF ?? r.ESTADO ?? r.uf ?? null,
      nameKeys: Object.fromEntries(nameKeys.map((k) => [k, r[k]])),
    }),
  );
}
