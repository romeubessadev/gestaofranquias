import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui";
import type { Filial } from "@/data/gestao/filiais";
import type { Escopo } from "@/data/gestao/dashboard";
import { cn } from "@/lib/cn";

/**
 * Seletor de loja MULTI-SELECT — mora na barra do topo, no lugar do
 * "Buscar telas" quando o Dashboard está aberto. Permite escolher 1 loja,
 * várias lojas, ou "Todas as lojas" (array vazio = consolida a rede).
 *
 * Composto com componentes Vela existentes: Popover-like dropdown manual
 * (o Dropdown do Vela é só de menu simples) + Checkbox. Estilo inspirado
 * na referencia lojas.png (lista com avatar/color + check na ativa).
 */
export function SeletorLoja({ escopo, onChange, minhas }: { escopo: Escopo; onChange: (e: Escopo) => void; minhas: Filial[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selecionadas = escopo.filialIds; // [] = todas
  const ehTodas = selecionadas.length === 0;
  const rotulo = ehTodas ? "Todas as lojas" : selecionadas.length === 1 ? minhas.find((f) => f.id === selecionadas[0])?.fantasia ?? "1 loja" : `${selecionadas.length} lojas`;

  function toggle(id: string) {
    const ja = selecionadas.includes(id);
    const proximas = ja ? selecionadas.filter((x) => x !== id) : [...selecionadas, id];
    onChange({ ...escopo, filialIds: proximas });
  }

  function selecionarTodas() {
    onChange({ ...escopo, filialIds: [] });
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full min-w-0 items-center gap-2 rounded-[11px] border border-line bg-bg-inset px-3 text-left text-t0 hover:border-acc"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-t2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{rotulo}</span>
        {!ehTodas && (
          <span className="shrink-0 rounded-md bg-acc-soft px-1.5 py-0.5 text-[10px] font-bold text-acc">{selecionadas.length}</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 text-t2 transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px] rounded-[12px] border border-line bg-bg-2 p-1.5 shadow-[var(--shadow-vela)]">
          <button
            onClick={selecionarTodas}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-semibold transition-colors",
              ehTodas ? "bg-acc-soft text-acc" : "text-t1 hover:bg-bg-3",
            )}
          >
            <span className={cn("flex h-4 w-4 items-center justify-center rounded-[5px] border", ehTodas ? "border-acc bg-acc text-white" : "border-line")}>
              {ehTodas && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-t2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Todas as lojas
          </button>

          <div className="my-1 h-px bg-line" />

          {minhas.map((f) => {
            const ativa = selecionadas.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[12.5px] font-semibold transition-colors",
                  ativa ? "bg-acc-soft text-acc" : "text-t1 hover:bg-bg-3",
                )}
              >
                <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border", ativa ? "border-acc bg-acc text-white" : "border-line")}>
                  {ativa && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acc-soft text-[11px] font-bold text-acc">
                  {f.fantasia.charAt(0)}
                </span>
                <span className="min-w-0 flex-1 truncate">{f.fantasia}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}