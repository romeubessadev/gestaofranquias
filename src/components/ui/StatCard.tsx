import type { ReactNode } from "react";
import { Card } from "./Card";
import { AnimatedNumber } from "./AnimatedNumber";
import { Tooltip } from "./Tooltip";
import { cn } from "@/lib/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: string;
  iconBg?: string;
  delta?: { value: string; positive: boolean };
  sparkline?: ReactNode;
  /** Texto secundário abaixo do valor (ex.: "1.665 vendas · 2.495 itens"). */
  sub?: string;
  /** Tooltip exibido ao passar o mouse no ⓘ ao lado do label. */
  tooltip?: string;
  className?: string;
}

export function StatCard({ label, value, icon, iconColor = "var(--acc)", iconBg = "var(--acc-soft)", delta, sparkline, sub, tooltip, className }: StatCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold",
              delta.positive ? "text-ok bg-ok-soft" : "text-bad bg-bad-soft",
            )}
          >
            {delta.positive ? "↗" : "↘"} {delta.value}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <p className="truncate text-xs font-medium text-t1">{label}</p>
        {tooltip && (
          <Tooltip label={tooltip}>
            <span className="inline-flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-line text-[8px] font-bold leading-none text-t2">
              ⓘ
            </span>
          </Tooltip>
        )}
      </div>
      <AnimatedNumber value={value} className="mt-1 block truncate text-2xl font-extrabold text-t0" />
      {sub && <p className="mt-0.5 truncate text-[11px] text-t2">{sub}</p>}
      {sparkline && <div className="mt-3 h-9">{sparkline}</div>}
    </Card>
  );
}
