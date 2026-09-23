import { useMemo, useState, useCallback, useEffect } from "react";
import { Avatar, Badge, Card, CardHeader, CardTitle, ProgressBar, RadialProgress, StatCard, DateRangePicker, PageHeader, Button, ThSort, type SortDir } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, DonutChart } from "@/components/charts";
import { useScope } from "@/pages/dashboard/useScope";
import { BrandPicker } from "@/pages/dashboard/BrandPicker";
import { buildOverviewView, resolvePeriod, type OverviewKpi } from "@/data/wedash/dashboard";
import {
  fetchSalesDayAggs,
  fetchSalesHourAggs,
  fetchSalesCoverage,
  fetchSyncWatermark,
  requestForceRefresh,
  requestRangeSync,
  waitForSyncJob,
  waitForLatestForceJob,
} from "@/data/wedash/salesRepo";
import type { SalesDayAgg, SalesHourAgg } from "@/data/wedash/salesTypes";
import { brlCent, deIso, tipRelacao } from "@/lib/format";
import type { DateRange, DateRangeChangeMeta } from "@/components/ui/DateRangePicker";
import { useActiveSession } from "@/session/SessionProvider";
import { canForceSyncRefresh, formatSyncWatermarkLabel, forceCooldownForScopeSec, formatForceCooldownLabel, readForceAtMap, recordForceAt, lastForceAtFromRetryAfter, type ForceAtMap } from "@/data/wedash/syncUi";
import { calendarTodayIso } from "@/data/wedash/clock";
import {
  applyPeriodDateChange,
  dateRangeFromPeriod,
  periodActivePresetId,
  periodDisplayLabel,
} from "@/pages/dashboard/periodPicker";
type TopProdSort = "nome" | "itens" | "faturamento" | "variacao";

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconCmv = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const IconVendas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const KPI_ICONS = [IconFat, IconCmv, IconVendas, IconTicket];

/** Cores fixas para as lojas no donut e barras do Ranking de Lojas. */
const CORES_LOJAS = ["var(--acc)", "var(--info)", "var(--ok)", "var(--warn)", "var(--bad)"];

/** Cores distintas para cada KPI card (hero). */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];

/** Badge de delta — só % no chip; base do comparativo no tooltip (igual StatCard). */
function BadgeVsAnterior({ delta }: { delta?: { value: string; positive: boolean; vs?: string; diff?: string } }) {
  if (!delta) return null;
  const badge = (
    <Badge variant={delta.positive ? "success" : "danger"}>
      {delta.positive ? "+" : "−"}
      {delta.value}
    </Badge>
  );
  if (!delta.vs) return badge;
  const tip = tipRelacao(delta.vs);
  return <Tooltip label={tip}>{badge}</Tooltip>;
}

export default function OverviewPage() {
  const session = useActiveSession();
  const { escopo, mudar } = useScope();
  const [dayAggs, setDayAggs] = useState<SalesDayAgg[]>([]);
  const [hourAggs, setHourAggs] = useState<SalesHourAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [watermark, setWatermark] = useState<Date | null>(null);
  const [coverageFrom, setCoverageFrom] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [forceError, setForceError] = useState<string | null>(null);
  const [forceAtMap, setForceAtMap] = useState<ForceAtMap>(() =>
    readForceAtMap(session.tenantId),
  );
  const [forceCooldownSec, setForceCooldownSec] = useState<number | null>(() =>
    forceCooldownForScopeSec(readForceAtMap(session.tenantId), escopo.filialIds),
  );
  const [topProdSort, setTopProdSort] = useState<TopProdSort>("faturamento");
  const [topProdDir, setTopProdDir] = useState<SortDir>("desc");

  // Contador 5 min do FORCE — por loja (ou “Todas” = opção A).
  useEffect(() => {
    const tick = () =>
      setForceCooldownSec(forceCooldownForScopeSec(forceAtMap, escopo.filialIds));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [forceAtMap, escopo.filialIds]);

  useEffect(() => {
    setForceAtMap(readForceAtMap(session.tenantId));
  }, [session.tenantId]);

  const reloadAggs = useCallback(async () => {
    const periodo = resolvePeriod(escopo.periodo, calendarTodayIso());
    const singleDay = periodo.inicio === periodo.fim;
    const [days, hours, wm, cov] = await Promise.all([
      fetchSalesDayAggs({
        tenantId: session.tenantId,
        storeIds: escopo.filialIds,
        from: periodo.inicio,
        to: periodo.fim,
        // Busca todas as brands; o filtro WEPINK/WPINK é no buildOverviewViewFromAggs.
        // (Hoje o sync só grava ALL — filtrar no SQL zera o painel.)
        brand: null,
      }),
      singleDay
        ? fetchSalesHourAggs({
            tenantId: session.tenantId,
            storeIds: escopo.filialIds,
            day: periodo.inicio,
            brand: null,
          })
        : Promise.resolve([] as SalesHourAgg[]),
      fetchSyncWatermark(session.tenantId),
      fetchSalesCoverage(session.tenantId, escopo.filialIds),
    ]);
    setDayAggs(days);
    setHourAggs(hours);
    setWatermark(wm);
    setCoverageFrom(cov.from ? deIso(cov.from) : null);
  }, [escopo, session.tenantId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await reloadAggs();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadAggs]);

  // Enquanto o primeiro sync não grava watermark, repolha (SEED pode demorar).
  useEffect(() => {
    if (watermark != null) return;
    const id = window.setInterval(() => {
      void reloadAggs();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [watermark, reloadAggs]);

  // Enquanto o histórico ainda cresce (HISTORY), repolha cobertura do picker.
  useEffect(() => {
    const id = window.setInterval(() => {
      void fetchSalesCoverage(session.tenantId, escopo.filialIds).then((cov) => {
        setCoverageFrom(cov.from ? deIso(cov.from) : null);
      });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [session.tenantId, escopo.filialIds]);

  // Período maior que o cache: enfileira RANGE para buracos (dedupe no Edge).
  useEffect(() => {
    if (loading || !canForceSyncRefresh(session.role)) return;
    const periodo = resolvePeriod(escopo.periodo, calendarTodayIso());
    if (periodo.inicio === periodo.fim && periodo.inicio === calendarTodayIso()) return;
    // Não pede RANGE além da cobertura já sincronizada.
    if (coverageFrom) {
      const covIso = (() => {
        const d = coverageFrom;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      })();
      if (periodo.inicio < covIso) return;
    }
    const t = window.setTimeout(() => {
      void requestRangeSync({ from: periodo.inicio, to: periodo.fim });
    }, 800);
    return () => window.clearTimeout(t);
  }, [escopo.periodo, loading, session.role, coverageFrom]);

  const view = useMemo(
    () => buildOverviewView(escopo, { dayAggs, hourAggs }),
    [escopo, dayAggs, hourAggs],
  );

  const canForce = canForceSyncRefresh(session.role);

  const topProdutosOrdenados = useMemo(() => {
    const dir = topProdDir === "asc" ? 1 : -1;
    const itensDe = (sub?: string) => {
      if (!sub) return 0;
      const n = Number(sub.replace(/[^\d]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    return [...view.topProdutos].sort((a, b) => {
      if (topProdSort === "nome") return a.nome.localeCompare(b.nome) * dir;
      if (topProdSort === "itens") return (itensDe(a.sub) - itensDe(b.sub)) * dir;
      if (topProdSort === "variacao") return ((a.trend ?? -Infinity) - (b.trend ?? -Infinity)) * dir;
      return (a.valor - b.valor) * dir;
    });
  }, [view.topProdutos, topProdSort, topProdDir]);

  function toggleTopProdSort(key: TopProdSort) {
    if (topProdSort === key) {
      setTopProdDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setTopProdSort(key);
      setTopProdDir(key === "nome" ? "asc" : "desc");
    }
  }

  // Resolve o DateRange a partir do escopo — sempre mostra algo selecionado.
  const dateRange = useMemo(() => dateRangeFromPeriod(escopo.periodo), [escopo.periodo]);

  function onDateChange(r: DateRange, meta?: DateRangeChangeMeta) {
    mudar(applyPeriodDateChange(escopo, r, meta));
  }
  function onMarcaChange(v: "WEPINK" | "WPINK" | null) {
    mudar({ ...escopo, divisao: v });
  }

  const forcarAtualizacao = useCallback(async () => {
    if (!canForce || refreshing || forceCooldownSec != null) return;
    setRefreshing(true);
    setForceError(null);
    const enqueuedAt = new Date();
    const storeIds = escopo.filialIds;
    const periodo = resolvePeriod(escopo.periodo, calendarTodayIso());
    const result = await requestForceRefresh({
      from: periodo.inicio,
      to: periodo.fim,
      storeIds,
    });
    if (!result.ok) {
      if (result.error === "rate_limited") {
        const at = lastForceAtFromRetryAfter(result.retryAfterSec ?? 300);
        setForceAtMap(recordForceAt(session.tenantId, storeIds, at));
        setForceError(null);
      } else if (result.error === "range_too_large") {
        setForceError("Período máximo de 90 dias por atualização");
      } else if (result.error === "forbidden") {
        setForceError("Sem permissão para atualizar");
      } else if (result.error === "credential_missing" || result.error === "credential_invalid") {
        setForceError("Integração ERP indisponível — confira em Configurações");
      } else {
        setForceError("Não foi possível enfileirar a atualização");
        console.warn("requestForceRefresh:", result.error);
      }
      setRefreshing(false);
      return;
    }

    // Não grava cooldown no enqueue — só quando o job termina (Aguarde 5:00 cheios).
    const wait = result.jobId
      ? await waitForSyncJob(result.jobId)
      : await waitForLatestForceJob(session.tenantId, {
          sinceIso: enqueuedAt.toISOString(),
        });

    if (wait.status === "FAILED") {
      setForceError("Falha ao atualizar — tente de novo em alguns minutos");
      console.warn("FORCE job failed:", wait.error);
    } else if (wait.status === "TIMEOUT") {
      setForceError("Atualização ainda em andamento — os dados podem chegar em instantes");
    } else if (wait.status === "CANCELLED") {
      setRefreshing(false);
      return;
    } else if (wait.status === "SUCCEEDED") {
      // 5 min a partir do fim (loja ou Todas) — alinhado ao Edge finished_at.
      setForceAtMap(recordForceAt(session.tenantId, storeIds, new Date()));
    }

    try {
      await reloadAggs();
    } finally {
      setRefreshing(false);
    }
  }, [canForce, refreshing, forceCooldownSec, reloadAggs, escopo.periodo, escopo.filialIds, session.tenantId]);

  const minutosAtras =
    watermark != null ? Math.floor((Date.now() - watermark.getTime()) / 60000) : null;
  const rotuloAtualizacao = formatSyncWatermarkLabel(watermark, { loading });

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Visão geral" }]}
        title="Visão geral"
        subtitle="Indicadores, metas e desempenho da operação."
        actions={
          <>
            {!refreshing && (
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras != null && minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras != null && minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            )}
            {forceError && <span className="text-[12px] text-bad">{forceError}</span>}
            {canForce && (
            <Button
              size="sm"
              onClick={() => void forcarAtualizacao()}
              disabled={refreshing || loading || forceCooldownSec != null}
              title={
                refreshing
                  ? "Buscando dados no ERP…"
                  : forceCooldownSec != null
                    ? `Próxima atualização em ${formatForceCooldownLabel(forceCooldownSec)} · protege o ERP (1× / 5 min)`
                    : escopo.filialIds.length === 1
                      ? "Atualiza só a loja selecionada (período filtrado + hoje) · máx. 90 dias · 1× / 5 min"
                      : "Atualiza todas as lojas (período filtrado + hoje) · máx. 90 dias · 1× / 5 min"
              }
              icon={refreshing ? undefined : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
            >
              {refreshing
                ? "Atualizando…"
                : forceCooldownSec != null
                  ? `Aguarde ${formatForceCooldownLabel(forceCooldownSec)}`
                  : "Atualizar"}
            </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => window.print()}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
            >
              Exportar
            </Button>
            <DateRangePicker
              value={dateRange}
              onChange={onDateChange}
              displayLabel={periodDisplayLabel(escopo.periodo)}
              activePresetId={periodActivePresetId(escopo.periodo)}
              size="sm"
              minDate={coverageFrom}
            />
            <BrandPicker value={escopo.divisao} onChange={onMarcaChange} />

          </>
        }
      />

      {/* KPI row — 4 cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} Icon={KPI_ICONS[i]} colorIdx={i} />
        ))}
      </div>

      {!loading && dayAggs.length === 0 && (
        <Card className="mt-4">
          <p className="py-6 text-center text-[13px] text-t2">
            Ainda não há vendas neste período. A carga inicial cobre o mês anterior e o atual; use Atualizar para buscar buracos + hoje.
          </p>
        </Card>
      )}

      {/* Linha: Atingimento da Meta + Faturamento vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        {(() => {
          const meta = view.gauges.find((g) => g.nome === "Meta") ?? view.gauges[0];
          const fatAcum = view.evolucao[view.evolucao.length - 1]?.realizado ?? 0;
          const pct = meta ? Math.round(meta.pct) : 0;
          const realizado = meta?.realizado ?? fatAcum;
          const alvo = meta?.alvo ?? 0;
          const faltamValor = meta ? Math.max(0, meta.alvo - meta.realizado) : 0;
          const projecaoValor = meta
            ? (view.projecaoFechamento?.replace(/^Projeção:\s*/i, "") ?? "—")
            : "—";
          return (
            <Card>
              <div className="mb-4">
                <CardTitle>Atingimento da meta</CardTitle>
              </div>
              {!meta && (
                <div className="mb-3 flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: "var(--warn-soft)" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--warn)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold" style={{ color: "var(--warn)" }}>
                      Meta não configurada
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-t1">
                      Cadastre em Metas para acompanhar o atingimento.
                    </p>
                  </div>
                </div>
              )}
              <div className="relative mx-auto mb-4 h-[150px] w-[150px]">
                <RadialProgress value={pct} size={150} stroke={15} trackColor="var(--bg-inset)" label="da meta" />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Faturamento</span>
                  <span className="text-[13px] font-bold text-t0">{brlCent(realizado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Meta do mês</span>
                  <span className={`text-[13px] font-bold ${meta && pct < 100 ? "text-warn" : meta ? "text-ok" : "text-t2"}`}>
                    {meta ? brlCent(alvo) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Faltam</span>
                  <span className={`text-[13px] font-bold ${meta && faltamValor > 0 ? "text-warn" : meta ? "text-ok" : "text-t2"}`}>
                    {!meta ? "—" : faltamValor <= 0 ? "Meta atingida" : brlCent(faltamValor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Projeção</span>
                  <span className={`text-[13px] font-bold ${meta ? "text-t0" : "text-t2"}`}>{projecaoValor}</span>
                </div>
              </div>
            </Card>
          );
        })()}

        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle>Faturamento x meta</CardTitle>
                <Tooltip label="Mostra se o faturamento acompanha o ritmo necessário para atingir a meta.">
                  <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
                    ?
                  </span>
                </Tooltip>
              </div>
              <p className="mt-0.5 text-[11px] font-semibold text-t2">{view.rotuloSerie}</p>
              <div className="mt-2.5 flex flex-wrap gap-5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--ok)]" />Realizado
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlCent(view.evolucao[view.evolucao.length - 1]?.realizado ?? 0)}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Goal
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlCent(view.evolucao[view.evolucao.length - 1]?.meta ?? 0)}
                  </p>
                </div>
              </div>
            </div>
            <BadgeVsAnterior delta={view.deltaFaturamento} />
          </div>
          <AreaLineChart
            data={view.evolucao.map((e) => e.realizado)}
            compareData={view.evolucao.map((e) => e.meta)}
            labels={view.evolucao.map((e) => e.label)}
            color="var(--ok)"
            compareColor="var(--warn)"
            formatValue={brlCent}
            showAxisLabels
          />
        </Card>
      </div>

      {/* Linha: Categoria vs Meta + Dia da Semana vs Meta (Dia some em período de 1 dia) */}
      <div className={`mt-4 grid grid-cols-1 gap-4 ${view.diaVsMeta.length > 0 ? "lg:grid-cols-2" : ""}`}>
        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle>Categorias x meta</CardTitle>
                <Tooltip label="Evidencia as categorias acima ou abaixo da meta no período.">
                  <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
                    ?
                  </span>
                </Tooltip>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--acc)]" />Realizado
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlCent(view.categoriaVsMeta.reduce((s, c) => s + c.realizado, 0))}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Goal
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlCent(view.categoriaVsMeta.reduce((s, c) => s + c.meta, 0))}
                  </p>
                </div>
              </div>
            </div>
            <BadgeVsAnterior delta={view.deltaFaturamento} />
          </div>
          <AreaLineChart
            data={view.categoriaVsMeta.map((c) => c.realizado)}
            compareData={view.categoriaVsMeta.map((c) => c.meta)}
            labels={view.categoriaVsMeta.map((c) => c.categoria)}
            color="var(--acc)"
            compareColor="var(--warn)"
            formatValue={brlCent}
            showAxisLabels
          />
        </Card>
        {view.diaVsMeta.length > 0 && (
          <Card padding="lg">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle>Dias da semana x meta</CardTitle>
                  <Tooltip label="Revela em quais dias o faturamento médio supera ou fica abaixo da meta diária.">
                    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
                      ?
                    </span>
                  </Tooltip>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-5">
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--info)]" />Realizado
                    </span>
                    <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                      {brlCent(view.diaVsMeta.reduce((s, d) => s + d.realizado, 0))}
                    </p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Goal
                    </span>
                    <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                      {brlCent(view.diaVsMeta.reduce((s, d) => s + d.meta, 0))}
                    </p>
                  </div>
                </div>
              </div>
              <BadgeVsAnterior delta={view.deltaFaturamento} />
            </div>
            <AreaLineChart
              data={view.diaVsMeta.map((d) => d.realizado)}
              compareData={view.diaVsMeta.map((d) => d.meta)}
              labels={view.diaVsMeta.map((d) => d.dia)}
              color="var(--info)"
              compareColor="var(--warn)"
              formatValue={brlCent}
              showAxisLabels
            />
          </Card>
        )}
      </div>

      {/* Linha: Ranking de Lojas + Formas de Pagamento */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="mb-1 flex items-center justify-between">
            <CardTitle>Ranking de lojas</CardTitle>
            <Badge variant="accent">Rede: {brlCent(view.rankingLojas.reduce((s, l) => s + l.valor, 0))}</Badge>
          </div>
          {view.rankingLojas.length === 0 ? (
            <span className="py-6 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
          ) : (
            (() => {
              const total = view.rankingLojas.reduce((s, l) => s + l.valor, 0) || 1;
              return (
                <>
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <DonutChart
                      segments={view.rankingLojas.map((l, i) => ({
                        label: l.nome,
                        value: l.valor,
                        color: CORES_LOJAS[i % CORES_LOJAS.length],
                      }))}
                      size={148}
                      thickness={20}
                      centerLabel="Total"
                      centerValue={brlCent(total)}
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {view.rankingLojas.map((loja, idx) => {
                      const pctMeta = loja.pctMeta != null ? Math.round(loja.pctMeta) : 0;
                      const cor = CORES_LOJAS[idx % CORES_LOJAS.length];
                      return (
                        <div key={loja.nome} className="rounded-xl bg-bg-inset p-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[13px] font-bold text-t0">
                              <span className="h-2.5 w-2.5 rounded-[4px]" style={{ background: cor }} />
                              {loja.nome}
                            </span>
                            <span className="font-mono text-[13px] font-extrabold text-t0">{brlCent(loja.valor)}</span>
                          </div>
                          <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctMeta)}%`, background: cor }} />
                          </div>
                          <span className="text-[11px] font-semibold text-t2">
                            {pctMeta}% da meta
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()
          )}
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Formas de pagamento</CardTitle>
          </CardHeader>
          {view.formasPagamento.length === 0 ? (
            <span className="flex flex-1 items-center justify-center py-6 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
          ) : (
            (() => {
              const total = view.formasPagamento.reduce((s, f) => s + f.valor, 0) || 1;
              return (
                <div className="flex flex-1 flex-col justify-center px-4 pb-4">
                  {/* Padrão Expense breakdown — igual Financeiro */}
                  <div className="mx-auto my-2">
                    <DonutChart
                      segments={view.formasPagamento.map((f) => ({
                        label: f.forma,
                        value: f.valor,
                        color: f.cor,
                      }))}
                      centerLabel="Total"
                      centerValue={brlCent(total)}
                    />
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {view.formasPagamento.map((f) => {
                      const pct = Math.round((f.valor / total) * 100);
                      return (
                        <div key={f.forma} className="flex items-center gap-2.5">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: f.cor }} />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-t1">{f.forma}</span>
                          <span className="shrink-0 font-mono text-[12.5px] font-bold text-t0">{brlCent(f.valor)}</span>
                          <span className="min-w-[32px] shrink-0 text-right text-[11.5px] font-semibold text-t2">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </Card>
      </div>

      {/* Par: Top Vendedoras + Top Produtos */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex w-full items-center justify-between gap-1.5">
              <CardTitle>Top vendedoras</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {view.topVendedoras.map((v, idx) => {
              const pct = v.pctMeta ?? 0;
              return (
                <div key={v.nome} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-extrabold text-t1">{idx + 1}</span>
                  <Avatar name={v.nome} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[13px] font-bold text-t0">{v.nome}</span>
                      <span className="font-mono text-[13px] font-extrabold text-ok">{brlCent(v.valor)}</span>
                    </div>
                    <ProgressBar value={pct} height={5} />
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-t2">
                      <span>{v.sub?.split("·")[0]?.trim() ?? ""}</span>
                      {v.ticketMedio != null && v.ticketMedio > 0 && (
                        <>
                          <span>·</span>
                          <span>Ticket médio {brlCent(v.ticketMedio)}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className={pct >= 100 ? "font-semibold text-ok" : ""}>{Math.round(pct)}% da meta</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {view.topVendedoras.length === 0 && (
              <span className="py-4 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex w-full items-center justify-between gap-1.5">
              <CardTitle>Top produtos</CardTitle>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <ThSort
                    label="Produto"
                    active={topProdSort === "nome"}
                    dir={topProdDir}
                    onClick={() => toggleTopProdSort("nome")}
                    align="left"
                    className="px-1 pb-3"
                  />
                  <ThSort
                    label="Itens vendidos"
                    active={topProdSort === "itens"}
                    dir={topProdDir}
                    onClick={() => toggleTopProdSort("itens")}
                    className="px-1 pb-3"
                  />
                  <ThSort
                    label="Faturamento"
                    active={topProdSort === "faturamento"}
                    dir={topProdDir}
                    onClick={() => toggleTopProdSort("faturamento")}
                    className="px-1 pb-3"
                  />
                  <ThSort
                    label="Variação"
                    active={topProdSort === "variacao"}
                    dir={topProdDir}
                    onClick={() => toggleTopProdSort("variacao")}
                    className="px-1 pb-3"
                  />
                </tr>
              </thead>
              <tbody>
                {topProdutosOrdenados.map((p, idx) => {
                  const iniciais = p.nome.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
                  const cores = ["var(--ok)", "var(--info)", "var(--warn)", "var(--acc)", "var(--bad)"];
                  const corAvatar = cores[idx % cores.length];
                  return (
                    <tr key={p.nome} className="border-b border-line last:border-b-0">
                      <td className="px-1 py-3 text-center text-[13px] font-extrabold text-t2">{idx + 1}</td>
                      <td className="px-1 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold" style={{ background: `color-mix(in srgb, ${corAvatar} 15%, transparent)`, color: corAvatar }}>{iniciais || "?"}</span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-t0">{p.nome}</p>
                            {p.categoria && <p className="text-[11px] text-t2">{p.categoria}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{p.sub?.replace(" itens", "") ?? "—"}</td>
                      <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{brlCent(p.valor)}</td>
                      <td className="px-1 py-3 text-right text-xs font-bold" style={{ color: p.trend != null ? (p.trend >= 0 ? "var(--ok)" : "var(--bad)") : undefined }}>
                        {p.trend != null ? `${p.trend >= 0 ? "+" : ""}${p.trend}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
                {topProdutosOrdenados.length === 0 && (
                  <tr><td colSpan={5} className="px-1 py-3 text-center text-[13px] text-t2">Sem dados no período selecionado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ kpi, Icon, colorIdx = 0 }: { kpi: OverviewKpi; Icon: () => React.JSX.Element; colorIdx?: number }) {
  const c = KPI_COLORS[colorIdx % KPI_COLORS.length];
  return (
    <StatCard
      label={kpi.label}
      value={kpi.valor}
      icon={<Icon />}
      iconColor={c.iconColor}
      iconBg={c.iconBg}
      delta={kpi.delta}
      sub={kpi.sub}
      tooltip={kpi.tooltip}
    />
  );
}