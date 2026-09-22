import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ProgressBar, useToast } from "@/components/ui";
import { paths } from "@/router/paths";
import { useActiveSession, useSession } from "@/session/SessionProvider";
import { clearAwaitingInitialSync, awaitingInitialSyncSince, bumpAwaitingInitialSyncSince } from "@/session/awaitingInitialSync";
import {
  countSalesDays,
  fetchLatestSeedJob,
  fetchSyncReady,
  seedCoverageWindow,
} from "@/data/wedash/salesRepo";
import { calendarTodayIso } from "@/data/wedash/clock";
import { getSupabase } from "@/lib/supabase";
import { BrandMark } from "@/pages/auth/authKit";
import { tenant } from "@/data/wedash/tenant";
import { padTopoEBase } from "@/lib/safeArea";

const STEPS = [
  "Conectando ao Millennium",
  "Buscando vendas do mês anterior até hoje",
  "Salvando os dados na WeDash",
  "Preparando o dashboard",
] as const;

const STAGE_PCT = 25;
/** Dentro da etapa ativa sobe até 24% (fake) — os 25% só fecham ao concluir de fato. */
const WITHIN_MAX = 24;
/** Job na fila sem worker pegar → erro (não espera infinito). */
const STUCK_QUEUED_MS = 90_000;
/** RUNNING sem progresso de dias por muito tempo (SEED pode demorar; teto de segurança). */
const STUCK_RUNNING_MS = 20 * 60_000;

function isBusyError(msg: string | null | undefined): boolean {
  if (!msg) return false;
  const t = msg.toLowerCase();
  return (
    t.includes("ultrapassado") ||
    t.includes("já está conectado") ||
    t.includes("ja esta conectado") ||
    t.includes("máximo") ||
    t.includes("maximo") ||
    t.includes("busy")
  );
}

/** Cancelamentos operacionais do worker — nunca mostrar ao franqueado. */
function isInternalJobCancel(msg: string | null | undefined): boolean {
  if (!msg) return false;
  const t = msg.toLowerCase();
  return (
    t.includes("onboarding") ||
    t.includes("pausado") ||
    t.includes("reset") ||
    t.includes("worker reiniciado") ||
    t.includes("abandonado")
  );
}

/**
 * Pós-onboarding: 4 etapas × 25%.
 * Conectar = rápido (QUEUED→RUNNING). Buscar = fica em loading até o SEED terminar (SUCCEEDED).
 */
export function SyncingPage() {
  const session = useActiveSession();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const { show } = useToast();
  /** Etapa ativa (0–3). Etapas i < stepIdx já concluídas (✓). */
  const [stepIdx, setStepIdx] = useState(0);
  /** 0–24: progresso fake dentro da etapa ativa. */
  const [withinPct, setWithinPct] = useState(0);
  const [status, setStatus] = useState<"running" | "ready" | "failed">("running");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [daysLoaded, setDaysLoaded] = useState(0);
  const [expectedDays, setExpectedDays] = useState(0);
  const toastBusyShown = useRef(false);
  const toastStuckShown = useRef(false);
  const enqueuedOnce = useRef(false);
  const coverageReseedDone = useRef(false);
  /** Quando o job passou a RUNNING (pra timeout de progresso). */
  const runningSinceRef = useRef<number | null>(null);
  const daysAtRunStartRef = useRef(0);

  const goToStage = useCallback((next: number) => {
    const capped = Math.max(0, Math.min(next, STEPS.length - 1));
    setStepIdx((prev) => {
      if (capped === prev) return prev;
      setWithinPct(0);
      return capped;
    });
  }, []);

  const enqueueSeed = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    try {
      await sb.functions.invoke("erp-sync-enqueue", { body: { action: "seed" } });
    } catch (e) {
      console.warn("enqueue seed:", e);
    }
  }, []);

  const check = useCallback(async () => {
    const since = awaitingInitialSyncSince();
    const today = calendarTodayIso();
    const win = seedCoverageWindow(today);
    setExpectedDays(win.expectedDays);

    const days = await countSalesDays(session.tenantId, win.from, win.to);
    setDaysLoaded(days);

    const ready = await fetchSyncReady(session.tenantId, {
      sinceIso: since,
      seedFrom: win.from,
      seedTo: win.to,
    });
    if (ready) {
      clearAwaitingInitialSync();
      setBusy(false);
      setStatus("ready");
      setStepIdx(STEPS.length - 1);
      setWithinPct(WITHIN_MAX);
      return;
    }

    const job = await fetchLatestSeedJob(session.tenantId);

    // Job antigo (antes deste onboarding) não conta como progresso atual.
    // Sem `since`, não confia em SUCCEEDED antigo.
    const jobIsCurrent = Boolean(
      since &&
        job?.createdAt &&
        new Date(job.createdAt).getTime() >= new Date(since).getTime() - 5_000,
    );

    if (jobIsCurrent && job?.status === "FAILED") {
      const finishedOk =
        job.finishedAt && since
          ? new Date(job.finishedAt).getTime() >= new Date(since).getTime()
          : Boolean(job.finishedAt);
      if (finishedOk) {
        // Cancelamento interno (ex.: “pausado — onboarding”) → re-enfileira, sem assustar.
        if (isInternalJobCancel(job.error)) {
          setBusy(false);
          setStatus("running");
          goToStage(0);
          enqueuedOnce.current = false;
          await enqueueSeed();
          enqueuedOnce.current = true;
          return;
        }
        const erpBusy = isBusyError(job.error);
        setBusy(erpBusy);
        setStatus("failed");
        // Busy = sessão/login não ficou pronto — não marcar "Conectando" como ✓.
        goToStage(0);
        if (erpBusy) {
          setErrorMsg(
            "Este usuário já está logado no Millennium em outro lugar. Saia do ERP nessa outra sessão e toque em Tentar novamente.",
          );
          if (!toastBusyShown.current) {
            toastBusyShown.current = true;
            show(
              "Usuário ocupado no Millennium. Saia do ERP no outro lugar e tente de novo.",
              "warning",
            );
          }
        } else {
          setErrorMsg("Não foi possível concluir a sincronização. Tente novamente.");
        }
        return;
      }
    }

    setBusy(false);

    const coverageAlmost =
      win.expectedDays > 0 && days >= Math.ceil(win.expectedDays * 0.9);

    const waitedMs = since ? Date.now() - new Date(since).getTime() : 0;

    // 0 Conectando — na fila / ainda sem job
    // 1 Buscando  — RUNNING (login ok; varredura em andamento). Só sai no SUCCEEDED.
    // 2 Salvando  — SEED acabou, dados no banco, cobertura ainda fechando
    // 3 Preparando — cobertura ok; ready redireciona
    if (!jobIsCurrent || !job || job.status === "QUEUED") {
      runningSinceRef.current = null;
      // Worker offline / fila parada: não deixa o gestor esperando pra sempre.
      if (waitedMs >= STUCK_QUEUED_MS) {
        setStatus("failed");
        setErrorMsg(
          "A sincronização demorou para começar. Tente novamente. Se o problema continuar, fale com o suporte.",
        );
        if (!toastStuckShown.current) {
          toastStuckShown.current = true;
          show("A sincronização não começou. Tente novamente.", "danger");
        }
        return;
      }
      setStatus("running");
      goToStage(0);
      if (!enqueuedOnce.current) {
        enqueuedOnce.current = true;
        await enqueueSeed();
      }
      return;
    }

    if (job.status === "RUNNING") {
      if (runningSinceRef.current == null) {
        runningSinceRef.current = Date.now();
        daysAtRunStartRef.current = days;
      } else if (days > daysAtRunStartRef.current) {
        // Ainda gravando dias — renova o relógio de “sem progresso”.
        runningSinceRef.current = Date.now();
        daysAtRunStartRef.current = days;
      }
      const runMs = Date.now() - runningSinceRef.current;
      if (runMs >= STUCK_RUNNING_MS) {
        setStatus("failed");
        setErrorMsg("A sincronização não avançou como esperado. Tente novamente.");
        if (!toastStuckShown.current) {
          toastStuckShown.current = true;
          show("A sincronização não avançou. Tente novamente.", "danger");
        }
        return;
      }
      setStatus("running");
      goToStage(1);
      return;
    }

    runningSinceRef.current = null;
    setStatus("running");

    if (job.status === "SUCCEEDED") {
      const finishedOk =
        Boolean(since) &&
        Boolean(job.finishedAt) &&
        new Date(job.finishedAt!).getTime() >= new Date(since!).getTime();
      if (!finishedOk) {
        // SUCCEEDED antigo (antes deste onboarding) — ignora e re-enfileira.
        goToStage(0);
        if (!enqueuedOnce.current) {
          enqueuedOnce.current = true;
          await enqueueSeed();
        }
        return;
      }
      // Buscando só fica ✓ se o SEED desta rodada gravou dados de verdade.
      if (days <= 0) {
        goToStage(1);
        if (!coverageReseedDone.current) {
          coverageReseedDone.current = true;
          await enqueueSeed();
        }
        return;
      }
      if (coverageAlmost) goToStage(3);
      else goToStage(2);
      if (!coverageAlmost && !coverageReseedDone.current) {
        coverageReseedDone.current = true;
        await enqueueSeed();
      }
      return;
    }

    goToStage(0);
    if (!enqueuedOnce.current) {
      enqueuedOnce.current = true;
      await enqueueSeed();
    }
  }, [session.tenantId, show, enqueueSeed, goToStage]);

  useEffect(() => {
    void check();
    const id = window.setInterval(() => void check(), 3_000);
    return () => window.clearInterval(id);
  }, [check]);

  // Subida fake dentro da etapa ativa (nunca fecha os 25% sozinha).
  // Na etapa "Buscando", o ritmo acompanha dias carregados quando possível.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      setWithinPct((w) => {
        if (stepIdx === 1 && expectedDays > 0 && daysLoaded > 0) {
          const fromDays = Math.min(
            WITHIN_MAX,
            Math.floor((daysLoaded / expectedDays) * WITHIN_MAX),
          );
          return Math.max(w, fromDays);
        }
        return w >= WITHIN_MAX ? WITHIN_MAX : w + 1;
      });
    }, 650);
    return () => window.clearInterval(id);
  }, [status, stepIdx, daysLoaded, expectedDays]);

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => {
      void (async () => {
        enqueuedOnce.current = false;
        await enqueueSeed();
        await check();
      })();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [busy, enqueueSeed, check]);

  useEffect(() => {
    if (status !== "ready") return;
    const t = window.setTimeout(() => {
      navigate(paths.overview, { replace: true });
    }, 900);
    return () => window.clearTimeout(t);
  }, [status, navigate]);

  async function retrySeed() {
    toastBusyShown.current = false;
    toastStuckShown.current = false;
    enqueuedOnce.current = false;
    coverageReseedDone.current = false;
    runningSinceRef.current = null;
    daysAtRunStartRef.current = 0;
    // Novo prazo pra “não começou” — senão o timeout antigo dispara na hora.
    bumpAwaitingInitialSyncSince();
    setStatus("running");
    setErrorMsg(null);
    setBusy(false);
    setStepIdx(0);
    setWithinPct(0);
    await enqueueSeed();
    enqueuedOnce.current = true;
    await check();
  }

  function sair() {
    // Mantém o flag de sync — ao voltar, retoma a tela se ainda faltar carga.
    signOut();
    navigate(paths.access.login);
  }

  const progressPct =
    status === "ready"
      ? 100
      : status === "failed"
        ? 0
        : Math.min(99, stepIdx * STAGE_PCT + withinPct);

  const subtitle =
    status === "ready"
      ? "Dados sincronizados. Abrindo o dashboard…"
      : status === "failed"
        ? errorMsg
        : stepIdx === 1 && expectedDays > 0
          ? `Buscando vendas: ${daysLoaded} de aproximadamente ${expectedDays} dias.`
          : "Estamos preparando os dados do mês anterior até hoje. O dashboard será liberado ao concluir.";

  return (
    <div
      className="pad-topo pad-base flex min-h-screen w-full flex-col bg-bg-0 px-6 pb-10 sm:px-14"
      style={padTopoEBase("2.5rem", "2.5rem")}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandMark size={34} />
          <span className="text-[16px] font-extrabold text-t0">{tenant.nomeExibicao}</span>
        </div>
        <button
          type="button"
          onClick={sair}
          className="min-h-11 min-w-11 px-2 text-xs font-semibold text-t2 hover:text-t0"
        >
          Sair
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
        <h1 className="text-[22px] font-bold text-t0">
          {status === "ready"
            ? "Tudo pronto!"
            : busy
              ? "Aguardando o Millennium"
              : status === "failed"
                ? "Sincronização interrompida"
                : "Sincronizando suas vendas"}
        </h1>
        <p className="mt-2 text-[14px] text-t2">{subtitle}</p>

        <div className="mt-8">
          <ProgressBar
            value={progressPct}
            color={status === "failed" ? "var(--bad)" : "var(--acc)"}
          />
          {status === "running" && (
            <p className="mt-2 text-right text-[11px] text-t3">{progressPct}%</p>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {STEPS.map((label, i) => {
            const done = status === "ready" || (status === "running" && i < stepIdx);
            const failedHere = status === "failed" && i === 0;
            const active = status === "running" && i === stepIdx;
            return (
              <li
                key={label}
                className={`flex items-start gap-3 text-[13.5px] ${
                  done
                    ? "text-ok"
                    : failedHere
                      ? "text-bad font-semibold"
                      : active
                        ? "text-t0 font-semibold"
                        : "text-t3"
                }`}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px]">
                  {done ? "✓" : failedHere ? "!" : active ? "…" : i + 1}
                </span>
                <span>
                  {label}
                  {active && i === 1 && expectedDays > 0 ? (
                    <span className="mt-0.5 block text-[12px] font-normal text-t2">
                      {daysLoaded} de aproximadamente {expectedDays} dias
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        {status === "failed" && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={() => void retrySeed()}>Tentar novamente</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SyncingPage;
