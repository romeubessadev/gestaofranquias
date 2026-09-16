import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Card, CardHeader, CardTitle, ProgressBar, RadialProgress, StatCard, DateRangePicker, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, DonutChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarVisaoGeralView, type VisaoKpi } from "@/data/gestao/dashboard";
import { brlK } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";

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
  const tip = `Comparado a ${delta.vs}: ${delta.positive ? "acima" : "abaixo"}${delta.diff ? ` (${delta.diff})` : ""}`;
  return <Tooltip label={tip}>{badge}</Tooltip>;
}

export default function VisaoGeralPage() {
  const { escopo, mudar } = useEscopo();
  const view = useMemo(() => montarVisaoGeralView(escopo), [escopo]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Resolve o DateRange a partir do escopo — sempre mostra algo selecionado.
  const dateRange: DateRange | null = useMemo(() => {
    if (escopo.periodo.tipo === "personalizado" && escopo.periodo.inicio && escopo.periodo.fim) {
      return [deIso(escopo.periodo.inicio), deIso(escopo.periodo.fim)];
    }
    // Para presets, resolve o intervalo correspondente para exibir no picker.
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    switch (escopo.periodo.tipo) {
      case "hoje": return [hoje, hoje];
      case "ontem": { const y = new Date(hoje); y.setDate(y.getDate() - 1); return [y, y]; }
      case "7dias": { const s = new Date(hoje); s.setDate(s.getDate() - 6); return [s, hoje]; }
      case "esteMes": return [new Date(hoje.getFullYear(), hoje.getMonth(), 1), hoje];
      case "mesPassado": return [new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), new Date(hoje.getFullYear(), hoje.getMonth(), 0)];
      default: return null;
    }
  }, [escopo.periodo]);

  function onDateChange(r: DateRange) {
    mudar({ ...escopo, periodo: { tipo: "personalizado", inicio: r[0].toISOString().slice(0, 10), fim: r[1].toISOString().slice(0, 10) } });
  }
  function onMarcaChange(v: "WEPINK" | "WPINK" | null) {
    mudar({ ...escopo, divisao: v });
  }

  const navigate = useNavigate();

  const forcarAtualizacao = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => { setUltimaAtualizacao(new Date()); setRefreshing(false); }, 600);
  }, []);

  const minutosAtras = Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 60000);
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} min`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Visão Geral" }]}
        title="Visão Geral"
        subtitle="Principais indicadores, metas e desempenho da operação."
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button size="sm" onClick={forcarAtualizacao} disabled={refreshing}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
            >
              Atualizar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
            >
              Exportar
            </Button>
            <DateRangePicker value={dateRange} onChange={onDateChange} size="sm" />
            <select
              value={escopo.divisao ?? ""}
              onChange={(e) => onMarcaChange(e.target.value ? e.target.value as "WEPINK" | "WPINK" : null)}
              className="h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              <option value="WEPINK">WEPINK</option>
              <option value="WPINK">WPINK</option>
            </select>
          </>
        }
      />

      {/* KPI row — 4 cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} Icon={KPI_ICONS[i]} colorIdx={i} />
        ))}
      </div>

      {/* Linha: Atingimento da Meta + Faturamento vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        {(() => {
          const meta = view.gauges.find((g) => g.nome === "Meta") ?? view.gauges[0];
          if (!meta) {
            return (
              <Card>
                <CardTitle className="mb-4">Atingimento da Meta</CardTitle>
                <span className="py-8 text-center text-[13px] text-t2">Nenhuma meta cadastrada para o período.</span>
              </Card>
            );
          }
          const pct = Math.round(meta.pct);
          const cor = pct >= 100 ? "var(--ok)" : pct >= 70 ? "var(--acc)" : "var(--bad)";
          const faltamValor = Math.max(0, meta.alvo - meta.realizado);
          const projecaoValor = view.projecaoFechamento?.replace(/^Projeção:\s*/i, "") ?? "—";
          return (
            <Card>
              <CardTitle className="mb-4">Atingimento da Meta</CardTitle>
              <div className="relative mx-auto mb-4 h-[150px] w-[150px]">
                <RadialProgress value={pct} size={150} stroke={15} color={cor} trackColor="var(--bg-inset)" label="da meta" />
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Faturamento</span>
                  <span className="text-[13px] font-bold text-t0">{brlK(meta.realizado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Meta do mês</span>
                  <span className={`text-[13px] font-bold ${pct < 100 ? "text-warn" : "text-ok"}`}>{brlK(meta.alvo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Faltam</span>
                  <span className={`text-[13px] font-bold ${faltamValor > 0 ? "text-warn" : "text-ok"}`}>
                    {faltamValor > 0 ? brlK(faltamValor) : "Meta atingida"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-t2">Projeção</span>
                  <span className="text-[13px] font-bold text-t0">{projecaoValor}</span>
                </div>
              </div>
            </Card>
          );
        })()}

        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle>Faturamento vs Meta</CardTitle>
                <Tooltip label="Compare o ritmo do faturamento com a meta acumulada e identifique se a operação está acima ou abaixo do esperado.">
                  <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
                    ?
                  </span>
                </Tooltip>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--ok)]" />Realizado
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlK(view.evolucao.reduce((s, e) => s + e.realizado, 0))}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Meta
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlK(view.evolucao.reduce((s, e) => s + e.meta, 0))}
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
            formatValue={brlK}
            showAxisLabels
          />
        </Card>
      </div>

      {/* Linha: Categoria vs Meta + Dia da Semana vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle>Categorias vs Meta</CardTitle>
                <Tooltip label="Compare o faturamento de cada categoria com sua meta no período e identifique onde estão os maiores desvios.">
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
                    {brlK(view.categoriaVsMeta.reduce((s, c) => s + c.realizado, 0))}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Meta
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlK(view.categoriaVsMeta.reduce((s, c) => s + c.meta, 0))}
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
            formatValue={brlK}
            showAxisLabels
          />
        </Card>
        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle>Dia da Semana vs Meta</CardTitle>
                <Tooltip label="Compare o faturamento médio de cada dia da semana com a meta diária e identifique os dias de maior e menor desempenho.">
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
                    {brlK(view.diaVsMeta.reduce((s, d) => s + d.realizado, 0))}
                  </p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />Meta
                  </span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                    {brlK(view.diaVsMeta.reduce((s, d) => s + d.meta, 0))}
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
            formatValue={brlK}
            showAxisLabels
          />
        </Card>
      </div>

      {/* Linha: Ranking de Lojas + Formas de Pagamento */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="mb-1 flex items-center justify-between">
            <CardTitle>Ranking de Lojas</CardTitle>
            <Badge variant="accent">Total {brlK(view.rankingLojas.reduce((s, l) => s + l.valor, 0))}</Badge>
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
                      centerValue={brlK(total)}
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
                            <span className="font-mono text-[13px] font-extrabold text-t0">{brlK(loja.valor)}</span>
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
            <CardTitle>Formas de Pagamento</CardTitle>
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
                      centerValue={brlK(total)}
                    />
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {view.formasPagamento.map((f) => {
                      const pct = Math.round((f.valor / total) * 100);
                      return (
                        <div key={f.forma} className="flex items-center gap-2.5">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: f.cor }} />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-t1">{f.forma}</span>
                          <span className="shrink-0 font-mono text-[12.5px] font-bold text-t0">{brlK(f.valor)}</span>
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
              <CardTitle>Top Vendedoras</CardTitle>
              <button
                onClick={() => navigate("/equipe")}
                className="cursor-pointer text-[13px] font-semibold text-acc hover:text-acc/80 transition-colors"
              >
                Ver equipe
              </button>
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
                      <span className="font-mono text-[13px] font-extrabold text-ok">{brlK(v.valor)}</span>
                    </div>
                    <ProgressBar value={pct} height={5} />
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-t2">
                      <span>{v.sub?.split("·")[0]?.trim() ?? ""}</span>
                      {v.ticketMedio != null && v.ticketMedio > 0 && (
                        <>
                          <span>·</span>
                          <span>Ticket {brlK(v.ticketMedio)}</span>
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
              <CardTitle>Top Produtos</CardTitle>
              <button
                onClick={() => navigate("/dashboard/produtos")}
                className="cursor-pointer text-[13px] font-semibold text-acc hover:text-acc/80 transition-colors"
              >
                Ver produtos
              </button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <th className="px-1 pb-3 text-left font-bold">Produto</th>
                  <th className="px-1 pb-3 text-right font-bold">Itens vendidos</th>
                  <th className="px-1 pb-3 text-right font-bold">Faturamento</th>
                  <th className="px-1 pb-3 text-right font-bold">Variação</th>
                </tr>
              </thead>
              <tbody>
                {view.topProdutos.map((p, idx) => {
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
                      <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{brlK(p.valor)}</td>
                      <td className="px-1 py-3 text-right text-xs font-bold" style={{ color: p.trend != null ? (p.trend >= 0 ? "var(--ok)" : "var(--bad)") : undefined }}>
                        {p.trend != null ? `${p.trend >= 0 ? "+" : ""}${p.trend}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
                {view.topProdutos.length === 0 && (
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

function KpiCard({ kpi, Icon, colorIdx = 0 }: { kpi: VisaoKpi; Icon: () => React.JSX.Element; colorIdx?: number }) {
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