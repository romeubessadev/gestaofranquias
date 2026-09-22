/**
 * Poll loop — claim sync_job → run Millennium sync → enqueue due LIGHT jobs.
 *
 * Run from this folder:
 *   npm install
 *   cp .env.example .env   # fill values
 *   npm start
 *
 * Pausar / liberar usuário do ERP (outro terminal):
 *   npm run erp -- pause | resume | logout | status
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient, disconnectTenantSessions, enqueueDueLightJobs, processOneJob, recoverOnStartup, recoverStaleRunningJobs } from "./deps.ts";
import { logoutMillennium } from "./millenniumAuth.ts";
import { releaseActiveMillenniumSession } from "./runSyncJob.ts";
import { isWorkerPaused } from "./workerPause.ts";
import { acquireWorkerLock, releaseWorkerLock } from "./workerLock.ts";

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
    console.log(`Ambiente carregado: ${path}`);
    return;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadDotEnv();
  acquireWorkerLock();

  const pollMs = Number(process.env.POLL_INTERVAL_MS ?? "45000") || 45_000;
  const erpSecret = process.env.ERP_SECRET_KEY?.trim();
  if (!erpSecret) throw new Error("Missing ERP_SECRET_KEY");
  if (!process.env.SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API → service_role)");
  }

  const sb = createAdminClient();
  await recoverOnStartup(sb);
  console.log(
    `Worker Millennium · poll ${Math.round(pollMs / 1000)}s · SEED/HISTORY com filial; LIGHT hoje sem filial · desconectar em Configurações > Integração ERP`,
  );
  if (isWorkerPaused()) {
    console.log("⚠ Pausado local (.millennium-pause) — npm run erp -- resume");
  }

  let stopping = false;
  let wasPaused = isWorkerPaused();
  let lastIdleLog = 0;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    console.log("Encerrando… (token ERP do tenant permanece até pause/logout)");
    void releaseActiveMillenniumSession(logoutMillennium).finally(() => {
      releaseWorkerLock();
    });
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  process.on("exit", () => {
    releaseWorkerLock();
  });

  while (!stopping) {
    try {
      const paused = isWorkerPaused();
      if (paused && !wasPaused) {
        console.log("Pausa local — liberando sessão Millennium…");
        await releaseActiveMillenniumSession(logoutMillennium);
        const n = await disconnectTenantSessions(sb, logoutMillennium);
        console.log(`Pausado · ${n} sessão(ões) encerrada(s)`);
      }
      if (!paused && wasPaused) {
        console.log("Retomado");
      }
      wasPaused = paused;

      if (!paused) {
        const stale = await recoverStaleRunningJobs(sb);
        if (stale > 0) console.log(`Recuperados ${stale} job(s) travados`);
        let worked = false;
        for (let i = 0; i < 5; i++) {
          const did = await processOneJob(sb, erpSecret);
          if (!did) break;
          worked = true;
        }
        const n = await enqueueDueLightJobs(sb);
        if (n > 0) console.log(`+${n} sync do dia (LIGHT)`);
        if (!worked && n === 0) {
          const now = Date.now();
          if (now - lastIdleLog > 5 * 60_000) {
            console.log("Aguardando… (sem job com presença WeDash)");
            lastIdleLog = now;
          }
        } else {
          lastIdleLog = 0;
        }
      }
    } catch (e) {
      console.error("Erro no ciclo:", e instanceof Error ? e.message : e);
    }
    if (stopping) break;
    await sleep(pollMs);
  }

  releaseWorkerLock();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  releaseWorkerLock();
  process.exit(1);
});
