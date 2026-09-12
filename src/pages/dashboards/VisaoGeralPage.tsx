import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, StatCard, Segmented, DateRangePicker } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart, DonutChart, Gauge, Sparkline } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarVisaoGeralView, type VisaoKpi } from "@/data/gestao/dashboard";
import { brl, num } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconCmv = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconLucro = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8l-4 4-4-4" />
    <path d="M16 16l-4-4-4 4" />
  </svg>
);

const KPI_ICONS = [IconFat, IconCmv, IconLucro, IconTicket];

/** BarChart horizontal compacto para Top 3 rankings. */
function RankingCompacto({ items, formatValue, onClick }: { items: { nome: string; valor: number }[]; formatValue: (v: number) => string; onClick?: () => void }) {
  const max = Math.max(...items.map((i) => i.valor), 1);
  return (
    <div className={`flex flex-col gap-2 ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      {items.map((item, idx) => (
        <div key={item.nome} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-[11px] font-bold text-t2">{idx + 1}.</span>
          <span className="w-[120px] shrink-0 truncate text-[11px] font-semibold text-t1" title={item.nome}>{item.nome}</span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-4 flex-1 overflow-hidden rounded-md bg-bg-inset">
              <div
                className="h-full rounded-md bg-[var(--acc)] transition-all"
                style={{ width: `${Math.max(2, (item.valor / max) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-bold text-t0">{formatValue(item.valor)}</span>
          </div>
        </div>
      ))}
      {items.length === 0 && <span className="text-[11px] text-t2">Sem dados no período.</span>}
    </div>
  );
}

export default function VisaoGeralPage() {
  const { escopo, mudar } = useEscopo();
  const navigate = useNavigate();
  const view = useMemo(() => montarVisaoGeralView(escopo), [escopo]);

  const dateRange: DateRange | null = useMemo(() => {
    if (escopo.periodo.tipo !== "personalizado" || !escopo.periodo.inicio || !escopo.periodo.fim) return null;
    return [deIso(escopo.periodo.inicio), deIso(escopo.periodo.fim)];
  }, [escopo.periodo]);

  function onDateChange(r: DateRange) {
    mudar({ ...escopo, periodo: { tipo: "personalizado", inicio: r[0].toISOString().slice(0, 10), fim: r[1].toISOString().slice(0, 10) } });
  }
  function onMarcaChange(v: "WEPINK" | "WPINK" | null) {
    mudar({ ...escopo, divisao: v });
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Filtros internos */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangePicker value={dateRange} onChange={onDateChange} />
        <Segmented
          options={[{ label: "WEPINK", value: "WEPINK" }, { label: "WPINK", value: "WPINK" }]}
          value={escopo.divisao}
          onChange={onMarcaChange}
          allowClear
        />
      </div>

      {/* KPI row — 4 cards com drill-down */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={kpi.drillTo ? "cursor-pointer transition-opacity hover:opacity-90" : ""}
            onClick={() => kpi.drillTo && navigate(kpi.drillTo)}
          >
            <KpiCard kpi={kpi} Icon={KPI_ICONS[i]} />
          </div>
        ))}
      </div>

      {/* Widget central — Atingimento da Meta (3 Gauges) */}
      <Card>
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Categoria vs Meta</CardTitle>
              <Tooltip label="Faturamento realizado por categoria comparado à meta proporcional. Clique → drill para Produtos.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChart
              data={view.categoriaVsMeta.map((c) => ({ label: c.categoria, value: c.realizado }))}
              height={200}
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Realizado</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Dia da Semana vs Meta</CardTitle>
              <Tooltip label="Faturamento médio por dia da semana comparado à meta diária. Clique → drill para Turnos.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChart
              data={view.diaVsMeta.map((d) => ({ label: d.dia, value: d.realizado }))}
              height={200}
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--info)]" /> Média realizada</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Par: Evolução vs Meta + Forma de Pagamento */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <AreaLineChart
              data={view.evolucao.map((e) => e.realizado)}
              compareData={view.evolucao.map((e) => e.meta)}
              labels={view.evolucao.map((e) => e.label)}
              color="var(--acc)"
              compareColor="var(--t2)"
              height={200}
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Realizado</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--t2)]" /> Meta</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Forma de Pagamento</CardTitle>
              <Tooltip label="Distribuição do faturamento por forma de pagamento. Clique → drill para Financeiro.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="cursor-pointer px-4 pb-4" onClick={() => navigate("/dashboard/financeiro")}>
            <DonutChart
              segments={view.formasPagamento.map((f) => ({
                label: f.forma,
                value: f.valor,
                color: f.cor,
              }))}
              centerLabel="Total"
              centerValue={brl(view.formasPagamento.reduce((s, f) => s + f.valor, 0))}
            />
          </div>
        </Card>
      </div>

      {/* Par: Top 3 Vendedoras + Top 3 Produtos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Top 3 Vendedoras</CardTitle>
              <Tooltip label="As 3 vendedoras que mais venderam no período. Clique → drill para Equipe.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <RankingCompacto items={view.topVendedoras} formatValue={brl} onClick={() => navigate("/equipe")} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Top 3 Produtos</CardTitle>
              <Tooltip label="Os 3 produtos que mais venderam no período. Clique → drill para Produtos.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <RankingCompacto items={view.topProdutos} formatValue={brl} onClick={() => navigate("/dashboard/produtos")} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ kpi, Icon }: { kpi: VisaoKpi; Icon: () => JSX.Element }) {
  return (
    <StatCard
      label={kpi.label}
      value={kpi.valor}
      icon={<Icon />}
      delta={kpi.delta}
      sparkline={kpi.serie && kpi.serie.length > 1 ? <Sparkline data={kpi.serie} /> : undefined}
    />
  );
}