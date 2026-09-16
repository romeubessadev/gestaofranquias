import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Card, CardHeader, CardTitle, ProgressBar, StatCard, DateRangePicker, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, DonutChart, Gauge } from "@/components/charts";
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
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} minuto${minutosAtras !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Visão Geral" }]}
        title="Visão Geral"
        subtitle="Uma visão consolidada dos principais indicadores, metas e desempenho da operação."
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button variant="secondary" size="md" onClick={forcarAtualizacao} disabled={refreshing}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
            />
            <Button variant="secondary" size="md" onClick={() => window.print()}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
            >
              Exportar
            </Button>
            <DateRangePicker value={dateRange} onChange={onDateChange} />
            <select
              value={escopo.divisao ?? ""}
              onChange={(e) => onMarcaChange(e.target.value ? e.target.value as "WEPINK" | "WPINK" : null)}
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3.5 text-[13px] font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none"
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

      {/* Widget central — Atingimento da Meta (3 Gauges) */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Atingimento da Meta</CardTitle>
            <Tooltip label="Percentual atingido em cada faixa de meta (Meta, Super Meta, Hiper Meta). Responde: vou bater a meta este mês?">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
          </div>
        </CardHeader>
        <div className="flex flex-wrap items-end justify-center gap-8 px-4 pb-6">
          {view.gauges.map((g) => (
            <Gauge
              key={g.nome}
              value={Math.round(g.pct)}
              label={`${g.nome} · ${brlK(g.alvo)}`}
              color={g.pct >= 100 ? "var(--ok)" : g.pct >= 70 ? "var(--acc)" : "var(--bad)"}
            />
          ))}
          {view.gauges.length === 0 && (
            <span className="py-8 text-[13px] text-t2">Sem meta cadastrada para o período.</span>
          )}
        </div>
        {(view.faltamParaMeta || view.projecaoFechamento) && (
          <div className="flex flex-col items-center gap-1 pb-4 text-center text-[12px]">
            {view.faltamParaMeta && <span className="font-semibold text-t0">{view.faltamParaMeta}</span>}
            {view.projecaoFechamento && <span className="text-t1">{view.projecaoFechamento}</span>}
          </div>
        )}
      </Card>

      {/* Linha: Atingimento da Meta + Evolução do Faturamento vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.7fr]">
        {view.gauges.length > 0 && (
          <Card className="flex flex-col">
            <div className="mb-1 flex items-center justify-between">
              <CardTitle>Atingimento da Meta</CardTitle>
              <Tooltip label="Percentual atingido em cada faixa de meta (Meta, Super Meta, Hiper Meta). Responde: vou bater a meta este mês?">
                <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
            <p className="mb-2 text-[12.5px] text-t2">Progresso por faixa de meta</p>
            <div className="flex flex-wrap items-end justify-center gap-4 px-4 pb-4">
              {view.gauges.map((g) => (
                <Gauge
                  key={g.nome}
                  value={Math.round(g.pct)}
                  label={`${g.nome} · ${brlK(g.alvo)}`}
                  color={g.pct >= 100 ? "var(--ok)" : g.pct >= 70 ? "var(--acc)" : "var(--bad)"}
                />
              ))}
            </div>
            {(view.faltamParaMeta || view.projecaoFechamento) && (
              <div className="mt-1 flex flex-col items-center gap-1 pb-4 text-center text-[12px]">
                {view.faltamParaMeta && <span className="font-semibold text-t0">{view.faltamParaMeta}</span>}
                {view.projecaoFechamento && <span className="text-t1">{view.projecaoFechamento}</span>}
              </div>
            )}
          </Card>
        )}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Evolução do Faturamento vs Meta</CardTitle>
              <Tooltip label="Realizado acumulado, meta acumulada e projeção de fechamento. Responde: vou bater a meta até o fim do mês?">
                <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">?</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pt-1 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--ok)]" /><span className="font-semibold text-t2">Realizado</span> <span className="font-bold text-t0">{brlK(view.evolucao.reduce((s, e) => s + e.realizado, 0))}</span></span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--warn)]" /><span className="font-semibold text-t2">Meta</span> <span className="font-bold text-t0">{brlK(view.evolucao.reduce((s, e) => s + e.meta, 0))}</span></span>
          </div>
          <div className="overflow-hidden px-4 pb-4">
            <AreaLineChart
              data={view.evolucao.map((e) => e.realizado)}
              compareData={view.evolucao.map((e) => e.meta)}
              labels={view.evolucao.map((e) => e.label)}
              color="var(--ok)"
              compareColor="var(--warn)"
              height={200}
              formatValue={brlK}
            />
          </div>
        </Card>
      </div>

      {/* Linha: Categoria vs Meta + Dia da Semana vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Categoria vs Meta</CardTitle>
              <Tooltip label="Faturamento realizado por categoria comparado à meta proporcional do período.">
                <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">?</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pt-1 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /><span className="font-semibold text-t2">Realizado</span> <span className="font-bold text-t0">{brlK(view.categoriaVsMeta.reduce((s, c) => s + c.realizado, 0))}</span></span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--warn)]" /><span className="font-semibold text-t2">Meta</span> <span className="font-bold text-t0">{brlK(view.categoriaVsMeta.reduce((s, c) => s + c.meta, 0))}</span></span>
          </div>
          <div className="overflow-hidden px-4 pb-4">
            <AreaLineChart
              data={view.categoriaVsMeta.map((c) => c.realizado)}
              compareData={view.categoriaVsMeta.map((c) => c.meta)}
              labels={view.categoriaVsMeta.map((c) => c.categoria)}
              color="var(--acc)"
              compareColor="var(--warn)"
              height={200}
              formatValue={brlK}
            />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Dia da Semana vs Meta</CardTitle>
              <Tooltip label="Faturamento médio por dia da semana comparado à meta diária do período.">
                <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">?</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pt-1 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--info)]" /><span className="font-semibold text-t2">Realizado</span> <span className="font-bold text-t0">{brlK(view.diaVsMeta.reduce((s, d) => s + d.realizado, 0))}</span></span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--warn)]" /><span className="font-semibold text-t2">Meta</span> <span className="font-bold text-t0">{brlK(view.diaVsMeta.reduce((s, d) => s + d.meta, 0))}</span></span>
          </div>
          <div className="overflow-hidden px-4 pb-4">
            <AreaLineChart
              data={view.diaVsMeta.map((d) => d.realizado)}
              compareData={view.diaVsMeta.map((d) => d.meta)}
              labels={view.diaVsMeta.map((d) => d.dia)}
              color="var(--info)"
              compareColor="var(--warn)"
              height={200}
              formatValue={brlK}
            />
          </div>
        </Card>
      </div>

      {/* Linha: Ranking de Lojas + Forma de Pagamento */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="mb-1 flex items-center justify-between">
            <CardTitle>Ranking de Lojas</CardTitle>
            <Badge variant="accent">{brlK(view.rankingLojas.reduce((s, l) => s + l.valor, 0))} total</Badge>
          </div>
          <p className="mb-2 text-[12.5px] text-t2">Participação no faturamento do grupo</p>
          {view.rankingLojas.length === 0 ? (
            <span className="py-6 text-center text-[12px] text-t2">Sem dados no período.</span>
          ) : (
            (() => {
              const totalGrupo = view.rankingLojas.reduce((s, l) => s + l.valor, 0) || 1;
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
                      centerLabel="Total grupo"
                      centerValue={brlK(totalGrupo)}
                      formatValue={brlK}
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {view.rankingLojas.map((loja, idx) => {
                      const participacao = Math.round((loja.valor / totalGrupo) * 100);
                      const pctMeta = loja.pctMeta != null ? Math.round(loja.pctMeta) : null;
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
                            <div className="h-full rounded-full" style={{ width: `${participacao}%`, background: cor }} />
                          </div>
                          <span className="text-[11px] font-semibold text-t2">
                            {pctMeta != null ? `${pctMeta}% da meta · ` : ""}
                            {participacao}% do grupo
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
            <CardTitle>Forma de Pagamento</CardTitle>
          </CardHeader>
          {(() => {
            const total = view.formasPagamento.reduce((s, f) => s + f.valor, 0);
            const segmentos = view.formasPagamento.map((f) => ({
              label: f.forma,
              value: f.valor,
              color: f.cor,
            }));
            if (view.formasPagamento.length === 0) {
              return <span className="py-6 text-center text-[12px] text-t2">Sem dados no período.</span>;
            }
            return (
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <DonutChart
                  segments={segmentos}
                  centerLabel="Total"
                  centerValue={brlK(total)}
                  formatValue={brlK}
                />
              </div>
            );
          })()}
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
                Ver mais
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
                          <span>T.M. {brlK(v.ticketMedio)}</span>
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
              <span className="py-4 text-center text-[12px] text-t2">Sem dados no período.</span>
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
                Ver mais
              </button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <th className="px-1 pb-3 text-left font-bold">Produto</th>
                  <th className="px-1 pb-3 text-right font-bold">Vendas</th>
                  <th className="px-1 pb-3 text-right font-bold">Faturamento</th>
                  <th className="px-1 pb-3 text-right font-bold">Vs anterior</th>
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
                  <tr><td colSpan={5} className="px-1 py-3 text-center text-[13px] text-t2">Sem dados no período.</td></tr>
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