export interface BarDatum {
  label: string;
  value: number;
  /** Meta da categoria/período — desenha linha tracejada sobre as barras. */
  goal?: number;
  color?: string;
}

/** Largura mínima por barra no mobile — abaixo disso ativa scroll (padrão AreaLineChart). */
const MIN_BAR_W = 72;

export function BarChart({
  data,
  height = 220,
  color = "var(--acc)",
  goalColor = "var(--warn)",
  formatValue = (v: number) => String(v),
  showValues = true,
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
  /** Cor da linha de meta (quando `goal` presente). */
  goalColor?: string;
  formatValue?: (v: number) => string;
  /** Valores no topo das barras. Default true. */
  showValues?: boolean;
}) {
  const hasGoals = data.some((d) => (d.goal ?? 0) > 0);
  const max = Math.max(...data.map((d) => Math.max(d.value, d.goal ?? 0)), 1);
  /** Área das barras (sem labels/valores) — mesma altura efetiva p/ a linha SVG. */
  const plotH = Math.max(80, height - (showValues ? 28 : 8) - 22);
  const minW = Math.max(data.length * MIN_BAR_W, 280);

  const goalPoints = hasGoals
    ? data.map((d, i) => {
        const n = data.length;
        const x = n <= 1 ? 50 : ((i + 0.5) / n) * 100;
        const g = d.goal ?? 0;
        const y = plotH - (g / max) * plotH;
        return { x, y, g };
      })
    : [];

  const goalPath =
    goalPoints.length > 1
      ? goalPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
      : "";

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
      <div className="relative" style={{ minWidth: minW, height }}>
        <div className="relative flex h-full items-stretch gap-2.5 sm:gap-3">
          {data.map((d, i) => (
            <div
              key={d.label}
              className="relative z-[1] flex min-w-[56px] flex-1 flex-col items-center gap-2"
            >
              {showValues && (
                <span className="whitespace-nowrap text-[10.5px] font-bold text-t1">
                  {d.value === 0 ? "" : formatValue(d.value)}
                </span>
              )}
              <div className="flex w-full flex-1 items-end" style={{ minHeight: plotH }}>
                <div
                  className="w-full rounded-t-[8px] transition-all"
                  style={{
                    height: `${(d.value / max) * 100}%`,
                    background: d.color ?? color,
                    minHeight: d.value > 0 ? 4 : 0,
                    transformOrigin: "bottom",
                    animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05}s both`,
                  }}
                />
              </div>
              <span className="w-full truncate text-center text-[10.5px] font-semibold text-t2" title={d.label}>
                {d.label}
              </span>
            </div>
          ))}

          {/* Linha de meta sobre as barras (mesmo eixo Y) */}
          {hasGoals && goalPoints.length > 0 && (
            <svg
              className="pointer-events-none absolute inset-x-0 z-[2]"
              style={{
                top: showValues ? 28 : 8,
                height: plotH,
              }}
              viewBox={`0 0 100 ${plotH}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {goalPath && (
                <path
                  d={goalPath}
                  fill="none"
                  stroke={goalColor}
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {goalPoints.map((p, i) =>
                p.g > 0 ? (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill={goalColor}
                    stroke="var(--bg-2)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Barras lado-a-lado: realizado (colorido) vs meta (contorno tracejado).
 * Inspirado em referencia01.png — cada período mostra 2 barras adjacentes:
 *   - Esquerda: realizado (preenchido, cor do tema)
 *   - Direita: meta (contorno tracejado, fundo transparente)
 * Valores acima de cada barra. Verde quando realizado >= meta.
 * Sem dots, sem tooltips, sem sobreposição. Leitura imediata.
 */
export function StackedBarWithGoal({ data, height = 200, color = "var(--acc)", formatValue = (v: number) => String(v) }: {
  data: { label: string; value: number; goal: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.goal)), 1);

  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2.5" style={{ height }}>
      {data.map((d, i) => {
        const achieved = d.goal > 0 && d.value >= d.goal;
        const realPct = (d.value / maxVal) * 100;
        const goalPct = d.goal > 0 ? (d.goal / maxVal) * 100 : 0;
        return (
          <div key={d.label} className="flex min-w-[48px] flex-1 flex-col items-center gap-1">
            {/* Valores acima das barras */}
            <div className="flex w-full items-end justify-center gap-0.5">
              <span className="whitespace-nowrap text-[8px] font-bold text-t1 sm:text-[9px]">{formatValue(d.value)}</span>
              {d.goal > 0 && (
                <span className="whitespace-nowrap text-[8px] font-medium text-t2 sm:text-[9px]">{formatValue(d.goal)}</span>
              )}
            </div>
            {/* Par de barras: realizado + meta */}
            <div className="flex w-full flex-1 items-end justify-center gap-[2px]">
              {/* Barra realizado */}
              <div
                className="flex-1 rounded-t-[4px] sm:rounded-t-[6px]"
                style={{
                  height: `${Math.max(realPct, d.value > 0 ? 2 : 0)}%`,
                  background: achieved ? "var(--ok)" : color,
                  transformOrigin: "bottom",
                  animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05}s both`,
                }}
              />
              {/* Barra meta (contorno tracejado) */}
              {d.goal > 0 && (
                <div
                  className="flex-1 rounded-t-[4px] border-2 border-dashed sm:rounded-t-[6px]"
                  style={{
                    height: `${Math.max(goalPct, 2)}%`,
                    borderColor: achieved ? "var(--ok)" : "var(--t2)",
                    background: "transparent",
                    transformOrigin: "bottom",
                    animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${i * 0.05 + 0.1}s both`,
                  }}
                />
              )}
            </div>
            {/* Label do eixo X */}
            <span className="truncate text-[9px] font-semibold text-t2 sm:text-[10px]">{d.label}</span>
          </div>
        );
      })}
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
