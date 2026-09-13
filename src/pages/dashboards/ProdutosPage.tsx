import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, Badge, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarProdutosView, type ProdutosKpi } from "@/data/gestao/dashboard";
import { brl, num } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
const IconItens = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const KPI_ICONS = [IconFat, IconLucro, IconMargem, IconItens];

type Ordenacao = "faturamento" | "itens" | "margem";

/** Cores distintas para cada KPI card (hero). */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];

export default function ProdutosPage() {
  const { escopo, mudar } = useEscopo();
  const [catFiltro, setCatFiltro] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("faturamento");
  const [busca, setBusca] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const view = useMemo(() => montarProdutosView(escopo, catFiltro), [escopo, catFiltro]);

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

  // Filtra e ordena produtos para a tabela
  const produtosFiltrados = useMemo(() => {
    let lista = view.produtos;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(q) || p.categoriaNome.toLowerCase().includes(q));
    }
    return [...lista].sort((a, b) => {
      if (ordenacao === "faturamento") return b.receita - a.receita;
      if (ordenacao === "itens") return b.itens - a.itens;
      return b.margemPct - a.margemPct;
    });
  }, [view.produtos, busca, ordenacao]);

  // Categorias disponíveis para o filtro (apenas as que têm dados no período)
  const catsDisponiveis = view.categorias.map((c) => ({ label: c.nome, value: c.categoriaId }));

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard",to: "/dashboard/visao-geral" }, {label: "Produtos" }]}
        title="Produtos"
        subtitle="Mix de produtos, categorias e margens da loja."
        actions={
          <>
            <span className="flex items-center gap-1.5 text-[12px] text-t2">
              <span className="inline-block h-2 w-2 rounded-full bg-warn" />
              {rotuloAtualizacao}
            </span>
            <Button variant="secondary" size="md" onClick={forcarAtualizacao} disabled={refreshing}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>}
            />
            <Button variant="primary" size="md" onClick={() => window.print()}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
            >
              Exportar PDF
            </Button>
            <DateRangePicker value={dateRange} onChange={onDateChange} />
            <select
              value={escopo.divisao ?? ""}
              onChange={(e) => onMarcaChange(e.target.value ? e.target.value as "WEPINK" | "WPINK" : null)}
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-inset px-3 text-[13px] font-semibold text-t1 transition-colors hover:border-acc focus:border-acc focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              <option value="WEPINK">WEPINK</option>
              <option value="WPINK">WPINK</option>
            </select>
            <select
              value={catFiltro ?? ""}
              onChange={(e) => setCatFiltro(e.target.value ? Number(e.target.value) : null)}
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-inset px-3 text-[13px] font-semibold text-t1 transition-colors hover:border-acc focus:border-acc focus:outline-none"
            >
              <option value="">Todas as categorias</option>
              {catsDisponiveis.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} Icon={KPI_ICONS[i]} colorIdx={i} />
        ))}
      </div>

      {/* Widget central — Faturamento por Categoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Faturamento por Categoria</CardTitle>
            <Tooltip label="Faturamento por categoria com linha de % Margem sobreposta. Clique numa barra para filtrar a tabela abaixo.">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
          </div>
        </CardHeader>
        <div className="px-4 pb-4">
          <BarChart
            data={view.categorias.map((c) => ({ label: c.nome, value: c.faturamento }))}
            height={240}
            formatValue={brl}
          />
          <div className="mt-4">
            <AreaLineChart
              data={view.categorias.map((c) => c.margemPct)}
              labels={view.categorias.map((c) => c.nome)}
              color="var(--acc)"
              height={100}
              showValues
              formatValue={(v) => `${v.toFixed(0)}%`}
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Faturamento</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--acc)]" /> % Margem</span>
          </div>
        </div>
      </Card>

      {/* Par: Top Linhas + Top Produtos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Top Linhas de Produto</CardTitle>
              <Tooltip label="Ranking das linhas de produto por faturamento. Valores em R$ direto nas barras.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChartHorizontal data={view.topLinhas.slice(0, 6).map((l) => ({ label: l.nome, value: l.faturamento }))} formatValue={brl} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <CardTitle>Top Produtos</CardTitle>
                <Tooltip label="Ranking dos produtos mais vendidos. Escolha a métrica de ordenação.">
                  <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
                </Tooltip>
              </div>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="rounded-lg border border-line bg-bg-inset px-2 py-1 text-[11px] font-semibold text-t1 hover:border-acc focus:border-acc focus:outline-none"
              >
                <option value="faturamento">Faturamento</option>
                <option value="itens">Qtd Vendida</option>
                <option value="margem">Margem</option>
              </select>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChartHorizontal
              data={produtosFiltrados.slice(0, 6).map((p) => ({
                label: p.nome.length > 22 ? p.nome.slice(0, 20) + "…" : p.nome,
                value: ordenacao === "faturamento" ? p.receita : ordenacao === "itens" ? p.itens : p.margemPct,
              }))}
              formatValue={ordenacao === "margem" ? (v) => `${v.toFixed(0)}%` : ordenacao === "itens" ? (v) => num(v) : brl}
            />
          </div>
        </Card>
      </div>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <CardTitle>Tabela de Produtos</CardTitle>
              <Tooltip label="Detalhamento por produto com margem, CMV%, ticket médio e dias de cobertura. Badge vermelho indica ruptura.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
            <input
              type="text"
              placeholder="🔍 Pesquisar produto…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-inset px-3 text-[13px] font-semibold text-t1 placeholder:text-t2 hover:border-acc focus:border-acc focus:outline-none sm:w-64"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[800px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-t2">
                <th className="py-2 pr-3">Produto</th>
                <th className="py-2 pr-3">Categoria</th>
                <th className="py-2 pr-3 text-right">Faturamento</th>
                <th className="py-2 pr-3 text-right">CMV</th>
                <th className="py-2 pr-3 text-right">Lucro</th>
                <th className="py-2 pr-3 text-right">Margem</th>
                <th className="py-2 pr-3 text-right">Itens</th>
                <th className="py-2 pr-3 text-right">T.M/item</th>
                <th className="py-2 text-right">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.slice(0, 50).map((p) => (
                <tr key={p.codProduto} className="border-b border-line/50 text-t1 last:border-0 hover:bg-bg-inset/50">
                  <td className="py-2 pr-3 font-semibold text-t0">{p.nome}</td>
                  <td className="py-2 pr-3">{p.categoriaNome}</td>
                  <td className="py-2 pr-3 text-right">{brl(p.receita)}</td>
                  <td className="py-2 pr-3 text-right">{brl(p.cmv)}</td>
                  <td className="py-2 pr-3 text-right font-semibold text-ok">{brl(p.margem)}</td>
                  <td className="py-2 pr-3 text-right">{p.margemPct.toFixed(1)}%</td>
                  <td className="py-2 pr-3 text-right">{num(p.itens)}</td>
                  <td className="py-2 pr-3 text-right">{brl(p.tmPorItem)}</td>
                  <td className="py-2 text-right">
                    {p.coberturaDias === null ? (
                      <Badge variant="danger">Ruptura</Badge>
                    ) : p.coberturaDias <= 7 ? (
                      <Badge variant="warning">{p.coberturaDias}d</Badge>
                    ) : (
                      <span className="text-t2">{p.coberturaDias}d</span>
                    )}
                  </td>
                </tr>
              ))}
              {produtosFiltrados.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-t2">Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ kpi, Icon, colorIdx = 0 }: { kpi: ProdutosKpi; Icon: () => React.JSX.Element; colorIdx?: number }) {
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

/** BarChart horizontal simples para rankings — reusa o padrão visual do Vela. */
function BarChartHorizontal({ data, formatValue }: { data: { label: string; value: number }[]; formatValue: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-[140px] shrink-0 truncate text-[11px] font-semibold text-t1" title={d.label}>{d.label}</span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-bg-inset">
              <div
                className="h-full rounded-md bg-[var(--acc)] transition-all"
                style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-bold text-t0">{formatValue(d.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}