import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { StackedBarChart, DonutChart, Gauge } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarVisaoGeralView, type VisaoKpi } from "@/data/gestao/dashboard";
import { brl } from "@/lib/formato";
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

/** Cores distintas para cada KPI card (hero). */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];

export default function VisaoGeralPage() {
  const { escopo, mudar } = useEscopo();
  const navigate = useNavigate();
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
              label={`${g.nome} · ${brl(g.alvo)}`}
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

      {/* Par: Categoria vs Meta + Dia da Semana vs Meta */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Categoria vs Meta</CardTitle>
              <Tooltip label="Faturamento realizado por categoria comparado à meta proporcional do período.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <StackedBarChart
              data={view.categoriaVsMeta.map((c) => ({
                label: c.categoria.length > 8 ? c.categoria.slice(0, 7) + "…" : c.categoria,
                Realizado: c.realizado,
                Restante: Math.max(0, c.meta - c.realizado),
              }))}
              keys={["Realizado", "Restante"]}
              colors={["var(--acc)", "var(--bg-inset)"]}
              height={200}
              showValues
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Realizado</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--bg-inset)] border border-line" /> Meta restante</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Dia da Semana vs Meta</CardTitle>
              <Tooltip label="Faturamento médio por dia da semana comparado à meta diária do período.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <StackedBarChart
              data={view.diaVsMeta.map((d) => ({
                label: d.dia,
                Realizado: d.realizado,
                Restante: Math.max(0, d.meta - d.realizado),
              }))}
              keys={["Realizado", "Restante"]}
              colors={["var(--info)", "var(--bg-inset)"]}
              height={200}
              showValues
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--info)]" /> Realizado</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--bg-inset)] border border-line" /> Meta restante</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Par: Evolução vs Meta + Forma de Pagamento */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Evolução do Faturamento vs Meta</CardTitle>
              <Tooltip label="Realizado acumulado, meta acumulada e projeção de fechamento. Responde: vou bater a meta até o fim do mês?">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <StackedBarChart
              data={view.evolucao.map((e) => ({
                label: e.label,
                Realizado: e.realizado,
                Restante: Math.max(0, e.meta - e.realizado),
              }))}
              keys={["Realizado", "Restante"]}
              colors={["var(--ok)", "var(--bg-inset)"]}
              height={200}
              showValues
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--ok)]" /> Realizado</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--bg-inset)] border border-line" /> Meta restante</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Forma de Pagamento</CardTitle>
              <Tooltip label="Distribuição do faturamento por forma de pagamento no período selecionado.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            {(() => {
              const total = view.formasPagamento.reduce((s, f) => s + f.valor, 0);
              const segmentos = view.formasPagamento.map((f) => ({
                label: f.forma,
                value: f.valor,
                color: f.cor,
              }));
              return (
                <>
                  <DonutChart
                    segments={segmentos}
                    centerLabel="Total"
                    centerValue={brl(total)}
                  />
                  <div className="mt-4 flex flex-col gap-2 border-t border-line pt-3">
                    {view.formasPagamento.map((f) => (
                      <div key={f.forma} className="flex items-center gap-2 text-[12.5px]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
                        <span className="flex-1 truncate text-t1">{f.forma}</span>
                        <span className="font-bold text-t0">{brl(f.valor)}</span>
                        <span className="w-10 shrink-0 text-right text-t2">{total > 0 ? `${Math.round((f.valor / total) * 100)}%` : "0%"}</span>
                      </div>
                    ))}
                    {view.formasPagamento.length === 0 && (
                      <span className="py-2 text-center text-[12px] text-t2">Sem dados no período.</span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      </div>

      {/* Par: Top Vendedoras + Top Produtos */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <CardTitle>Top Vendedoras</CardTitle>
                <Tooltip label="As vendedoras que mais faturaram no período selecionado.">
                  <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
                </Tooltip>
              </div>
              <span className="rounded-full bg-acc-soft px-2 py-0.5 text-[10px] font-bold text-acc">Top {view.topVendedoras.length}</span>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {view.topVendedoras.map((v, idx) => {
              const iniciais = v.nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
              const cores = ["var(--acc)", "var(--info)", "var(--warn)", "var(--ok)", "var(--bad)"];
              const corAvatar = cores[idx % cores.length];
              return (
                <div key={v.nome} className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-bg-inset/50">
                  <span className="w-4 shrink-0 text-center text-[12px] font-bold text-t2">{idx + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: corAvatar }}>{iniciais || "?"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-t0">{v.nome}</p>
                    {v.sub && <p className="truncate text-[11px] text-t2">{v.sub}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-[13px] font-bold text-ok">{brl(v.valor)}</span>
                    {v.ticketMedio != null && v.ticketMedio > 0 && (
                      <span className="block text-[10px] text-t2">T.M. {brl(v.ticketMedio)}</span>
                    )}
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
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <CardTitle>Top Produtos</CardTitle>
                <Tooltip label="Os produtos que mais faturaram no período selecionado.">
                  <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
                </Tooltip>
              </div>
              <span className="rounded-full bg-acc-soft px-2 py-0.5 text-[10px] font-bold text-acc">Top {view.topProdutos.length}</span>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {view.topProdutos.map((p, idx) => {
              const iniciais = p.nome.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
              const cores = ["var(--ok)", "var(--info)", "var(--warn)", "var(--acc)", "var(--bad)"];
              const corAvatar = cores[idx % cores.length];
              return (
                <div key={p.nome} className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-bg-inset/50">
                  <span className="w-4 shrink-0 text-center text-[12px] font-bold text-t2">{idx + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: corAvatar }}>{iniciais || "?"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-t0" title={p.nome}>{p.nome}</p>
                    {p.sub && <p className="truncate text-[11px] text-t2">{p.sub}</p>}
                  </div>
                  <span className="shrink-0 text-[13px] font-bold text-ok">{brl(p.valor)}</span>
                </div>
              );
            })}
            {view.topProdutos.length === 0 && (
              <span className="py-4 text-center text-[12px] text-t2">Sem dados no período.</span>
            )}
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