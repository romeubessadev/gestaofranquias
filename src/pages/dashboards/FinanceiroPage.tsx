import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart, StackedBarChart, DonutChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarFinanceiroView, type FinanceiroKpi } from "@/data/gestao/dashboard";
import { brl } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";
import { deIso } from "@/lib/formato";

/** Ícones inline (SVG) para os KPIs — evita dependência externa. */
const IconFaturamento = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconCusto = () => (
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
const IconMargem = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8l-4 4-4-4" />
    <path d="M16 16l-4-4-4 4" />
  </svg>
);

const KPI_ICONS = [IconFaturamento, IconCusto, IconLucro, IconMargem];

/** Cores distintas para cada KPI card (hero). */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--bad)", iconBg: "var(--bad-soft)" },
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
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} minuto${minutosAtras !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Financeiro" }]}
        title="Financeiro"
        subtitle="Receita, custos e margem da loja."
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

      {/* Widget central — Custo, Lucro e Margem */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Custo, Lucro e Margem</CardTitle>
            <Tooltip label="Evolução mensal do custo dos produtos (CMV), lucro bruto e margem percentual. Valores em R$ direto nas barras.">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
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
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--bad)]" /> Custo</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--ok)]" /> Lucro</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> % Margem</span>
          </div>
        </div>
      </Card>

      {/* Par: Faturamento vs Ticket + Itens vs Preço Médio */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
            <CardTitle>Faturamento vs Ticket Médio</CardTitle>
            <Tooltip label="Comparativo mensal entre faturamento total e ticket médio por atendimento.">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
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
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--info)]" /> Ticket ×100</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
            <CardTitle>Itens Vendidos vs Preço Médio</CardTitle>
            <Tooltip label="Quantidade de itens vendidos vs preço médio por item (PA). Responde: estou vendendo mais unidades ou só mais caro?">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
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

      {/* Par: Forma de Pagamento + Custos Fixos/Franquia */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Faturamento por Forma de Pagamento</CardTitle>
              <Tooltip label="Distribuição do faturamento por forma de pagamento. Impacta taxa da maquininha e prazo de recebimento.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
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
              <Tooltip label="Mini-DRE: descontando custos fixos e franquia do lucro bruto para chegar ao resultado operacional.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Evolução Mensal</CardTitle>
            <Tooltip label="Tabela mensal com faturamento, custo, lucro, margem e ticket médio dos últimos 6 meses.">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
          </div>
        </CardHeader>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[600px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-t2">
                <th className="py-2 pr-3">Mês</th>
                <th className="py-2 pr-3 text-right">Faturamento</th>
                <th className="py-2 pr-3 text-right">Custo</th>
                <th className="py-2 pr-3 text-right">Lucro</th>
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

/** StatCard wrapper com tooltip ⓘ e sparkline de tendência. */
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