import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, PageHeader, Button, Badge, ThSort, type SortDir } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { Heatmap, BarChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { SeletorMarca } from "@/pages/dashboard/SeletorMarca";
import { montarGruposView } from "@/data/gestao/dashboard";
import { brl, brlK, num } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";

type HoraSort = "hora" | "faturamento" | "atendimentos" | "ticket" | "pctFat" | "acumulado" | "delta";

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
/** Troféu — Melhor grupo. */
const IconMelhor = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
    <path d="M6 3h12v7a6 6 0 0 1-12 0V3Z" />
    <path d="M12 16v3" />
    <path d="M8 22h8" />
  </svg>
);

/** Mesmo padrão visual das demais telas (Equipe/VG): ícone + valor. */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
];

const filtroSelectClass =
  "h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none";

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
      ?
    </span>
  </Tooltip>
);

export default function GruposPage() {
  const { escopo, mudar } = useEscopo();
  const [grupoFiltro, setGrupoFiltro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [horaSort, setHoraSort] = useState<HoraSort | null>(null);
  const [horaDir, setHoraDir] = useState<SortDir>("asc");

  const gruposDisponiveis = useMemo(() => montarGruposView(escopo, null).gruposDisponiveis, [escopo]);
  // Se a loja mudar e o grupo sumir da lista, volta para "Todos".
  const grupoAtivo = grupoFiltro && gruposDisponiveis.some((g) => g.nome === grupoFiltro) ? grupoFiltro : null;
  const view = useMemo(() => montarGruposView(escopo, grupoAtivo), [escopo, grupoAtivo]);

  const indicadoresOrdenados = useMemo(() => {
    const rows = view.indicadoresPorHora ?? [];
    if (!horaSort) return rows;
    const dir = horaDir === "asc" ? 1 : -1;
    const deltaNum = (v?: { value: string; positive: boolean } | null) => {
      if (!v) return null;
      const n = Number(v.value.replace(/[^\d.,-]/g, "").replace(",", "."));
      return Number.isFinite(n) ? (v.positive ? n : -n) : null;
    };
    return [...rows].sort((a, b) => {
      if (horaSort === "hora") return (a.hora - b.hora) * dir;
      if (horaSort === "faturamento") return (a.faturamento - b.faturamento) * dir;
      if (horaSort === "atendimentos") return (a.atendimentos - b.atendimentos) * dir;
      if (horaSort === "ticket") return (a.ticketMedio - b.ticketMedio) * dir;
      if (horaSort === "pctFat") return (a.pctFatDia - b.pctFatDia) * dir;
      if (horaSort === "acumulado") return (a.fatAcumulado - b.fatAcumulado) * dir;
      const da = deltaNum(a.deltaVsAnterior);
      const db = deltaNum(b.deltaVsAnterior);
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return (da - db) * dir;
    });
  }, [view.indicadoresPorHora, horaSort, horaDir]);

  function toggleHoraSort(key: HoraSort) {
    if (horaSort === key) {
      setHoraDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setHoraSort(key);
      setHoraDir(key === "hora" ? "asc" : "desc");
    }
  }

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

  // Barras por dia da semana (padrão Sales this week) — média do período; respeita filtro de grupo
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const ordemDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const acumulado: Record<string, number> = {};
  const contagem: Record<string, number> = {};
  for (const d of view.faturamentoPorDiaGrupo) {
    const data = new Date(d.dia + "T12:00:00");
    const label = diasSemana[data.getDay()];
    contagem[label] = (contagem[label] ?? 0) + 1;
    let fatDia = 0;
    for (const [grupo, fat] of Object.entries(d.porGrupo)) {
      if (grupoAtivo && grupo !== grupoAtivo) continue;
      fatDia += fat;
    }
    acumulado[label] = (acumulado[label] ?? 0) + fatDia;
  }
  const barrasDiaGrupo = ordemDias
    .filter((label) => acumulado[label] != null)
    .map((label) => ({
      label,
      value: Math.round(acumulado[label] / (contagem[label] || 1)),
    }));

  // Preparar dados para Heatmap (dia × hora) / barras por hora em 1 dia
  const heatmapIsos = [...new Set(view.heatmap.map((c) => c.dia))].sort();
  const ehUmDia = view.periodo.inicio === view.periodo.fim;
  const comDiaSemana = heatmapIsos.length <= 14;
  const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  function rotuloDiaHeatmap(iso: string): string {
    const d = deIso(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    if (!comDiaSemana) return `${dd}/${mm}`;
    return `${DIAS_ABREV[d.getDay()]} ${dd}/${mm}`;
  }
  const heatmapRows = heatmapIsos.map(rotuloDiaHeatmap);
  const heatmapCols = [...new Set(view.heatmap.map((c) => c.hora))]
    .sort((a, b) => a - b)
    .map((h) => `${String(h).padStart(2, "0")}h`);
  const heatmapData = heatmapIsos.map((iso) =>
    heatmapCols.map((col) => {
      const hora = Number(col.replace("h", ""));
      const celula = view.heatmap.find((c) => c.dia === iso && c.hora === hora);
      return celula?.valor ?? 0;
    }),
  );
  const barrasPorHora = ehUmDia
    ? (view.indicadoresPorHora ?? []).map((h) => ({
        label: `${String(h.hora).padStart(2, "0")}h`,
        value: h.faturamento,
      }))
    : [];
  // Fallback se indicadores ainda não veio: monta a partir do heatmap de 1 dia
  const barrasPorHoraFinal =
    barrasPorHora.length > 0
      ? barrasPorHora
      : ehUmDia && heatmapIsos[0]
        ? heatmapCols.map((col, ci) => ({
            label: col,
            value: heatmapData[0]?.[ci] ?? 0,
          }))
        : [];

  // KPIs: sem filtro = soma de todos; com filtro = só o grupo. Comparativo entre grupos fica nos charts.
  const kpisFonte = grupoAtivo
    ? view.kpisPorGrupo.filter((k) => k.nome === grupoAtivo)
    : view.kpisPorGrupo;
  const kpiFat = kpisFonte.reduce((s, k) => s + k.faturamento, 0);
  const kpiVendas = kpisFonte.reduce((s, k) => s + k.vendas, 0);
  const kpiTicket = kpiVendas > 0 ? kpiFat / kpiVendas : 0;
  const melhorGrupo = view.kpisPorGrupo.reduce(
    (a, b) => (a.faturamento > b.faturamento ? a : b),
    view.kpisPorGrupo[0],
  );

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Grupos" }]}
        title="Grupos"
        subtitle="Desempenho por grupo, horário e intensidade da operação."
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button
              size="sm"
              onClick={forcarAtualizacao}
              disabled={refreshing}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={refreshing ? "animate-spin" : ""}
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              }
            >
              Atualizar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Exportar
            </Button>
            <DateRangePicker value={dateRange} onChange={onDateChange} size="sm" />
            <SeletorMarca value={escopo.divisao} onChange={onMarcaChange} />
            <select
              value={grupoAtivo ?? ""}
              onChange={(e) => setGrupoFiltro(e.target.value || null)}
              className={filtroSelectClass}
            >
              <option value="">Todos os grupos</option>
              {gruposDisponiveis.map((g) => (
                <option key={g.id} value={g.nome}>
                  {g.nome}
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* KPIs — um valor (soma ou grupo filtrado); breakdown fica nos gráficos */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={brl(kpiFat)}
          icon={<IconFat />}
          iconColor={KPI_COLORS[0].iconColor}
          iconBg={KPI_COLORS[0].iconBg}
          tooltip={grupoAtivo ? `Faturamento de ${grupoAtivo} no período.` : "Soma do faturamento de todos os grupos no período."}
        />
        <StatCard
          label="Vendas"
          value={num(kpiVendas)}
          icon={<IconVendas />}
          iconColor={KPI_COLORS[1].iconColor}
          iconBg={KPI_COLORS[1].iconBg}
          tooltip={grupoAtivo ? `Nº de vendas de ${grupoAtivo} no período.` : "Soma das vendas de todos os grupos no período."}
        />
        <StatCard
          label="Ticket médio"
          value={brl(kpiTicket)}
          icon={<IconTicket />}
          iconColor={KPI_COLORS[2].iconColor}
          iconBg={KPI_COLORS[2].iconBg}
          tooltip="Faturamento ÷ nº de vendas no escopo selecionado."
        />
        <StatCard
          label="Melhor grupo"
          value={melhorGrupo?.nome ?? "—"}
          icon={<IconMelhor />}
          iconColor={KPI_COLORS[3].iconColor}
          iconBg={KPI_COLORS[3].iconBg}
          delta={melhorGrupo ? { value: brl(melhorGrupo.faturamento), positive: true } : undefined}
          tooltip="Grupo com maior faturamento no período (entre todos os grupos)."
        />
      </div>

      {/* Faturamento por Dia × Grupo — padrão Sales this week (Ecommerce) */}
      <Card className="mt-4" padding="lg">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle>Faturamento por Dia × Grupo</CardTitle>
              <TipHelp label="Faturamento médio por dia da semana no período. Com filtro de grupo, mostra só aquele grupo; sem filtro, soma todos." />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-t0">{brl(kpiFat)}</p>
          </div>
        </div>
        {barrasDiaGrupo.length === 0 ? (
          <span className="flex items-center justify-center py-6 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
        ) : (
          <BarChart data={barrasDiaGrupo} height={200} formatValue={brlK} />
        )}
      </Card>

      {/* Par: intensidade horária + Vendedoras por Hora */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          {ehUmDia ? (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CardTitle>Faturamento por Hora</CardTitle>
                    <TipHelp label="Em período de 1 dia, o mapa de calor vira barras por hora — mais fácil de ler. Corresponde às horas do grupo filtrado (ou todas)." />
                  </div>
                  <p className="mt-1.5 text-2xl font-extrabold text-t0">{brl(kpiFat)}</p>
                </div>
              </div>
              {barrasPorHoraFinal.length === 0 ? (
                <span className="flex items-center justify-center py-6 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
              ) : (
                <BarChart data={barrasPorHoraFinal} height={200} formatValue={brlK} />
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-1.5">
                <CardTitle>Mapa de Calor por Hora</CardTitle>
                <TipHelp label="Intensidade de faturamento por dia × hora. Cor forte = pico de venda. Passe o mouse na célula para ver o R$." />
              </div>
              {heatmapIsos.length === 0 ? (
                <span className="flex items-center justify-center py-6 text-center text-[12px] text-t2">Sem dados no período selecionado.</span>
              ) : (
                <Heatmap
                  rows={heatmapRows}
                  cols={heatmapCols}
                  data={heatmapData}
                  color="220,38,127"
                  formatValue={brl}
                  rowMinWidth={comDiaSemana ? 72 : 44}
                />
              )}
            </>
          )}
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Vendedoras por Hora</CardTitle>
              <TipHelp label="Quantas vendedoras ativas em cada hora vs. mínimo ideal. Barra cheia = staff suficiente." />
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <BarChart
              data={view.vendedorasPorHora.map((v) => ({
                label: `${String(v.hora).padStart(2, "0")}h`,
                value: v.reais,
              }))}
              height={200}
              formatValue={(v) => String(Math.round(v))}
            />
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--acc)]" /> Staff real</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--t2)]" /> Meta mínima</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Indicadores por Hora (condicional: período = 1 dia) */}
      {view.indicadoresPorHora && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Indicadores por Hora</CardTitle>
              <TipHelp label="Detalhamento horário com faturamento, atendimentos, ticket médio e comparativo vs. mesmo horário do dia anterior." />
            </div>
          </CardHeader>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-t2">
                  <ThSort label="Hora" active={horaSort === "hora"} dir={horaDir} onClick={() => toggleHoraSort("hora")} align="left" className="py-2 pr-3" />
                  <ThSort label="Faturamento" active={horaSort === "faturamento"} dir={horaDir} onClick={() => toggleHoraSort("faturamento")} className="py-2 pr-3" />
                  <ThSort label="Atendimentos" active={horaSort === "atendimentos"} dir={horaDir} onClick={() => toggleHoraSort("atendimentos")} className="py-2 pr-3" />
                  <ThSort label="Ticket médio" active={horaSort === "ticket"} dir={horaDir} onClick={() => toggleHoraSort("ticket")} className="py-2 pr-3" />
                  <ThSort label="% Fat. Dia" active={horaSort === "pctFat"} dir={horaDir} onClick={() => toggleHoraSort("pctFat")} className="py-2 pr-3" />
                  <ThSort label="Acumulado" active={horaSort === "acumulado"} dir={horaDir} onClick={() => toggleHoraSort("acumulado")} className="py-2 pr-3" />
                  <ThSort label="Vs. Anterior" active={horaSort === "delta"} dir={horaDir} onClick={() => toggleHoraSort("delta")} className="py-2" />
                </tr>
              </thead>
              <tbody>
                {indicadoresOrdenados.map((h) => (
                  <tr key={h.hora} className="border-b border-line/50 text-t1 last:border-0 hover:bg-bg-inset/50">
                    <td className="py-2 pr-3 font-semibold text-t0">{String(h.hora).padStart(2, "0")}:00</td>
                    <td className="py-2 pr-3 text-right">{brl(h.faturamento)}</td>
                    <td className="py-2 pr-3 text-right">{num(h.atendimentos)}</td>
                    <td className="py-2 pr-3 text-right">{brl(h.ticketMedio)}</td>
                    <td className="py-2 pr-3 text-right">{h.pctFatDia.toFixed(1)}%</td>
                    <td className="py-2 pr-3 text-right">{brl(h.fatAcumulado)}</td>
                    <td className="py-2 text-right">
                      {h.deltaVsAnterior ? (
                        <Badge variant={h.deltaVsAnterior.positive ? "success" : "danger"}>
                          {h.deltaVsAnterior.positive ? "↗" : "↘"} {h.deltaVsAnterior.value}
                        </Badge>
                      ) : (
                        <span className="text-t2">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
