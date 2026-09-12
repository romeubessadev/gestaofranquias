import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, StatCard, Segmented, DateRangePicker, Badge } from "@/components/ui";
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

export default function TurnosPage() {
  const { escopo, mudar } = useEscopo();
  const [turnoFiltro, setTurnoFiltro] = useState<string | null>(null);

  const view = useMemo(() => montarTurnosView(escopo, turnoFiltro), [escopo, turnoFiltro]);

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

  // Preparar dados para StackedBarChart (dia × turno)
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const stackedData = view.faturamentoPorDiaTurno.map((d) => {
    const data = new Date(d.dia + "T12:00:00");
    const label = diasSemana[data.getDay()];
    const entry: Record<string, string | number> = { label };
    for (const [turno, fat] of Object.entries(d.porTurno)) {
      entry[turno] = fat;
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
        <select
          value={turnoFiltro ?? ""}
          onChange={(e) => setTurnoFiltro(e.target.value || null)}
          className="h-[42px] rounded-[11px] border border-line bg-bg-inset px-3 text-[13px] font-semibold text-t1 transition-colors hover:border-acc focus:border-acc focus:outline-none"
        >
          <option value="">Todos os turnos</option>
          {view.turnosDisponiveis.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>

      {/* KPIs por turno — 4 cards multi-linha */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento por Turno"
          value=""
          icon={<IconFat />}
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