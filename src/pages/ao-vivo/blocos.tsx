import { Avatar, Card, CardTitle, EmptyState, ProgressBar } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { brlK, num } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { TrophyIcon } from "@/pages/dashboards/icons";
import type { AoVivoView, RankingLinha } from "@/data/gestao/aoVivo";
import type { VendedoraLinha } from "@/data/gestao/equipeVisoes";

/** Medalhas do leaderboard Vela (SalesDashboard / CRM) — anel, troféu e rótulos. */
const MEDALHA = {
  1: { cor: "#f7b84e", glow: "0 0 32px rgba(247,184,78,0.4)" },
  2: { cor: "#c7cdd6", glow: "none" },
  3: { cor: "#d99a5c", glow: "none" },
} as const;

const PODIO_ALTURA: Record<1 | 2 | 3, string> = {
  1: "h-44 sm:h-48",
  2: "h-36 sm:h-40",
  3: "h-28 sm:h-32",
};

/** Ordem visual do pódio: 2º | 1º | 3º */
const PODIO_ORDEM = [1, 0, 2] as const;

/** Pódio top 3 — aba Ranking (ouro / prata / bronze; degrau na cor primária). */
export function BlocoRanking({ ranking }: { ranking: RankingLinha[] }) {
  if (ranking.length === 0) {
    return (
      <EmptyState
        title="Nenhuma venda no mês"
        description="Lance vendas para ver o ranking ao vivo da competência."
      />
    );
  }

  const top3 = ranking.slice(0, 3);
  const slots = PODIO_ORDEM.map((i) => top3[i]).filter((l): l is RankingLinha => Boolean(l));

  return (
    <div className="flex items-end justify-center gap-2.5 pt-3 sm:gap-6">
      {slots.map((l) => {
        const pos = Math.min(3, Math.max(1, l.posicao)) as 1 | 2 | 3;
        const medal = MEDALHA[pos];
        const isOuro = pos === 1;
        return (
          <div
            key={l.colaboradorId}
            className={cn(
              "flex flex-col items-center text-center",
              isOuro ? "w-[34%] max-w-[168px]" : "w-[30%] max-w-[148px]",
            )}
          >
            <div className="relative mb-2.5">
              <span
                className="relative inline-flex rounded-full"
                style={{
                  boxShadow: `0 0 0 3px ${medal.cor}${isOuro ? `, ${medal.glow}` : ""}`,
                }}
              >
                <Avatar size={isOuro ? "2xl" : "xl"} name={l.nome} />
              </span>
              <span
                className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-2"
                style={{ background: medal.cor, color: "#1a1228" }}
                aria-hidden
              >
                <TrophyIcon size={14} />
              </span>
            </div>

            <p className="truncate text-[13px] font-bold text-t0 sm:text-[14px]">{l.nome.split(" ")[0]}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-t2">{num(l.vendas)} vendas</p>
            <p className="mt-0.5 font-mono text-[13px] font-extrabold sm:text-[14px]" style={{ color: medal.cor }}>
              {brlK(l.faturamento)}
            </p>

            <div
              className={cn(
                "mt-3 flex w-full items-end justify-center rounded-t-2xl",
                PODIO_ALTURA[pos],
              )}
              style={{
                background: "color-mix(in srgb, var(--acc) 48%, transparent)",
                boxShadow: isOuro ? "0 8px 28px color-mix(in srgb, var(--acc) 35%, transparent)" : undefined,
              }}
            >
              <span
                className="pb-3 text-[24px] font-extrabold leading-none sm:text-[28px]"
                style={{ color: medal.cor }}
              >
                {pos}º
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Lista completa — mesmo padrão do Top Vendedoras (Visão Geral). */
export function BlocoRankingGeral({
  ranking,
  vendedoras,
}: {
  ranking: RankingLinha[];
  vendedoras?: VendedoraLinha[] | null;
}) {
  if (ranking.length === 0) {
    return (
      <EmptyState
        title="Nenhuma venda no mês"
        description="Lance vendas para ver o ranking geral da competência."
      />
    );
  }

  const metaPorId = new Map((vendedoras ?? []).map((v) => [v.colaboradorId, v]));

  return (
    <div className="flex flex-col gap-4">
      {ranking.map((l) => {
        const medal = l.posicao <= 3 ? MEDALHA[l.posicao as 1 | 2 | 3] : null;
        const eq = metaPorId.get(l.colaboradorId);
        const pct = eq?.atingimentoPct ?? 0;
        const ticket = eq?.ticketValor ?? (l.vendas > 0 ? l.faturamento / l.vendas : 0);
        const barra = Math.min(100, pct);
        return (
          <div key={l.colaboradorId} className="flex items-center gap-3">
            <span
              className="w-5 text-center text-sm font-extrabold"
              style={{ color: medal?.cor ?? "var(--t1)" }}
            >
              {l.posicao}
            </span>
            <Avatar name={l.nome} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-bold text-t0">{l.nome}</span>
                <span className="shrink-0 font-mono text-[13px] font-extrabold text-ok">{brlK(l.faturamento)}</span>
              </div>
              <ProgressBar value={barra} height={5} />
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-t2">
                <span>{num(l.vendas)} vendas</span>
                {ticket > 0 && (
                  <>
                    <span>·</span>
                    <span>Ticket {brlK(ticket)}</span>
                  </>
                )}
                {eq && eq.metaIndividualValor > 0 && (
                  <>
                    <span>·</span>
                    <span className={pct >= 100 ? "font-semibold text-ok" : ""}>
                      {Math.round(pct)}% da meta
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BlocoEvolucao({ view }: { view: AoVivoView }) {
  if (view.evolucao.length === 0) return null;
  const cores = ["var(--acc)", "var(--ok)", "var(--warn)", "var(--info)"];
  return (
    <Card padding="lg">
      <CardTitle>Evolução por Vendedor</CardTitle>
      <p className="mt-1 text-[12px] text-t2">Últimos meses da competência (histórico).</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
              <th className="px-1 pb-2 text-left font-bold">Vendedor</th>
              {view.evolucaoMeses.map((m) => (
                <th key={m} className="px-1 pb-2 text-right font-bold">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.evolucao.map((l) => (
              <tr key={l.colaboradorId} className="border-b border-line/60 last:border-0">
                <td className="py-2 pl-1 font-semibold text-t0">{l.nome}</td>
                {l.valores.map((v, i) => (
                  <td key={i} className="py-2 text-right font-mono text-[12px] font-bold text-t1">
                    {v == null ? "—" : brlK(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <AreaLineChart
          data={view.evolucao[0]?.valores.map((v) => v ?? 0) ?? []}
          compareData={view.evolucao[1]?.valores.map((v) => v ?? 0)}
          labels={view.evolucaoMeses}
          color={cores[0]}
          compareColor={cores[1]}
          formatValue={brlK}
          showAxisLabels
        />
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-t2">
          {view.evolucao.slice(0, 2).map((l, i) => (
            <span key={l.colaboradorId} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[3px]" style={{ background: cores[i] }} />
              {l.nome}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function BlocoIaInsights({ texto, onGerar }: { texto: string | null; onGerar: () => void }) {
  return (
    <Card padding="lg" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <CardTitle>IA de Insights Automáticos</CardTitle>
        <p className="mt-1 text-[12.5px] text-t2">
          {texto ?? "Clique em Gerar Insights para receber uma análise da performance da equipe (mock)."}
        </p>
      </div>
      <button
        type="button"
        onClick={onGerar}
        className="h-9 shrink-0 rounded-[10px] bg-acc px-4 text-[12.5px] font-bold text-white hover:opacity-90"
      >
        Gerar Insights
      </button>
    </Card>
  );
}
