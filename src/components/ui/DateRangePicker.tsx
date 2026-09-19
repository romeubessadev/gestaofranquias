import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Seletor de intervalo de datas (DateRangePicker) — extraído do markup já
 * validado visualmente em src/pages/forms/DatePickersPage.tsx (calendário
 * mensal + input de range + quick ranges), mas agora como componente
 * CONTROLADO e com datas reais (Date), não hardcoded em "July 2026".
 *
 * Uso principal: filtro de Período das telas do Dashboard. Composto só com
 * primitivos (sem dependência externa de calendário). Estilo idêntico ao do
 * tema Vela (border-acc/bg-acc-soft quando ativo, bg-bg-inset no input).
 *
 * - value: [inicio, fim] | null  →  null = sem seleção
 * - onChange: dispara ao fechar um intervalo válido (inicio <= fim)
 * - quickRanges: atalhos pré-definidos (Hoje, Últimos 7 dias, etc.)
 *
 * Painel em portal no `document.body` (position:fixed), alinhado à direita
 * do trigger e limitado à viewport — evita corte pelo overflow-x-hidden /
 * animações com transform dos ancestrais do layout.
 */

export type DateRange = [Date, Date];

export interface QuickRange {
  label: string;
  /** Resolve o intervalo [inicio, fim] a partir de "hoje" (data base). */
  resolve: (hoje: Date) => DateRange;
}

/** Atalhos padrão em português, alinhados ao negócio (filtro de período). */
export const QUICK_RANGES_PADRAO: QuickRange[] = [
  { label: "Hoje", resolve: (h) => [zeraHora(h), zeraHora(h)] },
  { label: "Ontem", resolve: (h) => [addDias(zeraHora(h), -1), addDias(zeraHora(h), -1)] },
  { label: "Últimos 7 dias", resolve: (h) => [addDias(zeraHora(h), -6), zeraHora(h)] },
  { label: "Últimos 30 dias", resolve: (h) => [addDias(zeraHora(h), -29), zeraHora(h)] },
  { label: "Este mês", resolve: (h) => [new Date(h.getFullYear(), h.getMonth(), 1), zeraHora(h)] },
  { label: "Mês passado", resolve: (h) => [new Date(h.getFullYear(), h.getMonth() - 1, 1), new Date(h.getFullYear(), h.getMonth(), 0)] },
];

const DOW_PT = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function zeraHora(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function mesmoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatarCurto(d: Date): string {
  return `${d.getDate()} ${MESES_CURTO[d.getMonth()]}`;
}

function formatarIntervalo(r: DateRange): string {
  const [a, b] = r;
  return mesmoDia(a, b) ? formatarCurto(a) : `${formatarCurto(a)} – ${formatarCurto(b)}`;
}

export function DateRangePicker({
  value,
  onChange,
  quickRanges = QUICK_RANGES_PADRAO,
  className,
  size = "md",
}: {
  value: DateRange | null;
  onChange: (r: DateRange) => void;
  quickRanges?: QuickRange[];
  className?: string;
  /** Alinha ao Button: sm = h-8 (ações do PageHeader), md = h-10. */
  size?: "sm" | "md";
}) {
  const hoje = useMemo(() => zeraHora(new Date()), []);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => (value ? new Date(value[0].getFullYear(), value[0].getMonth(), 1) : new Date(hoje.getFullYear(), hoje.getMonth(), 1)));
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPanelPos(null);
      return;
    }

    function colocar() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const margem = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(vw - margem * 2, 640);
      // Alinha a direita do painel à direita do trigger; empurra pra dentro se passar.
      let left = rect.right - width;
      if (left < margem) left = margem;
      if (left + width > vw - margem) left = Math.max(margem, vw - margem - width);
      const top = Math.min(rect.bottom + 8, vh - margem - 80);
      const maxHeight = Math.max(200, vh - top - margem);
      setPanelPos({ top, left, width, maxHeight });
    }

    colocar();
    window.addEventListener("resize", colocar);
    window.addEventListener("scroll", colocar, true);
    return () => {
      window.removeEventListener("resize", colocar);
      window.removeEventListener("scroll", colocar, true);
    };
  }, [open]);

  const cells = useMemo(() => {
    const offset = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const arr: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    return arr;
  }, [viewMonth]);

  function escolherDia(dia: Date) {
    if (!draftStart || draftStart > dia) {
      setDraftStart(dia);
      return;
    }
    const range: DateRange = [draftStart, dia];
    onChange(range);
    setDraftStart(null);
    setOpen(false);
  }

  function aplicarQuick(qr: QuickRange) {
    const range = qr.resolve(hoje);
    onChange(range);
    setDraftStart(null);
    setViewMonth(new Date(range[0].getFullYear(), range[0].getMonth(), 1));
    setOpen(false);
  }

  function ehSelecionado(dia: Date): boolean {
    if (draftStart && mesmoDia(draftStart, dia)) return true;
    if (value) return mesmoDia(value[0], dia) || mesmoDia(value[1], dia);
    return false;
  }

  function ehDentro(dia: Date): boolean {
    const lo = draftStart ?? (value ? value[0] : dia);
    const hi = value ? value[1] : dia;
    if (!draftStart && value) return dia > value[0] && dia < value[1];
    if (draftStart) return false;
    return dia > lo && dia < hi;
  }

  const rotulo = value ? formatarIntervalo(value) : "Período personalizado";

  const painel =
    open && panelPos
      ? createPortal(
          <div
            ref={panelRef}
            style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width, maxHeight: panelPos.maxHeight }}
            className="fixed z-[80] flex flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-[14px] border border-line bg-bg-2 p-4 shadow-[var(--shadow-vela)] sm:flex-row"
          >
            <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:w-[150px] sm:flex-col sm:flex-nowrap">
              <span className="mb-0.5 hidden text-[11px] font-bold uppercase tracking-wide text-t2 sm:block">Períodos</span>
              {quickRanges.map((qr) => (
                <button
                  key={qr.label}
                  type="button"
                  onClick={() => aplicarQuick(qr)}
                  className="h-8 rounded-[9px] border border-line px-3 text-left text-xs font-semibold text-t1 transition-colors hover:border-acc hover:text-acc"
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  aria-label="Mês anterior"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-line text-t1 hover:bg-bg-3"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span className="text-sm font-bold text-t0">
                  {MESES_PT[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  aria-label="Próximo mês"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-line text-t1 hover:bg-bg-3"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="mb-1.5 grid grid-cols-7 gap-1">
                {DOW_PT.map((d, i) => (
                  <span key={`${d}-${i}`} className="py-1 text-center text-[10.5px] font-bold text-t2">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((dia, i) =>
                  dia === null ? (
                    <span key={`e${i}`} />
                  ) : (
                    <button
                      key={dia.toISOString()}
                      type="button"
                      onClick={() => escolherDia(dia)}
                      className={cn(
                        "flex h-9 min-w-0 items-center justify-center rounded-[9px] text-[12.5px] font-semibold transition-colors",
                        ehSelecionado(dia) ? "bg-acc text-white" : ehDentro(dia) ? "bg-acc-soft text-acc" : "text-t1 hover:bg-bg-3",
                      )}
                    >
                      {dia.getDate()}
                    </button>
                  ),
                )}
              </div>

              <p className="mt-3 text-[11px] text-t2">{draftStart ? "Agora selecione o último dia." : "Selecione o primeiro e o último dia."}</p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={triggerRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex min-w-0 items-center rounded-[var(--radius-vela-sm)] border bg-bg-3 text-left transition-colors",
          size === "sm" ? "h-8 gap-2 px-3" : "h-10 gap-2.5 px-3.5",
          open ? "border-acc" : "border-line hover:border-acc",
        )}
      >
        <svg width={size === "sm" ? 14 : 15} height={size === "sm" ? 14 : 15} viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={cn("min-w-0 truncate font-semibold", size === "sm" ? "text-xs" : "text-[13.5px]", value ? "text-t0" : "text-t2")}>{rotulo}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 text-t2 transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {painel}
    </div>
  );
}
