import { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data, height = 220, color = "var(--acc)", formatValue = (v: number) => String(v) }: {
  data: BarDatum[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-stretch gap-2.5 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="whitespace-nowrap text-[10.5px] font-bold text-t1">{formatValue(d.value)}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-[8px] transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: d.color ?? color,
                minHeight: 4,
                transformOrigin: "bottom",
                animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05}s both`,
              }}
            />
          </div>
          <span className="truncate text-[10.5px] font-semibold text-t2">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Barras de realizado + bolinha de meta por período com tooltip. Meta variável por barra. Responsivo para mobile. */
export function BarChartWithGoalLine({ data, height = 220, color = "var(--acc)", goalColor = "var(--t2)", formatValue = (v: number) => String(v) }: {
  data: { label: string; value: number; goal: number }[];
  height?: number;
  color?: string;
  goalColor?: string;
  formatValue?: (v: number) => string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.goal)), 1);
  const minBarWidth = 56;
  const needsScroll = data.length * minBarWidth > 320;

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="relative flex items-stretch gap-2 sm:gap-3" style={{ height, minWidth: needsScroll ? data.length * minBarWidth : undefined }}>
        {data.map((d, i) => {
          const barPct = (d.value / maxVal) * 100;
          const goalPct = (d.goal / maxVal) * 100;
          const achieved = d.goal > 0 && d.value >= d.goal;
          return (
            <div key={d.label} className="relative flex min-w-[44px] flex-1 flex-col items-center gap-1">
              {/* Valor realizado acima da barra */}
              <span className="whitespace-nowrap text-[9px] font-bold text-t1 sm:text-[10px]">{formatValue(d.value)}</span>
              {/* Área da barra + bolinha da meta */}
              <div className="relative flex w-full flex-1 items-end">
                {/* Barra de realizado */}
                <div
                  className="w-full rounded-t-[6px] transition-all sm:rounded-t-[8px]"
                  style={{
                    height: `${barPct}%`,
                    background: achieved ? "var(--ok)" : color,
                    minHeight: 4,
                    transformOrigin: "bottom",
                    animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05}s both`,
                  }}
                />
                {/* Bolinha da meta — posicionada na altura da meta dentro da coluna */}
                {d.goal > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                    className="absolute left-1/2 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-transform hover:scale-125"
                    style={{
                      bottom: `calc(${goalPct}% - 8px)`,
                      borderColor: goalColor,
                      background: achieved ? "var(--ok)" : "var(--bg-3)",
                    }}
                    aria-label={`Meta: ${formatValue(d.goal)}`}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ background: goalColor }} />
                  </button>
                )}
                {/* Tooltip ao clicar na bolinha */}
                {activeIdx === i && d.goal > 0 && (
                  <div className="absolute bottom-full left-1/2 z-30 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-bg-3 px-2.5 py-1.5 text-[10px] shadow-lg">
                    <p className="font-bold text-t0">{d.label}</p>
                    <p className="text-t1">Realizado: <span className="font-bold text-ok">{formatValue(d.value)}</span></p>
                    <p className="text-t1">Meta: <span className="font-bold" style={{ color: goalColor }}>{formatValue(d.goal)}</span></p>
                    {d.goal > 0 && (
                      <p className="text-t2">{achieved ? "✅ Atingida" : `Faltam ${formatValue(d.goal - d.value)}`}</p>
                    )}
                  </div>
                )}
              </div>
              {/* Label do eixo X */}
              <span className="truncate text-[9px] font-semibold text-t2 sm:text-[10px]">{d.label}</span>
            </div>
          );
        })}
      </div>
      {/* Fechar tooltip ao clicar fora */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveIdx(null)} />
      )}
    </div>
  );
}

export function StackedBarChart({ data, keys, colors, height = 220, showValues = true, formatValue }: {
  data: Array<Record<string, number | string>>;
  keys: string[];
  colors: string[];
  height?: number;
  /** Mostra o total da coluna (soma das séries) acima da barra. Default true (R$ direto no gráfico). */
  showValues?: boolean;
  /** Formata o valor exibido (ex.: brl). Só usado quando showValues=true. */
  formatValue?: (v: number) => string;
}) {
  const totais = data.map((d) => keys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0));
  const max = Math.max(...totais, 1);

  return (
    <div className="flex items-stretch gap-2.5 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          {showValues && formatValue && <span className="whitespace-nowrap text-[11px] font-extrabold text-t0">{totais[i] === 0 ? "" : formatValue(totais[i])}</span>}
          <div
            className="flex w-full flex-1 flex-col-reverse items-stretch overflow-hidden rounded-t-[8px]"
            style={{ transformOrigin: "bottom", animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05}s both` }}
          >
            {keys.map((k, ki) => {
              const v = Number(d[k]) || 0;
              return <div key={k} style={{ height: `${(v / max) * 100}%`, background: colors[ki] }} />;
            })}
          </div>
          <span className="truncate text-[10.5px] font-semibold text-t2">{String(d.label ?? i)}</span>
        </div>
      ))}
    </div>
  );
}
