import { useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, StatCard, DateRangePicker, Badge, PageHeader, Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { StackedBarChart, Heatmap, BarChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarTurnosView } from "@/data/gestao/dashboard";
import { brl, num } from "@/lib/formato";
import { deIso } from "@/lib/formato";
import type { DateRange } from "@/components/ui/DateRangePicker";

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconVendas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8l-4 4-4-4" />
    <path d="M16 16l-4-4-4 4" />
  </svg>
);
const IconMeta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CORES_TURNOS: Record<string, string> = {
  Manhã: "var(--acc)",
  Tarde: "var(--info)",
  Noite: "var(--warn)",
};

/** Cores distintas para cada KPI card (hero). */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
];

export default function TurnosPage() {
  const { escopo, mudar } = useEscopo();
  const [turnoFiltro, setTurnoFiltro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const view = useMemo(() => montarTurnosView(escopo, turnoFiltro), [escopo, turnoFiltro]);

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

  // Preparar dados para StackedBarChart (dia da semana × turno) — agrupa e tira média
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const ordemDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const acumulado: Record<string, Record<string, number>> = {};
  const contagem: Record<string, number> = {};
  for (const d of view.faturamentoPorDiaTurno) {
    const data = new Date(d.dia + "T12:00:00");
    const label = diasSemana[data.getDay()];
    if (!acumulado[label]) {
      acumulado[label] = {};
      contagem[label] = 0;
    }
    contagem[label]++;
    for (const [turno, fat] of Object.entries(d.porTurno)) {
      acumulado[label][turno] = (acumulado[label][turno] ?? 0) + fat;
    }
  }
  const stackedData = ordemDias
    .filter((label) => acumulado[label])
    .map((label) => {
      const n = contagem[label] || 1;
      const entry: Record<string, string | number> = { label };
      for (const [turno, soma] of Object.entries(acumulado[label])) {
        entry[turno] = Math.round(soma / n);
      }
      return entry;
    });
  const turnoKeys = view.kpisPorTurno.map((k) => k.nome);
  const turnoColors = turnoKeys.map((k) => CORES_TURNOS[k] ?? "var(--t2)");

  // Preparar dados para Heatmap (dia × hora)
  const heatmapRows = [...new Set(view.heatmap.map((c) => c.dia))].sort();
  const heatmapCols = [...new Set(view.heatmap.map((c) => String(c.hora).padStart(2, "0")))].sort();
  const heatmapData = heatmapRows.map((row) =>
    heatmapCols.map((col) => {
      const celula = view.heatmap.find((c) => c.dia === row && c.hora === Number(col));
      return celula?.valor ?? 0;
    }),
  );

  // KPIs multi-turno como cards individuais
  const melhorTurno = view.kpisPorTurno.reduce((a, b) => (a.faturamento > b.faturamento ? a : b), view.kpisPorTurno[0]);

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Dashboard",to: "/dashboard/visao-geral" }, {label: "Turnos" }]}
        title="Turnos"
        subtitle="Desempenho por turno, horário e dia da semana da loja."
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
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
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-inset px-3.5 text-[13px] font-semibold text-t1 transition-colors hover:border-acc focus:border-acc focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              <option value="WEPINK">WEPINK</option>
              <option value="WPINK">WPINK</option>
            </select>
            <select
              value={turnoFiltro ?? ""}
              onChange={(e) => setTurnoFiltro(e.target.value || null)}
              className="h-10 rounded-[var(--radius-vela-sm)] border border-line bg-bg-inset px-3.5 text-[13px] font-semibold text-t1 transition-colors hover:border-acc focus:border-acc focus:outline-none"
            >
              <option value="">Todos os turnos</option>
              {view.turnosDisponiveis.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </>
        }
      />

      {/* KPIs por turno — 4 cards multi-linha */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento por Turno"
          value=""
          icon={<IconFat />}
          iconColor={KPI_COLORS[0].iconColor}
          iconBg={KPI_COLORS[0].iconBg}
          sparkline={
            <div className="flex flex-col gap-0.5 text-[11px]">
              {view.kpisPorTurno.map((k) => (
                <span key={k.nome} className="flex justify-between gap-2">
                  <span className="text-t2">{k.nome}</span>
                  <span className="font-bold text-t0">{brl(k.faturamento)}</span>
                </span>
              ))}
            </div>
          }
        />
        <StatCard
          label="Vendas por Turno"
          value=""
          icon={<IconVendas />}
          iconColor={KPI_COLORS[1].iconColor}
          iconBg={KPI_COLORS[1].iconBg}
          sparkline={
            <div className="flex flex-col gap-0.5 text-[11px]">
              {view.kpisPorTurno.map((k) => (
                <span key={k.nome} className="flex justify-between gap-2">
                  <span className="text-t2">{k.nome}</span>
                  <span className="font-bold text-t0">{num(k.vendas)}</span>
                </span>
              ))}
            </div>
          }
        />
        <StatCard
          label="Ticket Médio por Turno"
          value=""
          icon={<IconTicket />}
          iconColor={KPI_COLORS[2].iconColor}
          iconBg={KPI_COLORS[2].iconBg}
          sparkline={
            <div className="flex flex-col gap-0.5 text-[11px]">
              {view.kpisPorTurno.map((k) => (
                <span key={k.nome} className="flex justify-between gap-2">
                  <span className="text-t2">{k.nome}</span>
                  <span className="font-bold text-t0">{brl(k.ticketMedio)}</span>
                </span>
              ))}
            </div>
          }
        />
        <StatCard
          label="Melhor Turno"
          value={melhorTurno?.nome ?? "—"}
          icon={<IconMeta />}
          iconColor={KPI_COLORS[3].iconColor}
          iconBg={KPI_COLORS[3].iconBg}
          delta={melhorTurno ? { value: brl(melhorTurno.faturamento), positive: true } : undefined}
        />
      </div>

      {/* Faturamento por Dia × Turno (StackedBarChart) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Faturamento por Dia × Turno</CardTitle>
            <Tooltip label="Comparativo de faturamento entre turnos por dia da semana. Valores em R$ direto nas barras.">
              <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
            </Tooltip>
          </div>
        </CardHeader>
        <div className="px-4 pb-4">
          <StackedBarChart
            data={stackedData}
            keys={turnoKeys}
            colors={turnoColors}
            height={240}
            showValues
            formatValue={brl}
          />
          <div className="mt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-t2">
            {turnoKeys.map((k) => (
              <span key={k} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CORES_TURNOS[k] ?? "var(--t2)" }} />
                {k}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Par: Heatmap + Vendedoras por Hora */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Mapa de Calor por Hora</CardTitle>
              <Tooltip label="Intensidade de faturamento por dia da semana e hora. Cor forte = pico de venda.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="px-4 pb-4">
            <Heatmap rows={heatmapRows} cols={heatmapCols} data={heatmapData} color="220,38,127" />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Vendedoras por Hora</CardTitle>
              <Tooltip label="Quantas vendedoras ativas em cada hora vs. mínimo ideal. Barra cheia = staff suficiente.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <CardTitle>Indicadores por Hora</CardTitle>
              <Tooltip label="Detalhamento horário com faturamento, atendimentos, ticket médio e comparativo vs. mesmo horário do dia anterior.">
                <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[9px] font-bold text-t2">ⓘ</span>
              </Tooltip>
            </div>
          </CardHeader>
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[700px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-t2">
                  <th className="py-2 pr-3">Hora</th>
                  <th className="py-2 pr-3 text-right">Faturamento</th>
                  <th className="py-2 pr-3 text-right">Atendimentos</th>
                  <th className="py-2 pr-3 text-right">Ticket Médio</th>
                  <th className="py-2 pr-3 text-right">% Fat. Dia</th>
                  <th className="py-2 pr-3 text-right">Acumulado</th>
                  <th className="py-2 text-right">Vs. Anterior</th>
                </tr>
              </thead>
              <tbody>
                {view.indicadoresPorHora.map((h) => (
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