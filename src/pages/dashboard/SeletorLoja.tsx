import { useState, useRef, useEffect } from "react";
import type { Filial } from "@/data/gestao/filiais";
import type { Escopo } from "@/data/gestao/dashboard";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Seletor de loja SINGLE-SELECT — Topbar (no lugar de "Buscar telas" no Dashboard).
 * Padrão Vela "Select with avatars": loja = Avatar + fantasia + CNPJ;
 * "Todas as lojas" = sem avatar (visão consolidada da rede).
 * Escopo: `filialIds: []` = todas; `[id]` = uma loja.
 */
export function SeletorLoja({ escopo, onChange, minhas }: { escopo: Escopo; onChange: (e: Escopo) => void; minhas: Filial[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const ehTodas = escopo.filialIds.length === 0;
  const filialAtual = ehTodas ? null : minhas.find((f) => f.id === escopo.filialIds[0]) ?? null;

  function escolher(id: string | null) {
    onChange({ ...escopo, filialIds: id ? [id] : [] });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full min-w-0 items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3 text-left transition-colors hover:border-acc"
      >
        {filialAtual ? (
          <Avatar name={filialAtual.fantasia} size="sm" />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-3 text-t2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-t0">
            {filialAtual ? filialAtual.fantasia : "Todas as lojas"}
          </p>
          <p className="truncate text-[11px] text-t2">
            {filialAtual ? filialAtual.cnpj : "Rede consolidada"}
          </p>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0 transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[260px] rounded-[12px] border border-line bg-bg-2 p-1.5 shadow-[var(--shadow-vela)]">
          <button
            type="button"
            onClick={() => escolher(null)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left transition-colors",
              ehTodas ? "bg-acc-soft" : "hover:bg-bg-3",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-3 text-t2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-[13px] font-bold", ehTodas ? "text-acc" : "text-t0")}>Todas as lojas</p>
              <p className="truncate text-[11px] text-t2">Rede consolidada</p>
            </div>
            {ehTodas && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div className="my-1 h-px bg-line" />

          {minhas.map((f) => {
            const ativa = !ehTodas && filialAtual?.id === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => escolher(f.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left transition-colors",
                  ativa ? "bg-acc-soft" : "hover:bg-bg-3",
                )}
              >
                <Avatar name={f.fantasia} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[13px] font-bold", ativa ? "text-acc" : "text-t0")}>{f.fantasia}</p>
                  <p className="truncate text-[11px] text-t2">{f.cnpj}</p>
                </div>
                {ativa && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
