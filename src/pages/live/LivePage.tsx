import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardTitle, EmptyState, PageHeader, StatCard, Tabs } from "@/components/ui";
import { useScope } from "@/pages/dashboard/useScope";
import { buildLiveView } from "@/data/wedash/live";
import { buildTeamView } from "@/data/wedash/teamViews";
import { formatUpdatedAtLabel } from "@/data/wedash/syncUi";
import { paths } from "@/router/paths";
import { FlameIcon, TargetIcon, TrophyIcon, TINT, type TintKey } from "@/pages/dashboards/icons";
import {
  BlocoDesafios as BlocoDesafiosEquipe,
  CardMeta,
} from "@/pages/team/blocos";
import { BlocoRanking, BlocoRankingGeral, BlocoRankingLojas } from "./blocos";

const IconVendas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconMeta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconPct = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);
/** Mesmo cart da Visão Geral / Financeiro (CMV) — usado em Itens vendidos hoje. */
const IconItens = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
/** Mesmo ticket/cartão da Visão Geral. */
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const KPI_ICONS = [IconFat, IconVendas, IconMeta, IconPct];
const KPI_HOJE_ICONS = [IconFat, IconVendas, IconTicket, IconItens];
/** Mesma sequência de tint dos heroes da Visão Geral / Financeiro. */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
];
const KPI_HOJE_TINTS: TintKey[] = ["acc", "warn", "ok", "info"];

function AbaMetas({
  metasCards,
  metaAtiva,
}: {
  metasCards: ReturnType<typeof buildTeamView>["metasCards"];
  metaAtiva: boolean;
}) {
  if (!metasCards.length) {
    return (
      <EmptyState
        title="Nenhuma meta cadastrada para este mês."
        description="Cadastre a meta da loja em Metas."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {metasCards.map((card) => (
        <CardMeta key={card.id} card={card} metaAtiva={metaAtiva} />
      ))}
    </div>
  );
}

export default function LivePage() {
  const { escopo } = useScope();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const view = useMemo(() => {
    void tick;
    return buildLiveView(escopo);
  }, [escopo, tick]);

  /** Mesma visão de Equipe (desafios + meta + escada) — componentes compartilhados. */
  const equipeView = useMemo(() => {
    void tick;
    return buildTeamView({ ...escopo, divisao: null });
  }, [escopo, tick]);

  const forcarAtualizacao = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setTick((t) => t + 1);
      setUltimaAtualizacao(new Date());
      setRefreshing(false);
    }, 400);
  }, []);

  const minutosAtras = Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 60000);
  const rotuloAtualizacao = formatUpdatedAtLabel(ultimaAtualizacao);

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        crumbs={[{ label: "Ao vivo" }]}
        title="Ao vivo"
        subtitle="Resultado do mês e desempenho de hoje."
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={forcarAtualizacao}
              disabled={refreshing}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={refreshing ? "animate-spin" : ""}
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              }
            >
              Atualizar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(paths.live.share)}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              }
            >
              Compartilhar
            </Button>
          </>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => {
          const Icon = KPI_ICONS[i] ?? IconVendas;
          const c = KPI_COLORS[i] ?? KPI_COLORS[0];
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.valor}
              sub={kpi.sub}
              icon={<Icon />}
              iconColor={c.iconColor}
              iconBg={c.iconBg}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpisHoje.map((kpi, i) => {
          const Icon = KPI_HOJE_ICONS[i] ?? IconVendas;
          const tint = TINT[KPI_HOJE_TINTS[i] ?? "acc"];
          return (
            <Card key={kpi.label} padding="sm" className="flex items-center gap-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                style={{ background: tint.bg, color: tint.fg }}
              >
                <Icon />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold text-t2">{kpi.label}</p>
                <p className="mt-1 truncate font-mono text-lg font-extrabold text-t0">{kpi.valor}</p>
                {kpi.sub ? <p className="text-[11px] text-t2">{kpi.sub}</p> : null}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 min-w-0 overflow-hidden" padding="lg">
        <CardTitle className="mb-4">Desempenho do mês</CardTitle>
        <Tabs
          variant="accent"
          defaultKey="ranking"
          items={[
            {
              key: "ranking",
              label: "Ranking",
              icon: <TrophyIcon size={14} />,
              content: <BlocoRanking ranking={view.ranking} />,
            },
            {
              key: "desafios",
              label: "Desafios",
              icon: <FlameIcon size={14} />,
              content: (
                <BlocoDesafiosEquipe
                  challenges={(equipeView.challenges ?? []).filter((d) => d.statusLabel === "Ativo")}
                  embedded
                />
              ),
            },
            {
              key: "metas",
              label: "Metas",
              icon: <TargetIcon size={14} />,
              content: (
                <AbaMetas
                  metasCards={equipeView.metasCards}
                  metaAtiva={equipeView.metaAtiva}
                />
              ),
            },
          ]}
        />
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex max-h-[min(520px,70vh)] flex-col overflow-hidden" padding="lg">
          <BlocoRankingLojas lojas={view.rankingLojas} />
        </Card>
        <Card className="flex max-h-[min(520px,70vh)] flex-col overflow-hidden" padding="lg">
          <div className="mb-4 flex shrink-0 items-center gap-2">
            <TrophyIcon size={16} className="text-acc" />
            <CardTitle>Ranking da equipe</CardTitle>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <BlocoRankingGeral ranking={view.ranking} vendedoras={equipeView.vendedoras} />
          </div>
        </Card>
      </div>
    </div>
  );
}
