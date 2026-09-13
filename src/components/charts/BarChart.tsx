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

/** Barras de realizado + linha tracejada horizontal indicando a meta. */
export function BarChartWithGoalLine({ data, height = 220, color = "var(--acc)", goalColor = "var(--t2)", formatValue = (v: number) => String(v) }: {
  data: { label: string; value: number; goal: number }[];
  height?: number;
  color?: string;
  goalColor?: string;
  formatValue?: (v: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.goal)), 1);

  return (
    <div className="relative flex items-stretch gap-2.5 sm:gap-3" style={{ height }}>
      {/* Linha tracejada da meta — posicionada absolutamente */}
      {data.length > 0 && data[0].goal > 0 && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-dashed"
          style={{
            bottom: `${(data[0].goal / maxVal) * 100}%`,
            borderColor: goalColor,
            // Compensar o espaço dos labels abaixo (~20px) e valores acima (~18px)
            marginBottom: 20,
            marginTop: 18,
          }}
        />
      )}
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="whitespace-nowrap text-[10.5px] font-bold text-t1">{formatValue(d.value)}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-[8px] transition-all"
              style={{
                height: `${(d.value / maxVal) * 100}%`,
                background: d.value >= d.goal ? "var(--ok)" : color,
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
