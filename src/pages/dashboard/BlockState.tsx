import type { ReactNode } from "react";
import { EmptyState, Skeleton } from "@/components/ui";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";

const ROTULO_ESTADO: Record<Exclude<EstadoBlocoTipo, "disponivel">, string> = {
  carregando: "Carregando dados…",
  sem_dados: "Sem dados no período selecionado.",
  indisponivel: "Bloco indisponível no momento",
};

/** Skeleton / empty / conteúdo conforme o estado do bloco. */
export function EstadoBloco({ estado, children }: { estado: EstadoBlocoTipo; children: ReactNode }) {
  if (estado === "disponivel") return <>{children}</>;
  if (estado === "carregando") {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  return (
    <EmptyState
      icon="📭"
      title={ROTULO_ESTADO[estado]}
      description={estado === "sem_dados" ? "Não existem vendas para o período selecionado." : "Tente outro período ou consulte a equipe de TI."}
    />
  );
}
