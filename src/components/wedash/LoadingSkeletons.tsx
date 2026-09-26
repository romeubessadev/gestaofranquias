import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Linhas de lista/tabela: avatar + nome + detalhe + coluna à direita. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-line py-3.5 first:border-t-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-2 h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function ChartCardSkeleton({ short = false }: { short?: boolean }) {
  return (
    <Card>
      <Skeleton className="mb-2 h-4 w-40" />
      <Skeleton className="mb-5 h-3 w-24" />
      <Skeleton className={cn("w-full rounded-xl", short ? "h-[180px]" : "h-[220px]")} />
    </Card>
  );
}

/** 1ª carga das telas do Dashboard: KPIs + pares de gráficos + tabela. */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="flex items-center gap-3.5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-[12px]" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2.5 h-3 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCardSkeleton short />
        <ChartCardSkeleton short />
      </div>
      <Card className="mt-4">
        <Skeleton className="mb-3 h-4 w-40" />
        <SkeletonRows rows={4} />
      </Card>
    </div>
  );
}

/** Grade de cards (Configurações > Lojas / Integrações). */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-[46px] w-[46px] shrink-0 rounded-[13px]" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2 h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }, (_, j) => (
                <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-bg-2" />
              ))}
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Cards de formulário empilhados (detalhe da loja). */
export function FormCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-5" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: cards }, (_, i) => (
        <Card key={i}>
          <Skeleton className="mb-5 h-4 w-36" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, j) => (
              <div key={j}>
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-[var(--radius-vela-sm)]" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
