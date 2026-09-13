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

/**
 * Barras de realizado + bolinha de meta por período com tooltip.
 * Meta variável por barra. Linha tracejada SVG conectando bolinhas.
 * Tooltip renderizado como overlay no container raiz — sem piscada, sem corte, sem bug de 1º clique.
 * Posicionamento 100% matemático (sem medição pós-render).
 */
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
  // Paddings internos do gráfico
  const padX = 12; // padding lateral para dots não serem cortados
  const topPad = 18; // espaço para valor acima da barra
  const botPad = 20; // espaço para label abaixo
  const chartH = height - topPad - botPad;

  // Posições das bolinhas para a linha tracejada SVG (em % do viewBox 0..100)
  const goalPoints = data.map((d, i) => {
    const n = data.length;
    // Centro de cada coluna em % — mesma lógica do flex com gap
    const x = n <= 1 ? 50 : ((i + 0.5) / n) * 100;
    const y = d.goal > 0 ? 100 - (d.goal / maxVal) * 100 : 100;
    return { x, y };
  });

  // Posição do tooltip: calculada matematicamente a partir do índice
  // X = centro da coluna i em % do container
  // Y = posição da bolinha de meta
  const getTooltipPos = (idx: number) => {
    const n = data.length;
    const xPct = n <= 1 ? 50 : ((idx + 0.5) / n) * 100;
    const d = data[idx];
    const goalPct = (d.goal / maxVal) * 100;
    // Y em px a partir do topo do container
    const dotYFromTop = topPad + chartH * (1 - goalPct / 100);
    // Tooltip acima da bolinha por padrão
    let top = dotYFromTop - 58; // ~58px é a altura estimada do tooltip
    let flipBelow = false;
    if (top < 2) {
      // Não cabe acima → coloca abaixo da bolinha
      top = dotYFromTop + 14;
      flipBelow = true;
    }
    // X: clamp para não sair das bordas
    // Tooltip tem ~140px de largura estimada
    const tipHalfW = 70;
    const containerW = needsScroll ? n * minBarWidth : 320; // estimativa
    let leftPx = (xPct / 100) * containerW;
    let translateX = "-50%";
    if (leftPx - tipHalfW < padX) {
      leftPx = padX;
      translateX = "0";
    } else if (leftPx + tipHalfW > containerW - padX) {
      leftPx = containerW - padX;
      translateX = "-100%";
    }
    return { top, left: `${(leftPx / containerW) * 100}%`, translateX, flipBelow };
  };

  return (
    <div className="relative overflow-x-auto -mx-1 px-1" style={{ minHeight: height + 4 }}>
      {/* Backdrop para fechar tooltip ao clicar fora */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-20" onClick={() => setActiveIdx(null)} />
      )}

      <div
        className="relative flex items-stretch gap-2 sm:gap-3"
        style={{ height, minWidth: needsScroll ? data.length * minBarWidth : undefined, paddingLeft: padX, paddingRight: padX }}
      >
        {/* SVG overlay: linha tracejada conectando as bolinhas de meta */}
        {data.length > 1 && data.some((d) => d.goal > 0) && (
          <svg
            className="pointer-events-none absolute z-10"
            style={{ top: topPad, left: padX, right: padX, height: chartH }}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polyline
              points={goalPoints.filter((_, i) => data[i].goal > 0).map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={goalColor}
              strokeWidth="0.8"
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

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
                {/* Bolinha da meta — clicável */}
                {d.goal > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(activeIdx === i ? null : i); }}
                    className="absolute left-1/2 z-20 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
                    style={{
                      bottom: `calc(${goalPct}% - 10px)`,
                      borderColor: goalColor,
                      background: achieved ? "var(--ok)" : "var(--bg-3)",
                    }}
                    aria-label={`Meta: ${formatValue(d.goal)}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: achieved ? "#fff" : goalColor }} />
                  </button>
                )}
              </div>
              {/* Label do eixo X */}
              <span className="truncate text-[9px] font-semibold text-t2 sm:text-[10px]">{d.label}</span>
            </div>
          );
        })}
      </div>

      {/* Tooltip como overlay absoluto no container raiz — fora do fluxo das barras */}
      {activeIdx !== null && data[activeIdx]?.goal > 0 && (() => {
        const d = data[activeIdx];
        const achieved = d.goal > 0 && d.value >= d.goal;
        const pos = getTooltipPos(activeIdx);
        return (
          <div
            className="pointer-events-none absolute z-30 whitespace-nowrap rounded-lg border border-line bg-bg-3 px-3 py-2 text-[10px] shadow-xl"
            style={{
              top: pos.top,
              left: pos.left,
              transform: `translateX(${pos.translateX})`,
            }}
          >
            <p className="font-bold text-t0">{d.label}</p>
            <p className="mt-0.5 text-t1">Realizado: <span className="font-bold text-ok">{formatValue(d.value)}</span></p>
            <p className="text-t1">Meta: <span className="font-bold" style={{ color: goalColor }}>{formatValue(d.goal)}</span></p>
            <p className="mt-0.5 text-t2">{achieved ? "✅ Atingida" : `Faltam ${formatValue(Math.max(0, d.goal - d.value))}`}</p>
          </div>
        );
      })()}
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
