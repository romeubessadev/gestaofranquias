import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ProgressBar, Spinner, useToast } from "@/components/ui";
import { paths } from "@/router/paths";
import { useActiveSession, useSession } from "@/session/SessionProvider";
import {
  clearAwaitingInitialSync,
  awaitingInitialSyncSince,
  bumpAwaitingInitialSyncSince,
} from "@/session/awaitingInitialSync";
import {
  calendarDaysInclusive,
  countDaysInWindow,
  fetchLatestSeedJob,
  fetchSeedDaysByStore,
  fetchSyncReady,
  fetchTenantStores,
  seedCoverageWindow,
  seedMonthWindows,
  type SyncStoreRow,
} from "@/data/wedash/salesRepo";
import { calendarTodayIso } from "@/data/wedash/clock";
import { getSupabase } from "@/lib/supabase";
import { BrandMark } from "@/pages/auth/authKit";
import { tenant } from "@/data/wedash/tenant";
import { padTopoEBase } from "@/lib/safeArea";

/** Job na fila sem worker pegar → erro (não espera infinito). */
const STUCK_QUEUED_MS = 90_000;
/** RUNNING sem progresso de dias por muito tempo. */
const STUCK_RUNNING_MS = 20 * 60_000;
/** Janela concluída = ≥90% dos dias do período no banco. */
const WINDOW_DONE_RATIO = 0.9;

type FetchStep = {
  kind: "fetch";
  id: string;
  storeId: string;
  storeName: string;
  from: string;
  to: string;
  expected: number;
  label: string;
  detail: string;
};

type FinalStep = {
  kind: "final";
  id: "dashboard";
  label: string;
  detail?: string;
};

type SyncStep = FetchStep | FinalStep;

function fmtBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildSteps(stores: SyncStoreRow[], seedFrom: string, seedTo: string): SyncStep[] {
  const months = seedMonthWindows(seedFrom, seedTo);
  const fetchSteps: FetchStep[] = [];
  for (const s of stores) {
    for (const w of months) {
      fetchSteps.push({
        kind: "fetch",
        id: `${s.id}:${w.from}:${w.to}`,
        storeId: s.id,
        storeName: s.name,
        from: w.from,
        to: w.to,
        expected: calendarDaysInclusive(w.from, w.to),
        label: s.name,
        detail: `${fmtBr(w.from)} → ${fmtBr(w.to)}`,
      });
    }
  }
  return [
    ...fetchSteps,
    {
      kind: "final",
      id: "dashboard",
      label: "Preparando o dashboard",
      detail: "Liberando a Visão Geral com os dados sincronizados",
    },
  ];
}

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

function windowDone(loaded: number, expected: number): boolean {
  if (expected <= 0) return loaded > 0;
  return loaded >= Math.max(1, Math.ceil(expected * WINDOW_DONE_RATIO));
}

/**
 * Pós-onboarding: steps = (loja × mês SEED) + preparar dashboard.
 * Barra = steps concluídos / total (sem fake %).
 */
export function SyncingPage() {
  const session = useActiveSession();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const { show } = useToast();

  const [stores, setStores] = useState<SyncStoreRow[]>([]);
  const [coverage, setCoverage] = useState<Map<string, Set<string>>>(new Map());
  const [status, setStatus] = useState<"running" | "ready" | "failed">("running");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const toastBusyShown = useRef(false);
  const toastStuckShown = useRef(false);
  const enqueuedOnce = useRef(false);
  const coverageReseedDone = useRef(false);
  const runningSinceRef = useRef<number | null>(null);
  const daysAtRunStartRef = useRef(0);

  const today = calendarTodayIso();
  const win = useMemo(() => seedCoverageWindow(today), [today]);
  const steps = useMemo(() => buildSteps(stores, win.from, win.to), [stores, win.from, win.to]);

  const fetchDoneFlags = useMemo(() => {
    return steps.map((s) => {
      if (s.kind !== "fetch") return false;
      const n = countDaysInWindow(coverage.get(s.storeId), s.from, s.to);
      return windowDone(n, s.expected);
    });
  }, [steps, coverage]);

  const allFetchDone = useMemo(() => {
    const fetchSteps = steps.filter((s): s is FetchStep => s.kind === "fetch");
    if (fetchSteps.length === 0) return false;
    return fetchSteps.every((_, i) => fetchDoneFlags[i]);
  }, [steps, fetchDoneFlags]);

  /** Índice do step ativo (primeiro incompleto). */
  const activeIdx = useMemo(() => {
    if (status === "ready") return steps.length - 1;
    if (status === "failed") return Math.max(0, steps.findIndex((_, i) => !fetchDoneFlags[i]));
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.kind === "fetch" && !fetchDoneFlags[i]) return i;
      if (s.kind === "final") {
        // Só entra no final quando buscas ok (ou job SUCCEEDED com cobertura).
        if (allFetchDone || jobStatus === "SUCCEEDED") return i;
        return Math.max(0, i - 1);
      }
    }
    return 0;
  }, [status, steps, fetchDoneFlags, allFetchDone, jobStatus]);

  const completedCount = useMemo(() => {
    if (status === "ready") return steps.length;
    let n = 0;
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.kind === "fetch" && fetchDoneFlags[i]) n += 1;
    }
    return n;
  }, [status, steps, fetchDoneFlags]);
  const progressPct =
    status === "failed"
      ? 0
      : steps.length === 0
        ? 0
        : status === "ready"
          ? 100
          : Math.min(99, Math.round((completedCount / steps.length) * 100));

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
    const list = await fetchTenantStores(session.tenantId);
    setStores(list);

    const byStore = await fetchSeedDaysByStore(session.tenantId, win.from, win.to);
    setCoverage(byStore);

    const ready = await fetchSyncReady(session.tenantId, {
      sinceIso: since,
      seedFrom: win.from,
      seedTo: win.to,
    });
    if (ready) {
      clearAwaitingInitialSync();
      setBusy(false);
      setStatus("ready");
      setJobStatus("SUCCEEDED");
      return;
    }

    const job = await fetchLatestSeedJob(session.tenantId);
    setJobStatus(job?.status ?? null);

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
        if (isInternalJobCancel(job.error)) {
          setBusy(false);
          setStatus("running");
          enqueuedOnce.current = false;
          await enqueueSeed();
          enqueuedOnce.current = true;
          return;
        }
        const erpBusy = isBusyError(job.error);
        setBusy(erpBusy);
        setStatus("failed");
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
    const waitedMs = since ? Date.now() - new Date(since).getTime() : 0;
    const totalDays = [...byStore.values()].reduce((a, set) => a + set.size, 0);

    if (!jobIsCurrent || !job || job.status === "QUEUED") {
      runningSinceRef.current = null;
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
      if (!enqueuedOnce.current) {
        enqueuedOnce.current = true;
        await enqueueSeed();
      }
      return;
    }

    if (job.status === "RUNNING") {
      if (runningSinceRef.current == null) {
        runningSinceRef.current = Date.now();
        daysAtRunStartRef.current = totalDays;
      } else if (totalDays > daysAtRunStartRef.current) {
        runningSinceRef.current = Date.now();
        daysAtRunStartRef.current = totalDays;
      }
      if (Date.now() - runningSinceRef.current >= STUCK_RUNNING_MS) {
        setStatus("failed");
        setErrorMsg("A sincronização não avançou como esperado. Tente novamente.");
        if (!toastStuckShown.current) {
          toastStuckShown.current = true;
          show("A sincronização não avançou. Tente novamente.", "danger");
        }
        return;
      }
      setStatus("running");
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
        if (!enqueuedOnce.current) {
          enqueuedOnce.current = true;
          await enqueueSeed();
        }
        return;
      }
      if (totalDays <= 0 || !coverageReseedDone.current) {
        // SEED “ok” mas cobertura incompleta → um reseed.
        if (!coverageReseedDone.current) {
          coverageReseedDone.current = true;
          await enqueueSeed();
        }
      }
      return;
    }

    if (!enqueuedOnce.current) {
      enqueuedOnce.current = true;
      await enqueueSeed();
    }
  }, [session.tenantId, show, enqueueSeed, win.from, win.to]);

  useEffect(() => {
    void check();
    const id = window.setInterval(() => void check(), 3_000);
    return () => window.clearInterval(id);
  }, [check]);

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
    bumpAwaitingInitialSyncSince();
    setStatus("running");
    setErrorMsg(null);
    setBusy(false);
    await enqueueSeed();
    enqueuedOnce.current = true;
    await check();
  }

  function sair() {
    signOut();
    navigate(paths.access.login);
  }

  const activeStep = steps[activeIdx];
  const activeLoaded =
    activeStep?.kind === "fetch"
      ? countDaysInWindow(coverage.get(activeStep.storeId), activeStep.from, activeStep.to)
      : 0;

  const subtitle =
    status === "ready"
      ? "Dados sincronizados. Abrindo o dashboard…"
      : status === "failed"
        ? errorMsg
        : busy
          ? "Aguardando liberar a sessão no Millennium…"
          : activeStep?.kind === "fetch"
            ? `Buscando ${activeStep.storeName}: ${activeStep.detail}` +
              (activeStep.expected > 0
                ? ` · ${activeLoaded}/${activeStep.expected} dias`
                : "")
            : "Quase lá — preparando o dashboard.";

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
            <p className="mt-2 text-right text-[11px] text-t3">
              {completedCount}/{steps.length || "—"} · {progressPct}%
            </p>
          )}
        </div>

        <ul className="mt-6 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {steps.length === 0 ? (
            <li className="flex items-center gap-3 text-[13.5px] text-t2">
              <Spinner size={18} />
              Montando a lista de lojas…
            </li>
          ) : (
            steps.map((step, i) => {
              const done =
                status === "ready" ||
                (step.kind === "fetch" && fetchDoneFlags[i]);
              const failedHere = status === "failed" && i === activeIdx;
              const active = status === "running" && i === activeIdx && !done;
              const loaded =
                step.kind === "fetch"
                  ? countDaysInWindow(coverage.get(step.storeId), step.from, step.to)
                  : 0;

              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 text-[13.5px] ${
                    done
                      ? "text-ok"
                      : failedHere
                        ? "font-semibold text-bad"
                        : active
                          ? "font-semibold text-t0"
                          : "text-t3"
                  }`}
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
                    {done ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                        ✓
                      </span>
                    ) : failedHere ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                        !
                      </span>
                    ) : active ? (
                      <Spinner size={18} />
                    ) : (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block">{step.label}</span>
                    {step.kind === "fetch" ? (
                      <span className="mt-0.5 block text-[12px] font-normal text-t2">
                        {step.detail}
                        {active || done
                          ? ` · ${loaded}/${step.expected} dias`
                          : null}
                      </span>
                    ) : step.detail ? (
                      <span className="mt-0.5 block text-[12px] font-normal text-t2">{step.detail}</span>
                    ) : null}
                  </span>
                </li>
              );
            })
          )}
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
