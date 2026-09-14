import { useId, useMemo, useState } from "react";

export interface AreaLineChartProps {
  data: number[];
  /** Segunda série no mesmo eixo (ex.: meta, período anterior). Escala compartilhada. */
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

const PAD_X = 8;
const PAD_TOP = 12;
const LABEL_H = 24;

function toPoints(data: number[], width: number, chartH: number, min: number, range: number) {
  return data.map((v, i) => ({
    x: PAD_X + (data.length <= 1 ? (width - PAD_X * 2) / 2 : (i / (data.length - 1)) * (width - PAD_X * 2)),
    y: PAD_TOP + chartH * (1 - (v - min) / range),
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
  const width = 600;
  const chartH = height - PAD_TOP - LABEL_H;

  const { points, comparePoints, min, max } = useMemo(() => {
    const pool = compareData && compareData.length === data.length ? [...data, ...compareData] : data;
    const mn = Math.min(...pool);
    const mx = Math.max(...pool);
    const range = mx - mn || 1;
    return {
      points: toPoints(data, width, chartH, mn, range),
      comparePoints: compareData && compareData.length === data.length ? toPoints(compareData, width, chartH, mn, range) : null,
      min: mn,
      max: mx,
    };
  }, [data, compareData, chartH]);

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + chartH} L ${points[0].x} ${PAD_TOP + chartH} Z`;
  const comparePath = comparePoints ? buildSmoothPath(comparePoints) : "";
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((relX - PAD_X) / (width - PAD_X * 2)) * Math.max(data.length - 1, 0));
    setHoverIdx(Math.min(data.length - 1, Math.max(0, idx)));
  }

  // Decide quais labels mostrar (evita sobreposição: mostra no máximo ~7)
  const maxLabels = 7;
  const step = Math.max(1, Math.ceil((labels?.length ?? 0) / maxLabels));
  const visibleLabelIndices = labels
    ? labels.map((_, i) => (i % step === 0 || i === labels.length - 1 ? i : -1)).filter((i) => i >= 0)
    : [];

  return (
    <div className="relative w-full" style={{ height }}>
      {/* SVG do gráfico — sem labels dentro para evitar distorção */}
      <svg
        viewBox={`0 0 ${width} ${height - LABEL_H}`}
        className="vela-reveal h-full w-full"
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ height: height - LABEL_H }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Linha de meta (tracejada) */}
        {comparePath && <path d={comparePath} fill="none" stroke={compareColor} strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />}
        {/* Área preenchida */}
        {showArea && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {/* Linha principal */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* Hover indicator */}
        {active && (
          <g>
            <line x1={active.x} y1={PAD_TOP} x2={active.x} y2={PAD_TOP + chartH} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            {comparePoints && hoverIdx !== null && (
              <circle cx={comparePoints[hoverIdx].x} cy={comparePoints[hoverIdx].y} r="4" fill={compareColor} stroke="var(--bg-2)" strokeWidth="2" />
            )}
            <circle cx={active.x} cy={active.y} r="5" fill={color} stroke="var(--bg-2)" strokeWidth="2" />
          </g>
        )}
        {/* Valores diretos nos pontos */}
        {showValues && points.map((p, i) => (
          <text key={i} x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} style={{ pointerEvents: "none" }}>
            {formatValue(data[i])}
          </text>
        ))}
      </svg>

      {/* Labels do eixo X como HTML — posicionamento preciso sem distorção do SVG */}
      {labels && labels.length > 0 && (
        <div className="relative mt-1" style={{ height: LABEL_H - 4 }}>
          {visibleLabelIndices.map((i) => (
            <span
              key={i}
              className="absolute text-[10px] font-semibold text-t2"
              style={{
                left: `${((points[i]?.x ?? 0) / width) * 100}%`,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              {labels[i]}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip flutuante com clamp nas laterais */}
      {active && hoverIdx !== null && (() => {
        const leftPct = (active.x / width) * 100;
        // Clamp: se muito perto da esquerda, alinha à esquerda; se muito perto da direita, alinha à direita
        let translateX = "-50%";
        if (leftPct < 15) translateX = "0";
        else if (leftPct > 85) translateX = "-100%";
        return (
          <div
            className="pointer-events-none absolute z-10 -translate-y-full rounded-lg border border-line bg-bg-3 px-3 py-2 text-[11px] shadow-lg"
            style={{
              left: `${leftPct}%`,
              top: `${(active.y / (height - LABEL_H)) * 100}%`,
              marginTop: -10,
              transform: `translateX(${translateX})`,
            }}
          >
          {labels?.[hoverIdx] ? <span className="mb-1 block text-[10px] font-semibold text-t2">{labels[hoverIdx]}</span> : null}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
            <span className="font-bold" style={{ color }}>{formatValue(data[hoverIdx])}</span>
          </span>
          {compareData && compareData.length === data.length && (
            <span className="mt-0.5 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full border border-dashed" style={{ borderColor: compareColor }} />
              <span className="font-semibold" style={{ color: compareColor }}>{formatValue(compareData[hoverIdx])}</span>
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