import { useId, useMemo, useState } from "react";

export interface AreaLineChartProps {
  data: number[];
  /** Segunda série no mesmo eixo (ex.: meta). Escala compartilhada. */
  compareData?: number[];
  labels?: string[];
  color?: string;
  compareColor?: string;
  height?: number;
  showArea?: boolean;
  /** Mostra o valor formatado direto em cada ponto da linha. */
  showValues?: boolean;
  formatValue?: (v: number) => string;
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Largura lógica do viewBox — o SVG escala fluidamente (padrão Vela / Revenue vs expenses). */
const VB_W = 600;

function toPoints(data: number[], height: number, padY: number, min: number, range: number) {
  const chartH = height - padY * 2;
  return data.map((v, i) => ({
    x: data.length <= 1 ? VB_W / 2 : (i / (data.length - 1)) * VB_W,
    y: padY + chartH * (1 - (v - min) / range),
  }));
}

export function AreaLineChart({
  data,
  compareData,
  labels,
  color = "var(--acc)",
  compareColor = "var(--t2)",
  height = 240,
  showArea = true,
  showValues = false,
  formatValue = (v) => String(v),
}: AreaLineChartProps) {
  const gradientId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const padY = 16;

  const { points, comparePoints, min, max } = useMemo(() => {
    const pool = compareData && compareData.length === data.length ? [...data, ...compareData] : data;
    const mn = Math.min(...pool);
    const mx = Math.max(...pool);
    const range = mx - mn || 1;
    return {
      points: toPoints(data, height, padY, mn, range),
      comparePoints:
        compareData && compareData.length === data.length
          ? toPoints(compareData, height, padY, mn, range)
          : null,
      min: mn,
      max: mx,
    };
  }, [data, compareData, height]);

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : "";
  const comparePath = comparePoints ? buildSmoothPath(comparePoints) : "";
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * VB_W;
    const idx = Math.round((relX / VB_W) * Math.max(data.length - 1, 0));
    setHoverIdx(Math.min(data.length - 1, Math.max(0, idx)));
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        className="vela-reveal h-full w-full overflow-visible"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {showArea && areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {comparePath && (
          <path
            d={comparePath}
            fill="none"
            stroke={compareColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {showValues &&
          points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={color}
              style={{ pointerEvents: "none" }}
            >
              {formatValue(data[i])}
            </text>
          ))}
        {active && (
          <g>
            <line
              x1={active.x}
              y1={0}
              x2={active.x}
              y2={height}
              stroke="var(--line-2)"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            {comparePoints && hoverIdx !== null && (
              <circle
                cx={comparePoints[hoverIdx].x}
                cy={comparePoints[hoverIdx].y}
                r="4"
                fill={compareColor}
                stroke="var(--bg-2)"
                strokeWidth="2"
              />
            )}
            <circle cx={active.x} cy={active.y} r="5" fill={color} stroke="var(--bg-2)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {active && hoverIdx !== null && (() => {
        const leftPct = (active.x / VB_W) * 100;
        const topPct = (active.y / height) * 100;
        let translateX = "-50%";
        if (leftPct < 12) translateX = "0";
        else if (leftPct > 88) translateX = "-100%";
        const flipDown = topPct < 22;
        return (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-line bg-bg-3 px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-vela)]"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              marginTop: flipDown ? 10 : -8,
              transform: `translateX(${translateX})${flipDown ? "" : " translateY(-100%)"}`,
              whiteSpace: "nowrap",
            }}
          >
            {labels?.[hoverIdx] ? (
              <span className="mb-0.5 block text-[10px] font-semibold text-t2">{labels[hoverIdx]}</span>
            ) : null}
            <span className="flex items-center gap-1.5 font-bold text-t0">
              <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: color }} />
              {formatValue(data[hoverIdx])}
            </span>
            {compareData && compareData.length === data.length && (
              <span className="mt-0.5 flex items-center gap-1.5 font-semibold text-t1">
                <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: compareColor }} />
                {formatValue(compareData[hoverIdx])}
              </span>
            )}
          </div>
        );
      })()}

      <span className="sr-only">
        Range {formatValue(min)} to {formatValue(max)}
      </span>
    </div>
  );
}
