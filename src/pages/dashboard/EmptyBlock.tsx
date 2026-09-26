import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Vazio padrão dos cards do Dashboard: ocupa o espaço do gráfico/tabela e centraliza o aviso.
 *  O card precisa ser `flex flex-col` para o bloco preencher a altura da linha da grade. */
export function EmptyBlock({
  children = "Sem dados no período selecionado.",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2.5 px-4 text-center", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-inset text-t2" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 16v-3M12 16V9M17 16v-6" />
        </svg>
      </span>
      <p className="text-[12.5px] text-t2">{children}</p>
    </div>
  );
}
