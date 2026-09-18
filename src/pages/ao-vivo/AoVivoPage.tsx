import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, StatCard, Tabs } from "@/components/ui";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { montarAoVivoView } from "@/data/gestao/aoVivo";
import { paths } from "@/router/paths";
import { BlocoDesafios, BlocoEvolucao, BlocoIaInsights, BlocoMetas, BlocoRanking } from "./blocos";

const IconVendas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
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

const KPI_ICONS = [IconVendas, IconFat, IconMeta, IconPct];
const KPI_COLORS = [
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
];

export default function AoVivoPage() {
  const { escopo } = useEscopo();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const view = useMemo(() => {
    void tick;
    return montarAoVivoView(escopo);
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
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} min`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Ao vivo"
        subtitle={`Andamento de ${view.competencia.slice(5)}/${view.competencia.slice(0, 4)} · pulso do dia nos indicadores`}
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button
              size="sm"
              variant="secondary"
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
              onClick={() => navigate(paths.aoVivo.compartilhar)}
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
            <Button
              size="sm"
              onClick={() => navigate(paths.aoVivo.tv)}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                  <polyline points="17 2 12 7 7 2" />
                </svg>
              }
            >
              Modo TV
            </Button>
          </>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi, i) => {
          const Icon = KPI_ICONS[i];
          const c = KPI_COLORS[i];
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

      <Card className="mt-4" padding="lg">
        <Tabs
          defaultKey="ranking"
          items={[
            { key: "ranking", label: "Ranking", content: <BlocoRanking ranking={view.ranking} /> },
            { key: "desafios", label: "Desafios", content: <BlocoDesafios desafios={view.desafios} /> },
            { key: "metas", label: "Metas", content: <BlocoMetas meta={view.meta} /> },
          ]}
        />
      </Card>

      <div className="mt-4">
        <BlocoEvolucao view={view} />
      </div>

      <div className="mt-4">
        <BlocoIaInsights texto={insight} onGerar={() => setInsight(view.insightMock)} />
      </div>
    </div>
  );
}
