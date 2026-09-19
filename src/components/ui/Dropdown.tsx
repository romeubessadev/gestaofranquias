import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  /** Destaca a opção selecionada (bg-acc-soft + texto acc). */
  active?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-2 min-w-[190px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 p-1.5 shadow-[var(--shadow-vela)] animate-vela-pop",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1.5 h-px bg-line" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium",
                  item.active ? "bg-acc-soft text-acc" : item.danger ? "text-bad hover:bg-bg-3" : "text-t0 hover:bg-bg-3",
                )}
              >
                {item.icon}
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
