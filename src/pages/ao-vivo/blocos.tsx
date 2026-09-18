import { Avatar, Card, CardTitle, EmptyState } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { brl, brlK, num } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { AoVivoView, RankingLinha } from "@/data/gestao/aoVivo";

const PODIO_ALTURA = ["h-28", "h-36", "h-24"];
const PODIO_ORDEM = [1, 0, 2]; // visual: 2º | 1º | 3º

/** Pódio top 3 — aba Ranking do card principal. */
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
  if (top3.length < 3) {
    return (
      <EmptyState
        title="Pódio incompleto"
        description="É preciso pelo menos 3 vendedores com venda no mês para montar o pódio."
      />
    );
  }

  const podiumSlots = PODIO_ORDEM.map((i) => top3[i]).filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {podiumSlots.map((l) => {
        const idx = top3.indexOf(l);
        return (
          <div key={l.colaboradorId} className="flex w-[28%] max-w-[140px] flex-col items-center text-center">
            <Avatar size="lg" name={l.nome} />
            <p className="mt-2 truncate text-[13px] font-bold text-t0">{l.nome.split(" ")[0]}</p>
            <p className="text-[11px] font-semibold text-t2">
              {num(l.vendas)} vendas · {brlK(l.faturamento)}
            </p>
            <div
              className={cn(
                "mt-3 flex w-full items-end justify-center rounded-t-xl border border-line bg-bg-inset font-extrabold text-acc",
                PODIO_ALTURA[idx] ?? "h-20",
              )}
            >
              <span className="pb-3 text-lg">{l.posicao}º</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Lista completa — card separado abaixo do principal. */
export function BlocoRankingGeral({ ranking }: { ranking: RankingLinha[] }) {
  if (ranking.length === 0) {
    return (
      <EmptyState
        title="Nenhuma venda no mês"
        description="Lance vendas para ver o ranking geral da competência."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
            <th className="px-1 pb-2 text-left font-bold">#</th>
            <th className="px-1 pb-2 text-left font-bold">Vendedor</th>
            <th className="px-1 pb-2 text-right font-bold">Vendas</th>
            <th className="px-1 pb-2 text-right font-bold">Faturamento</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((l) => (
            <tr key={l.colaboradorId} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 pl-1 pr-2 font-mono text-[12.5px] font-bold text-t2">{l.posicao}º</td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <Avatar size="sm" name={l.nome} />
                  <span className="font-semibold text-t0">{l.nome}</span>
                </div>
              </td>
              <td className="py-2.5 text-right font-mono text-[12.5px] font-bold text-t0">{num(l.vendas)}</td>
              <td className="py-2.5 text-right font-mono text-[12.5px] font-bold text-ok">{brl(l.faturamento)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
