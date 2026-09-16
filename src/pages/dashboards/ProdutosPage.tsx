import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, Badge, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarProdutosView, type ProdutosKpi, type CategoriaFat, type ProdutoLinha } from "@/data/gestao/dashboard";
import { brl, num } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import { cn } from "@/lib/cn";
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

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
      ?
    </span>
  </Tooltip>
);

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
  const [abertas, setAbertas] = useState<Set<number>>(() => new Set());
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
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} min`;

  // Filtra e ordena produtos para o ranking Top Produtos
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

  /** Grupos categoria → produtos (tree-table). */
  const grupos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const out: GrupoCategoria[] = [];
    for (const cat of view.categorias) {
      let prods = view.produtos.filter((p) => p.categoriaNome === cat.nome);
      if (q) {
        const catMatch = cat.nome.toLowerCase().includes(q);
        if (!catMatch) {
          prods = prods.filter((p) => p.nome.toLowerCase().includes(q));
        }
      }
      if (prods.length === 0) continue;
      prods = [...prods].sort((a, b) => b.receita - a.receita);
      const metrics = q && !cat.nome.toLowerCase().includes(q)
        ? metricasDeProdutos(prods)
        : metricasDeCategoria(cat);
      out.push({ categoriaId: cat.categoriaId, nome: cat.nome, metrics, produtos: prods });
    }
    return out;
  }, [view.categorias, view.produtos, busca]);

  const totalTabela = useMemo(
    () => metricasDeProdutos(grupos.flatMap((g) => g.produtos)),
    [grupos],
  );

  // Busca: auto-expande categorias que batem
  useEffect(() => {
    if (!busca.trim()) return;
    setAbertas(new Set(grupos.map((g) => g.categoriaId)));
  }, [busca, grupos]);

  function toggleCategoria(id: number) {
    setAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const catsDisponiveis = view.categorias.map((c) => ({ label: c.nome, value: c.categoriaId }));

  const filtroSelectClass =
    "h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none";

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Produtos" }]}
        title="Produtos"
        subtitle="Mix de produtos, categorias e margens da loja."
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
              className={filtroSelectClass}
            >
              <option value="">Todas as marcas</option>
              <option value="WEPINK">WEPINK</option>
              <option value="WPINK">WPINK</option>
            </select>
            <select
              value={catFiltro ?? ""}
              onChange={(e) => setCatFiltro(e.target.value ? Number(e.target.value) : null)}
              className={filtroSelectClass}
            >
              <option value="">Todas as categorias</option>
              {catsDisponiveis.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
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

      {/* Widget central — Faturamento por Categoria */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Faturamento por Categoria</CardTitle>
            <TipHelp label="Faturamento por categoria com linha de % Margem sobreposta. Clique numa barra para filtrar a tabela abaixo." />
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
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Top Linhas de Produto</CardTitle>
              <TipHelp label="Ranking das linhas de produto por faturamento. Valores em R$ direto nas barras." />
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
                <TipHelp label="Ranking dos produtos mais vendidos. Escolha a métrica de ordenação." />
              </div>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-2.5 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none"
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

      {/* Tabela de Produtos — tree-table (desktop) + cards (mobile) */}
      <Card className="mt-4" padding="none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-1.5">
            <CardTitle>Tabela de Produtos</CardTitle>
            <TipHelp label="Categorias expansíveis com os produtos de cada uma. O total no rodapé soma o que está visível na tabela." />
          </div>
          <input
            type="search"
            placeholder="Pesquisar produto…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 placeholder:text-t2 transition-colors hover:border-acc focus:border-acc focus:outline-none sm:w-64"
          />
        </div>

        {/* Desktop / tablet — tree-table + Total */}
        <div className="hidden overflow-x-auto p-4 md:block">
          {grupos.length === 0 ? (
            <p className="py-10 text-center text-sm text-t2">Nenhum produto encontrado.</p>
          ) : (
            <table className="w-full min-w-[960px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-line">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Categoria / Produto</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Faturamento</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">CMV</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Lucro bruto</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">% Margem</th>
                  <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2 lg:table-cell">CMV %</th>
                  <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2 xl:table-cell">Qtd vendas</th>
                  <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2 xl:table-cell">Ticket médio</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Qtd itens</th>
                  <th className="hidden px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2 lg:table-cell">T.M/item</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((g) => (
                  <CategoriaTreeRows
                    key={g.categoriaId}
                    grupo={g}
                    aberta={abertas.has(g.categoriaId)}
                    onToggle={() => toggleCategoria(g.categoriaId)}
                  />
                ))}
                <tr className="border-t-2 border-line bg-bg-inset">
                  <td className="px-3 py-3 text-[13.5px] font-extrabold text-t0">Total</td>
                  <td className="px-3 py-3 text-right text-[14px] font-extrabold tabular-nums text-t0">{brl(totalTabela.faturamento)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1">{brl(totalTabela.cmv)}</td>
                  <td className="px-3 py-3 text-right text-[14px] font-extrabold tabular-nums text-ok">{brl(totalTabela.lucro)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-extrabold tabular-nums text-t0">{totalTabela.margemPct.toFixed(0)}%</td>
                  <td className="hidden px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1 lg:table-cell">{totalTabela.cmvPct.toFixed(0)}%</td>
                  <td className="hidden px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1 xl:table-cell">{num(totalTabela.qtdVendas)}</td>
                  <td className="hidden px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1 xl:table-cell">{brl(totalTabela.ticketMedio)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-extrabold tabular-nums text-t0">{num(totalTabela.itens)}</td>
                  <td className="hidden px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1 lg:table-cell">{brl(totalTabela.tmPorItem)}</td>
                  <td className="px-3 py-3" />
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile — cards por categoria (Responsive Tables) */}
        <div className="flex flex-col gap-2.5 p-3.5 md:hidden">
          {grupos.length === 0 ? (
            <p className="py-8 text-center text-sm text-t2">Nenhum produto encontrado.</p>
          ) : (
            <>
              {grupos.map((g) => {
                const aberta = abertas.has(g.categoriaId);
                return (
                  <div key={g.categoriaId} className="rounded-xl border border-line bg-bg-inset p-3.5">
                    <button
                      type="button"
                      onClick={() => toggleCategoria(g.categoriaId)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-t0">{g.nome}</p>
                        <p className="mt-0.5 text-[11px] text-t2">{g.produtos.length} produto{g.produtos.length === 1 ? "" : "s"}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[13px] font-extrabold tabular-nums text-t0">{brl(g.metrics.faturamento)}</span>
                        <Chevron aberto={aberta} />
                      </div>
                    </button>
                    <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-2.5 text-[11.5px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-t2">Lucro bruto</span>
                        <span className="font-semibold tabular-nums text-ok">{brl(g.metrics.lucro)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-t2">Margem</span>
                        <span className="font-semibold tabular-nums text-t0">{g.metrics.margemPct.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-t2">CMV</span>
                        <span className="font-semibold tabular-nums text-t0">{brl(g.metrics.cmv)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-t2">Itens</span>
                        <span className="font-semibold tabular-nums text-t0">{num(g.metrics.itens)}</span>
                      </div>
                    </div>
                    {aberta && (
                      <div className="mt-2.5 flex flex-col gap-2 border-t border-line pt-2.5">
                        {g.produtos.map((p) => (
                          <div key={p.codProduto} className="rounded-lg border border-line bg-bg-2 px-3 py-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 text-[12.5px] font-semibold text-t0">{p.nome}</p>
                              <EstoqueBadge coberturaDias={p.coberturaDias} />
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-t2">
                              <span className="font-semibold tabular-nums text-t0">{brl(p.receita)}</span>
                              <span>Margem {p.margemPct.toFixed(0)}%</span>
                              <span>{num(p.itens)} un</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="rounded-xl border border-line bg-bg-3 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-t2">Total</p>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-t2">Faturamento</span>
                    <span className="font-extrabold tabular-nums text-t0">{brl(totalTabela.faturamento)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-t2">Lucro bruto</span>
                    <span className="font-extrabold tabular-nums text-ok">{brl(totalTabela.lucro)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-t2">Margem</span>
                    <span className="font-extrabold tabular-nums text-t0">{totalTabela.margemPct.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-t2">Itens</span>
                    <span className="font-extrabold tabular-nums text-t0">{num(totalTabela.itens)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
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

/** Estimativa de nº de vendas a partir de itens (mock ~1,4 item/venda). */
function estimarVendas(itens: number): number {
  return Math.max(itens > 0 ? 1 : 0, Math.round(itens / 1.4));
}

interface MetricasLinha {
  faturamento: number;
  cmv: number;
  lucro: number;
  margemPct: number;
  cmvPct: number;
  qtdVendas: number;
  ticketMedio: number;
  itens: number;
  tmPorItem: number;
}

interface GrupoCategoria {
  categoriaId: number;
  nome: string;
  metrics: MetricasLinha;
  produtos: ProdutoLinha[];
}

function metricasDeCategoria(cat: CategoriaFat): MetricasLinha {
  const qtdVendas = estimarVendas(cat.itens);
  return {
    faturamento: cat.faturamento,
    cmv: cat.cmv,
    lucro: cat.lucro,
    margemPct: cat.margemPct,
    cmvPct: cat.faturamento > 0 ? (cat.cmv / cat.faturamento) * 100 : 0,
    qtdVendas,
    ticketMedio: qtdVendas > 0 ? cat.faturamento / qtdVendas : 0,
    itens: cat.itens,
    tmPorItem: cat.itens > 0 ? cat.faturamento / cat.itens : 0,
  };
}

function metricasDeProdutos(prods: ProdutoLinha[]): MetricasLinha {
  const faturamento = prods.reduce((s, p) => s + p.receita, 0);
  const cmv = prods.reduce((s, p) => s + p.cmv, 0);
  const lucro = prods.reduce((s, p) => s + p.margem, 0);
  const itens = prods.reduce((s, p) => s + p.itens, 0);
  const qtdVendas = estimarVendas(itens);
  return {
    faturamento,
    cmv,
    lucro,
    margemPct: faturamento > 0 ? (lucro / faturamento) * 100 : 0,
    cmvPct: faturamento > 0 ? (cmv / faturamento) * 100 : 0,
    qtdVendas,
    ticketMedio: qtdVendas > 0 ? faturamento / qtdVendas : 0,
    itens,
    tmPorItem: itens > 0 ? faturamento / itens : 0,
  };
}

function metricasDeProduto(p: ProdutoLinha): MetricasLinha {
  const qtdVendas = estimarVendas(p.itens);
  return {
    faturamento: p.receita,
    cmv: p.cmv,
    lucro: p.margem,
    margemPct: p.margemPct,
    cmvPct: p.cmvPct,
    qtdVendas,
    ticketMedio: qtdVendas > 0 ? p.receita / qtdVendas : 0,
    itens: p.itens,
    tmPorItem: p.itens > 0 ? p.receita / p.itens : 0,
  };
}

function Chevron({ aberto }: { aberto: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 text-t2 transition-transform", aberto && "rotate-90")}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function EstoqueBadge({ coberturaDias }: { coberturaDias: number | null }) {
  if (coberturaDias === null) return <Badge variant="danger">Ruptura</Badge>;
  if (coberturaDias <= 7) return <Badge variant="warning">{coberturaDias}d</Badge>;
  return <span className="tabular-nums text-t2">{coberturaDias}d</span>;
}

function CelulasMetricas({ m, estoque }: { m: MetricasLinha; estoque?: React.ReactNode }) {
  return (
    <>
      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-t0">{brl(m.faturamento)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-t1">{brl(m.cmv)}</td>
      <td className="px-3 py-2.5 text-right font-extrabold tabular-nums text-ok">{brl(m.lucro)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-t1">{m.margemPct.toFixed(0)}%</td>
      <td className="hidden px-3 py-2.5 text-right tabular-nums text-t1 lg:table-cell">{m.cmvPct.toFixed(0)}%</td>
      <td className="hidden px-3 py-2.5 text-right tabular-nums text-t1 xl:table-cell">{num(m.qtdVendas)}</td>
      <td className="hidden px-3 py-2.5 text-right tabular-nums text-t1 xl:table-cell">{brl(m.ticketMedio)}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-t1">{num(m.itens)}</td>
      <td className="hidden px-3 py-2.5 text-right tabular-nums text-t1 lg:table-cell">{brl(m.tmPorItem)}</td>
      <td className="px-3 py-2.5 text-right">{estoque ?? null}</td>
    </>
  );
}

function CategoriaTreeRows({
  grupo,
  aberta,
  onToggle,
}: {
  grupo: GrupoCategoria;
  aberta: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-line bg-bg-2 hover:bg-bg-3">
        <td className="px-3 py-2.5">
          <button type="button" onClick={onToggle} className="flex max-w-full items-center gap-2 text-left">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-bg-inset text-t2">
              <Chevron aberto={aberta} />
            </span>
            <span className="truncate text-[13.5px] font-extrabold text-t0">{grupo.nome}</span>
            <span className="shrink-0 text-[11px] font-semibold text-t2">{grupo.produtos.length}</span>
          </button>
        </td>
        <CelulasMetricas m={grupo.metrics} />
      </tr>
      {aberta &&
        grupo.produtos.map((p) => (
          <tr key={p.codProduto} className="border-b border-line/60 hover:bg-bg-3">
            <td className="px-3 py-2.5 pl-11">
              <span className="text-[13px] font-semibold text-t1">{p.nome}</span>
            </td>
            <CelulasMetricas m={metricasDeProduto(p)} estoque={<EstoqueBadge coberturaDias={p.coberturaDias} />} />
          </tr>
        ))}
    </>
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
