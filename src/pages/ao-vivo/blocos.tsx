import { Avatar, Badge, Card, CardTitle, EmptyState, ProgressBar, Segmented } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { brl, brlK, num, pct } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { AoVivoView, DesafioAoVivo, MetaAoVivo, RankingLinha } from "@/data/gestao/aoVivo";
import { useState } from "react";

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

function CardDesafio({ d }: { d: DesafioAoVivo }) {
  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle className="text-[14px]">{d.nome}</CardTitle>
          <p className="mt-1 text-[12px] leading-snug text-t2">{d.objetivo}</p>
        </div>
        <Badge variant="warning">{d.prazoRotulo}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-t1">
        <span>Acumulado: {d.acumuladoRotulo}</span>
        <span className="text-t2">·</span>
        <span className="text-acc">Prêmio {brl(d.premio)}</span>
      </div>
      <ProgressBar value={d.progressoPct} />
      <div className="flex flex-col gap-2">
        {d.top3.map((t, i) => (
          <div key={t.colaboradorId} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-[11px] font-bold text-t2">{i + 1}º</span>
            <Avatar size="sm" name={t.nome} />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-t0">{t.nome}</span>
            <span className="shrink-0 font-mono text-[12px] font-bold text-t1">{Math.round(t.pct)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BlocoDesafios({ desafios }: { desafios: DesafioAoVivo[] }) {
  if (desafios.length === 0) {
    return <EmptyState title="Nenhum desafio ativo" description="Quando houver desafios na competência, eles aparecem aqui." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {desafios.map((d) => (
        <CardDesafio key={d.id} d={d} />
      ))}
    </div>
  );
}

export function BlocoMetas({ meta }: { meta: MetaAoVivo | null }) {
  const [modo, setModo] = useState<"vendedor" | "grupo">("vendedor");
  if (!meta) {
    return <EmptyState title="Sem meta na competência" description="Cadastre a meta da loja em Metas para acompanhar o atingimento ao vivo." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold capitalize text-t2">{meta.competenciaRotulo}</p>
          <p className="mt-1 font-mono text-xl font-extrabold text-t0">
            {pct(meta.pct, 1)} · {brlK(meta.realizado)} / {brlK(meta.alvo)}
          </p>
        </div>
        <Segmented
          options={[
            { value: "vendedor", label: "Por Vendedor" },
            { value: "grupo", label: "Por Grupo" },
          ]}
          value={modo}
          onChange={(v) => setModo((v as "vendedor" | "grupo") ?? "vendedor")}
        />
      </div>
      <ProgressBar value={Math.min(100, meta.pct)} />
      <div className="flex flex-wrap gap-2">
        {meta.niveis.map((n) => (
          <Badge key={n.nome} variant="neutral">
            {n.nome} ({n.atingimentoMinPct}%)
          </Badge>
        ))}
      </div>

      {modo === "vendedor" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                <th className="px-1 pb-2 text-left font-bold">#</th>
                <th className="px-1 pb-2 text-left font-bold">Vendedor</th>
                <th className="px-1 pb-2 text-right font-bold">%</th>
                <th className="px-1 pb-2 text-right font-bold">Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {meta.porVendedor.map((l) => (
                <tr key={l.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pl-1 font-mono text-[12px] font-bold text-t2">{l.posicao}º</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" name={l.nome} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-t0">{l.nome}</p>
                        {l.nivelNome && <p className="text-[11px] font-semibold text-acc">{l.nivelNome}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[12.5px] font-bold text-t0">{pct(l.pct, 0)}</td>
                  <td className="py-2.5 text-right font-mono text-[12.5px] font-bold text-ok">{brl(l.faturamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meta.porGrupo.map((g) => (
            <Card key={g.id} padding="md">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardTitle className="text-[14px]">{g.nome}</CardTitle>
                <span className="font-mono text-[13px] font-bold text-t0">
                  {pct(g.pct, 1)} · {brlK(g.faturamento)} / {brlK(g.meta)}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-t2">{g.vendedores} vendedor(es)</p>
              <div className="mt-2">
                <ProgressBar value={Math.min(100, g.pct)} />
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {g.top3.map((t, i) => (
                  <div key={t.nome} className="flex justify-between text-[12px]">
                    <span className="font-semibold text-t1">
                      {i + 1}º {t.nome}
                    </span>
                    <span className="font-mono font-bold text-t0">
                      {brlK(t.faturamento)} · {pct(t.pct, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
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
