import { useMemo, useState } from "react";

export type ClasseAbc = "A" | "B" | "C";

export interface AbcParetoDatum {
  label: string;
  value: number;
  pctAcumulado: number;
  classe: ClasseAbc;
}

const CORES_CLASSE: Record<ClasseAbc, string> = {
  A: "var(--bad)",
  B: "var(--warn)",
  C: "var(--ok)",
};

const COR_ACUM = "var(--acc)";

/** Largura lógica do viewBox — o SVG escala fluidamente. */
const VB_W = 560;
const PAD_L = 48;
const PAD_R = 52;
const PAD_T = 20;
const PAD_B = 56;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const n = v / base;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * base;
}

export function AbcParetoChart({
  data,
  height = 240,
  formatValue = (v: number) => String(v),
  showValues = true,
}: {
  data: AbcParetoDatum[];
  height?: number;
  formatValue?: (v: number) => string;
  showValues?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const chartW = VB_W - PAD_L - PAD_R;
  const chartH = height - PAD_T - PAD_B;
  const n = data.length;
  const gap = 0.28;
  const barSlot = n > 0 ? chartW / n : chartW;
  const barW = barSlot * (1 - gap);

  const { maxVal, ticksY, ticksPct } = useMemo(() => {
    const mx = niceMax(Math.max(...data.map((d) => d.value), 1));
    const step = mx / 5;
    const ticksY = Array.from({ length: 6 }, (_, i) => i * step);
    const ticksPct = [0, 20, 40, 60, 80, 100];
    return { maxVal: mx, ticksY, ticksPct };
  }, [data]);

  const bars = data.map((d, i) => {
    const x = PAD_L + i * barSlot + (barSlot - barW) / 2;
    const h = (d.value / maxVal) * chartH;
    const y = PAD_T + chartH - h;
    const cx = x + barW / 2;
    const cyAcum = PAD_T + chartH * (1 - d.pctAcumulado / 100);
    return { ...d, x, y, h, cx, cyAcum, i };
  });

  const linePath =
    bars.length === 0
      ? ""
      : bars.map((b, i) => `${i === 0 ? "M" : "L"} ${b.cx.toFixed(1)} ${b.cyAcum.toFixed(1)}`).join(" ");

  const y80 = PAD_T + chartH * (1 - 0.8);
  const y95 = PAD_T + chartH * (1 - 0.95);

  const minW = Math.max(VB_W, n * 52);

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
      <div className="relative" style={{ minWidth: minW }}>
        <svg
          viewBox={`0 0 ${VB_W} ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="xMidYMid meet"
          className="block select-none"
          onMouseLeave={() => setHover(null)}
        >
          {/* Grid + eixos Y */}
          {ticksY.map((t) => {
            const y = PAD_T + chartH * (1 - t / maxVal);
            return (
              <g key={`y-${t}`}>
                <line x1={PAD_L} y1={y} x2={VB_W - PAD_R} y2={y} stroke="var(--line)" strokeDasharray="3 4" strokeWidth={1} />
                <text x={PAD_L - 6} y={y + 3} textAnchor="end" className="fill-t2" style={{ fontSize: 9, fontWeight: 600 }}>
                  {formatValue(t)}
                </text>
              </g>
            );
          })}
          {ticksPct.map((t) => {
            const y = PAD_T + chartH * (1 - t / 100);
            return (
              <text key={`p-${t}`} x={VB_W - PAD_R + 6} y={y + 3} textAnchor="start" style={{ fontSize: 9, fontWeight: 600, fill: COR_ACUM }}>
                {t}%
              </text>
            );
          })}

          {/* Cortes 80% / 95% */}
          <line x1={PAD_L} y1={y80} x2={VB_W - PAD_R} y2={y80} stroke="var(--bad)" strokeDasharray="5 4" strokeWidth={1.25} opacity={0.85} />
          <text x={VB_W - PAD_R - 2} y={y80 - 4} textAnchor="end" style={{ fontSize: 9, fontWeight: 700, fill: "var(--bad)" }}>
            80% — Classe A
          </text>
          <line x1={PAD_L} y1={y95} x2={VB_W - PAD_R} y2={y95} stroke="var(--warn)" strokeDasharray="5 4" strokeWidth={1.25} opacity={0.85} />
          <text x={VB_W - PAD_R - 2} y={y95 - 4} textAnchor="end" style={{ fontSize: 9, fontWeight: 700, fill: "var(--warn)" }}>
            95% — Classe B
          </text>

          {/* Barras */}
          {bars.map((b) => (
            <g key={b.label} onMouseEnter={() => setHover(b.i)} style={{ cursor: "default" }}>
              <rect
                x={b.x}
                y={b.y}
                width={barW}
                height={Math.max(b.h, 2)}
                rx={4}
                fill={CORES_CLASSE[b.classe]}
                opacity={hover === null || hover === b.i ? 1 : 0.45}
                style={{
                  transformOrigin: `${b.cx}px ${PAD_T + chartH}px`,
                  animation: `velaGrowY .55s cubic-bezier(.22,.61,.36,1) ${b.i * 0.04}s both`,
                }}
              />
              {showValues && b.h > 14 && (
                <text
                  x={b.cx}
                  y={b.y - 4}
                  textAnchor="middle"
                  className="fill-t0"
                  style={{ fontSize: 9, fontWeight: 800 }}
                >
                  {formatValue(b.value)}
                </text>
              )}
              <text
                x={b.cx}
                y={PAD_T + chartH + 12}
                textAnchor="end"
                className="fill-t2"
                transform={`rotate(-40 ${b.cx} ${PAD_T + chartH + 12})`}
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                {b.label.length > 14 ? `${b.label.slice(0, 13)}…` : b.label}
              </text>
            </g>
          ))}

          {/* Linha % acumulado */}
          {linePath && (
            <path d={linePath} fill="none" stroke={COR_ACUM} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {bars.map((b) => (
            <circle
              key={`dot-${b.label}`}
              cx={b.cx}
              cy={b.cyAcum}
              r={hover === b.i ? 4.5 : 3.2}
              fill={COR_ACUM}
              stroke="var(--bg-card, #fff)"
              strokeWidth={1.5}
            />
          ))}

          {/* Labels eixos */}
          <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" className="fill-t2" transform={`rotate(-90 12 ${PAD_T + chartH / 2})`} style={{ fontSize: 9, fontWeight: 700 }}>
            Receita (R$)
          </text>
          <text
            x={VB_W - 10}
            y={PAD_T + chartH / 2}
            textAnchor="middle"
            style={{ fontSize: 9, fontWeight: 700, fill: COR_ACUM }}
            transform={`rotate(90 ${VB_W - 10} ${PAD_T + chartH / 2})`}
          >
            % Acumulado
          </text>
        </svg>

        {hover !== null && bars[hover] && (
          <div
            className="pointer-events-none absolute z-10 rounded-[10px] border border-line bg-bg-card px-2.5 py-1.5 text-[11px] shadow-sm"
            style={{
              left: `${(bars[hover].cx / VB_W) * 100}%`,
              top: 8,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold text-t0">{bars[hover].label}</div>
            <div className="text-t1">
              {formatValue(bars[hover].value)} · Classe {bars[hover].classe} · acum. {bars[hover].pctAcumulado.toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { CORES_CLASSE };
