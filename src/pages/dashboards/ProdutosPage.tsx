import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, PageHeader, Button, Pagination } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { AreaLineChart, BarChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarProdutosView, type ProdutosKpi, type ProdutoLinha } from "@/data/gestao/dashboard";
import { brl, brlK, num } from "@/lib/formato";
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

type RankingOrd = "faturamento" | "itens" | "margem";
type SortKey = "nome" | "categoria" | "faturamento" | "cmv" | "lucro" | "margemPct" | "cmvPct" | "qtdVendas" | "ticketMedio" | "itens";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
      ?
    </span>
  </Tooltip>
);

const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];

const filtroSelectClass =
  "h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none";

const CORES_RANK = ["var(--ok)", "var(--info)", "var(--warn)", "var(--acc)", "var(--bad)"];

function AvatarIniciais({ nome, idx }: { nome: string; idx: number }) {
  const iniciais = nome.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const cor = CORES_RANK[idx % CORES_RANK.length];
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold"
      style={{ background: `color-mix(in srgb, ${cor} 15%, transparent)`, color: cor }}
    >
      {iniciais || "?"}
    </span>
  );
}

export default function ProdutosPage() {
  const { escopo, mudar } = useEscopo();
  const [rankingOrd, setRankingOrd] = useState<RankingOrd>("faturamento");
  const [catTabela, setCatTabela] = useState<number | null>(null);
  const [buscaTabela, setBuscaTabela] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("faturamento");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Sem filtro de categoria na view — filtro fica só no card da tabela.
  const view = useMemo(() => montarProdutosView(escopo, null), [escopo]);

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

  const topProdutos = useMemo(() => {
    return [...view.produtos].sort((a, b) => {
      if (rankingOrd === "faturamento") return b.receita - a.receita;
      if (rankingOrd === "itens") return b.itens - a.itens;
      return b.margemPct - a.margemPct;
    });
  }, [view.produtos, rankingOrd]);

  const linhasTabela = useMemo(() => {
    let lista = view.produtos;
    if (catTabela !== null) {
      const nomeCat = view.categorias.find((c) => c.categoriaId === catTabela)?.nome;
      if (nomeCat) lista = lista.filter((p) => p.categoriaNome === nomeCat);
    }
    if (buscaTabela.trim()) {
      const q = buscaTabela.toLowerCase();
      lista = lista.filter(
        (p) => p.nome.toLowerCase().includes(q) || p.categoriaNome.toLowerCase().includes(q),
      );
    }
    const enriched = lista.map((p) => ({ ...p, ...metricasDeProduto(p) }));
    return [...enriched].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "nome") return a.nome.localeCompare(b.nome) * dir;
      if (sortKey === "categoria") return a.categoriaNome.localeCompare(b.categoriaNome) * dir;
      if (sortKey === "faturamento") return (a.faturamento - b.faturamento) * dir;
      if (sortKey === "cmv") return (a.cmv - b.cmv) * dir;
      if (sortKey === "lucro") return (a.lucro - b.lucro) * dir;
      if (sortKey === "margemPct") return (a.margemPct - b.margemPct) * dir;
      if (sortKey === "cmvPct") return (a.cmvPct - b.cmvPct) * dir;
      if (sortKey === "qtdVendas") return (a.qtdVendas - b.qtdVendas) * dir;
      if (sortKey === "ticketMedio") return (a.ticketMedio - b.ticketMedio) * dir;
      return (a.itens - b.itens) * dir;
    });
  }, [view.produtos, view.categorias, catTabela, buscaTabela, sortKey, sortDir]);

  const totalTabela = useMemo(() => metricasDeProdutos(linhasTabela), [linhasTabela]);

  const totalPages = Math.max(1, Math.ceil(linhasTabela.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = linhasTabela.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [catTabela, buscaTabela, sortKey, sortDir]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nome" || key === "categoria" ? "asc" : "desc");
    }
  }

  function exportCsv() {
    const header = [
      "Produto",
      "Categoria",
      "Faturamento",
      "CMV",
      "Lucro bruto",
      "% Margem",
      "CMV %",
      "Qtd vendas",
      "Ticket médio",
      "Qtd itens",
    ];
    const rows = linhasTabela.map((p) => [
      csvCell(p.nome),
      csvCell(p.categoriaNome),
      p.faturamento.toFixed(2),
      p.cmv.toFixed(2),
      p.lucro.toFixed(2),
      p.margemPct.toFixed(1),
      p.cmvPct.toFixed(1),
      String(p.qtdVendas),
      p.ticketMedio.toFixed(2),
      String(p.itens),
    ]);
    const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tabela-produtos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const catsDisponiveis = view.categorias.map((c) => ({ label: c.nome, value: c.categoriaId }));

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
          </>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} Icon={KPI_ICONS[i]} colorIdx={i} />
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Faturamento por Categoria</CardTitle>
            <TipHelp label="Faturamento por categoria com linha de % Margem sobreposta." />
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Top Linhas de Produto</CardTitle>
              <TipHelp label="Ranking das linhas de produto por faturamento no período." />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <th className="px-1 pb-3 text-left font-bold">Linha</th>
                  <th className="px-1 pb-3 text-right font-bold">Faturamento</th>
                  <th className="px-1 pb-3 text-right font-bold">Participação</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const linhas = view.topLinhas.slice(0, 6);
                  const totalFat = linhas.reduce((s, l) => s + l.faturamento, 0) || 1;
                  if (linhas.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="px-1 py-6 text-center text-[13px] text-t2">Sem dados no período selecionado.</td>
                      </tr>
                    );
                  }
                  return linhas.map((l, idx) => {
                    const pct = Math.round((l.faturamento / totalFat) * 100);
                    return (
                      <tr key={l.nome} className="border-b border-line last:border-b-0">
                        <td className="px-1 py-3 text-center text-[13px] font-extrabold text-t2">{idx + 1}</td>
                        <td className="px-1 py-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <AvatarIniciais nome={l.nome} idx={idx} />
                            <p className="truncate text-[13px] font-bold text-t0">{l.nome}</p>
                          </div>
                        </td>
                        <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{brlK(l.faturamento)}</td>
                        <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t1">{pct}%</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex w-full items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <CardTitle>Top Produtos</CardTitle>
                <TipHelp label="Ranking dos produtos mais vendidos. Escolha a métrica de ordenação." />
              </div>
              <select
                value={rankingOrd}
                onChange={(e) => setRankingOrd(e.target.value as RankingOrd)}
                className={filtroSelectClass}
              >
                <option value="faturamento">Faturamento</option>
                <option value="itens">Qtd Vendida</option>
                <option value="margem">Margem</option>
              </select>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <th className="px-1 pb-3 text-left font-bold">Produto</th>
                  <th className="px-1 pb-3 text-right font-bold">Itens</th>
                  <th className="px-1 pb-3 text-right font-bold">Faturamento</th>
                  <th className="px-1 pb-3 text-right font-bold">Margem</th>
                </tr>
              </thead>
              <tbody>
                {topProdutos.slice(0, 6).map((p, idx) => (
                  <tr key={p.codProduto} className="border-b border-line last:border-b-0">
                    <td className="px-1 py-3 text-center text-[13px] font-extrabold text-t2">{idx + 1}</td>
                    <td className="px-1 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AvatarIniciais nome={p.nome} idx={idx} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-t0">{p.nome}</p>
                          <p className="text-[11px] text-t2">{p.categoriaNome}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{num(p.itens)}</td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{brlK(p.receita)}</td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-ok">{p.margemPct.toFixed(0)}%</td>
                  </tr>
                ))}
                {topProdutos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-1 py-6 text-center text-[13px] text-t2">Sem dados no período selecionado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Tabela de Produtos — Data Table flat + Total + cards mobile */}
      <Card className="mt-4" padding="none">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <CardTitle>Tabela de Produtos</CardTitle>
            <TipHelp label="Lista de produtos com busca, filtro por categoria e ordenação. O Total soma todos os produtos do filtro atual — não só a página." />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Pesquisar produto…"
              value={buscaTabela}
              onChange={(e) => setBuscaTabela(e.target.value)}
              className={cn(filtroSelectClass, "sm:w-48")}
            />
            <select
              value={catTabela ?? ""}
              onChange={(e) => setCatTabela(e.target.value ? Number(e.target.value) : null)}
              className={filtroSelectClass}
            >
              <option value="">Todas as categorias</option>
              {catsDisponiveis.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={exportCsv} disabled={linhasTabela.length === 0}>
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto p-4 md:block">
          {linhasTabela.length === 0 ? (
            <p className="py-10 text-center text-sm text-t2">Nenhum produto encontrado.</p>
          ) : (
            <table className="w-full min-w-[1100px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-line">
                  <ThSort label="Produto" active={sortKey === "nome"} dir={sortDir} onClick={() => toggleSort("nome")} align="left" />
                  <ThSort label="Categoria" active={sortKey === "categoria"} dir={sortDir} onClick={() => toggleSort("categoria")} align="left" />
                  <ThSort label="Faturamento" active={sortKey === "faturamento"} dir={sortDir} onClick={() => toggleSort("faturamento")} />
                  <ThSort label="CMV" active={sortKey === "cmv"} dir={sortDir} onClick={() => toggleSort("cmv")} />
                  <ThSort label="Lucro bruto" active={sortKey === "lucro"} dir={sortDir} onClick={() => toggleSort("lucro")} />
                  <ThSort label="% Margem" active={sortKey === "margemPct"} dir={sortDir} onClick={() => toggleSort("margemPct")} />
                  <ThSort label="CMV %" active={sortKey === "cmvPct"} dir={sortDir} onClick={() => toggleSort("cmvPct")} />
                  <ThSort label="Qtd vendas" active={sortKey === "qtdVendas"} dir={sortDir} onClick={() => toggleSort("qtdVendas")} />
                  <ThSort label="Ticket médio" active={sortKey === "ticketMedio"} dir={sortDir} onClick={() => toggleSort("ticketMedio")} />
                  <ThSort label="Qtd itens" active={sortKey === "itens"} dir={sortDir} onClick={() => toggleSort("itens")} />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.codProduto} className="border-b border-line hover:bg-bg-3">
                    <td className="px-3 py-2.5 text-[13px] font-bold text-t0">{p.nome}</td>
                    <td className="px-3 py-2.5 text-t1">{p.categoriaNome}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-t0">{brl(p.faturamento)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{brl(p.cmv)}</td>
                    <td className="px-3 py-2.5 text-right font-extrabold tabular-nums text-ok">{brl(p.lucro)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{p.margemPct.toFixed(0)}%</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{p.cmvPct.toFixed(0)}%</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{num(p.qtdVendas)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{brl(p.ticketMedio)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-t1">{num(p.itens)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-line bg-bg-inset">
                  <td colSpan={2} className="px-3 py-3 text-[13.5px] font-extrabold text-t0">
                    Total
                    <span className="ml-2 text-[11px] font-semibold text-t2">
                      ({num(linhasTabela.length)} produto{linhasTabela.length === 1 ? "" : "s"})
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-[14px] font-extrabold tabular-nums text-t0">{brl(totalTabela.faturamento)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1">{brl(totalTabela.cmv)}</td>
                  <td className="px-3 py-3 text-right text-[14px] font-extrabold tabular-nums text-ok">{brl(totalTabela.lucro)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-extrabold tabular-nums text-t0">{totalTabela.margemPct.toFixed(0)}%</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1">{totalTabela.cmvPct.toFixed(0)}%</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1">{num(totalTabela.qtdVendas)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-bold tabular-nums text-t1">{brl(totalTabela.ticketMedio)}</td>
                  <td className="px-3 py-3 text-right text-[13.5px] font-extrabold tabular-nums text-t0">{num(totalTabela.itens)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile — card por produto */}
        <div className="flex flex-col gap-2.5 p-3.5 md:hidden">
          {pageRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-t2">Nenhum produto encontrado.</p>
          ) : (
            pageRows.map((p) => (
              <div key={p.codProduto} className="rounded-xl border border-line bg-bg-inset p-3.5">
                <p className="text-[13.5px] font-bold text-t0">{p.nome}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-t2">{p.categoriaNome}</p>
                <GradeMetricas m={p} className="mt-2.5 border-t border-line pt-2.5" />
              </div>
            ))
          )}
          {linhasTabela.length > 0 && (
            <div className="rounded-xl border border-line bg-bg-3 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-t2">
                Total · {num(linhasTabela.length)} produto{linhasTabela.length === 1 ? "" : "s"}
              </p>
              <GradeMetricas m={totalTabela} className="mt-2" destaque />
            </div>
          )}
        </div>

        {linhasTabela.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
            <span className="text-[12.5px] text-t2">
              Mostrando {pageRows.length} de {num(linhasTabela.length)} produtos
            </span>
            <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
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
  };
}

function metricasDeProdutos(prods: Array<Pick<MetricasLinha, "faturamento" | "cmv" | "lucro" | "itens">>): MetricasLinha {
  const faturamento = prods.reduce((s, p) => s + p.faturamento, 0);
  const cmv = prods.reduce((s, p) => s + p.cmv, 0);
  const lucro = prods.reduce((s, p) => s + p.lucro, 0);
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
  };
}

function csvCell(v: string): string {
  if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function ThSort({
  label,
  active,
  dir,
  onClick,
  align = "right",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={cn("px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide", align === "left" ? "text-left" : "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-t0",
          active ? "text-t0" : "text-t2",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <span className="text-[10px]">{active ? (dir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

function GradeMetricas({
  m,
  className,
  destaque = false,
}: {
  m: MetricasLinha;
  className?: string;
  destaque?: boolean;
}) {
  const val = destaque ? "font-extrabold tabular-nums text-t0" : "font-semibold tabular-nums text-t0";
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Faturamento", value: <span className={val}>{brl(m.faturamento)}</span> },
    { label: "CMV", value: <span className={val}>{brl(m.cmv)}</span> },
    { label: "Lucro bruto", value: <span className={cn(val, "text-ok")}>{brl(m.lucro)}</span> },
    { label: "% Margem", value: <span className={val}>{m.margemPct.toFixed(0)}%</span> },
    { label: "CMV %", value: <span className={val}>{m.cmvPct.toFixed(0)}%</span> },
    { label: "Qtd vendas", value: <span className={val}>{num(m.qtdVendas)}</span> },
    { label: "Ticket médio", value: <span className={val}>{brl(m.ticketMedio)}</span> },
    { label: "Qtd itens", value: <span className={val}>{num(m.itens)}</span> },
  ];
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-2">
          <span className="text-t2">{r.label}</span>
          {r.value}
        </div>
      ))}
    </div>
  );
}
