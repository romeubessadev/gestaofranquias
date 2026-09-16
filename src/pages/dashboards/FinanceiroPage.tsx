import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart, StackedBarChart, DonutChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarFinanceiroView, type FinanceiroKpi } from "@/data/gestao/dashboard";
import { brl } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";
import { deIso } from "@/lib/formato";

/** Ícones dos KPIs — Faturamento/CMV iguais à Visão Geral; Lucro/Margem próprios. */
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
const IconLucro = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconMargem = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
      ?
    </span>
  </Tooltip>
);

const KPI_ICONS = [IconFat, IconCmv, IconLucro, IconMargem];

/** Mesma paleta da Visão Geral: Faturamento, CMV, Lucro, Margem. */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];

export default function FinanceiroPage() {
  const { escopo, mudar } = useEscopo();
  const view = useMemo(() => montarFinanceiroView(escopo), [escopo]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Resolve o DateRange a partir do escopo — sempre mostra algo selecionado.
  const dateRange: DateRange | null = useMemo(() => {
    if (escopo.periodo.tipo === "personalizado" && escopo.periodo.inicio && escopo.periodo.fim) {
      return [deIso(escopo.periodo.inicio), deIso(escopo.periodo.fim)];
    }
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
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} min`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Financeiro" }]}
        title="Financeiro"
        subtitle="Receita, custos e margem da operação."
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

      {/* Widget central — CMV, Lucro e Margem */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>CMV, Lucro e Margem</CardTitle>
            <TipHelp label="Acompanhe se o lucro bruto acompanha o faturamento ou se o CMV está pressionando a margem ao longo dos meses." />
          </div>
        </CardHeader>
        <div className="px-4 pb-4">
          <StackedBarChart
            data={view.custoLucroMargem.map((m) => ({
              label: m.mes,
              custo: m.custo,
              lucro: m.lucro,
            }))}
            keys={["custo", "lucro"]}
            colors={["var(--bad)", "var(--ok)"]}
            height={240}
            showValues
            formatValue={brl}
          />
          <div className="mt-4">
            <AreaLineChart
              data={view.custoLucroMargem.map((m) => m.margemPct)}
              labels={view.custoLucroMargem.map((m) => m.mes)}
              color="var(--acc)"
              height={120}
              showValues
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--bad)]" /> CMV</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--ok)]" /> Lucro bruto</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Margem</span>
          </div>
        </div>
      </Card>

      {/* Par: Faturamento vs Ticket + Itens vs Preço Médio */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Faturamento vs Ticket Médio</CardTitle>
              <TipHelp label="Mostra se o faturamento sobe por mais volume de vendas ou por ticket médio maior." />
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <AreaLineChart
              data={view.faturamentoVsTicket.map((m) => m.faturamento)}
              compareData={view.faturamentoVsTicket.map((m) => m.ticket * 100)}
              labels={view.faturamentoVsTicket.map((m) => m.label)}
              color="var(--acc)"
              compareColor="var(--info)"
              height={200}
              formatValue={brl}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Faturamento</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--info)]" /> Ticket Médio (×100)</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Itens vs Preço Médio</CardTitle>
              <TipHelp label="Indica se o período vendeu mais unidades ou itens com preço médio maior (valor médio por item)." />
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChart
              data={view.itensVsPreco.map((m) => ({
                label: m.label,
                value: m.qty,
              }))}
              height={200}
              formatValue={(v) => String(v)}
            />
          </div>
        </Card>
      </div>

      {/* Par: Formas de Pagamento + Custos Fixos/Franquia */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <DonutChart
              segments={view.formasPagamento.map((f) => ({
                label: f.forma,
                value: f.valor,
                color: f.cor,
              }))}
              centerLabel="Total"
              centerValue={brl(view.formasPagamento.reduce((s, f) => s + f.valor, 0))}
              formatValue={brl}
              showLegendValue
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Custos Fixos e Franquia</CardTitle>
              <TipHelp label="O que sobra do lucro bruto depois de aluguel, royalties e taxa de marketing — o resultado operacional do período." />
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <table className="w-full text-left text-[12px]">
              <tbody>
                {view.custosFixosFranquia.map((linha) => (
                  <tr
                    key={linha.rotulo}
                    className={
                      linha.ehResultado
                        ? "border-t-2 border-acc font-bold text-t0"
                        : linha.ehTotal
                          ? "border-t border-line font-semibold text-t0"
                          : "text-t1"
                    }
                  >
                    <td className="py-1.5 pr-3">{linha.rotulo}</td>
                    <td className={`py-1.5 text-right font-semibold ${linha.ehResultado && linha.valor < 0 ? "text-bad" : ""}`}>
                      {brl(linha.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Evolução Mensal — tabela DRE simplificada */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Evolução Mensal</CardTitle>
            <TipHelp label="Resumo mensal de faturamento, CMV, lucro bruto, margem e ticket médio." />
          </div>
        </CardHeader>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[600px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-t2">
                <th className="py-2 pr-3">Mês</th>
                <th className="py-2 pr-3 text-right">Faturamento</th>
                <th className="py-2 pr-3 text-right">CMV</th>
                <th className="py-2 pr-3 text-right">Lucro bruto</th>
                <th className="py-2 pr-3 text-right">Margem</th>
                <th className="py-2 text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {view.evolucaoMensal.map((linha) => (
                <tr key={linha.mes} className="border-b border-line/50 text-t1 last:border-0">
                  <td className="py-2 pr-3 font-semibold text-t0">{linha.mes}</td>
                  <td className="py-2 pr-3 text-right">{brl(linha.faturamento)}</td>
                  <td className="py-2 pr-3 text-right">{brl(linha.custo)}</td>
                  <td className="py-2 pr-3 text-right font-semibold text-ok">{brl(linha.lucro)}</td>
                  <td className="py-2 pr-3 text-right">{linha.margemPct.toFixed(1)}%</td>
                  <td className="py-2 text-right">{brl(linha.ticketMedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/** StatCard wrapper com tooltip ? e sparkline de tendência. */
function KpiCard({ kpi, Icon, colorIdx = 0 }: { kpi: FinanceiroKpi; Icon: () => React.JSX.Element; colorIdx?: number }) {
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