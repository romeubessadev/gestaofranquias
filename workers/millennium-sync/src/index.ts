/**
 * Poll loop — claim sync_job → run Millennium sync → enqueue due LIGHT jobs.
 *
 * Run from this folder:
 *   npm install
 *   cp .env.example .env   # fill values
 *   npm start
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient, enqueueDueLightJobs, processOneJob } from "./deps.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Load key=value from workers/millennium-sync/.env (simple, no dependency). */
function loadDotEnv() {
  const candidates = [
    resolve(__dirname, "../.env"),
    resolve(__dirname, "../../../.env"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    // Map Vite names if present
    if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
      process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    }
    console.log(`[env] loaded ${path}`);
    return;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadDotEnv();

  const pollMs = Number(process.env.POLL_INTERVAL_MS ?? "45000") || 45_000;
  const erpSecret = process.env.ERP_SECRET_KEY?.trim();
  if (!erpSecret) throw new Error("Missing ERP_SECRET_KEY");
  if (!process.env.SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API → service_role)");
  }

  const sb = createAdminClient();
  console.log(`[sync] worker up · poll ${pollMs}ms · millennium ${process.env.MILLENNIUM_API_BASE ?? "(default)"}`);

  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    console.log("[sync] shutting down…");
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  while (!stopping) {
    try {
      let worked = false;
      // Drain queue (cap per tick)
      for (let i = 0; i < 5; i++) {
        const did = await processOneJob(sb, erpSecret);
        if (!did) break;
        worked = true;
      }
      const n = await enqueueDueLightJobs(sb);
      if (n > 0) console.log(`[sync] enqueued ${n} LIGHT job(s)`);
      if (!worked && n === 0) {
        /* idle */
      }
    } catch (e) {
      console.error("[sync] tick error", e instanceof Error ? e.message : e);
    }
    if (stopping) break;
    await sleep(pollMs);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
