import { useMemo, useState, useCallback } from "react";
import { montarEquipeView } from "@/data/gestao/equipeVisoes";
import { mesAno, brlK, deIso, tipRelacao } from "@/lib/formato";
import { Avisos } from "@/components/gestao/Avisos";
import { Badge, Button, Card, CardTitle, DateRangePicker, EmptyState, PageHeader } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { AvisoCompetencia, BlocoDesafios, BlocoKpisEquipe, CardMeta, CardVendedoras } from "./blocos";
import { Tooltip } from "@/components/ui/Tooltip";
import type { DateRange } from "@/components/ui/DateRangePicker";

/** Badge de delta — só % no chip; base do comparativo no tooltip (igual Visão Geral). */
function BadgeVsAnterior({ delta }: { delta?: { value: string; positive: boolean; vs?: string; diff?: string } }) {
  if (!delta) return null;
  const badge = (
    <Badge variant={delta.positive ? "success" : "danger"}>
      {delta.positive ? "+" : "−"}
      {delta.value}
    </Badge>
  );
  if (!delta.vs) return badge;
  return <Tooltip label={tipRelacao(delta.vs)}>{badge}</Tooltip>;
}

const filtroSelectClass =
  "h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none";

/**
 * Tela Equipe: metas, desafios e premiação do mês (sempre visíveis — AD-046).
 * Chrome: Período + Grupo (sem filtro de Marca — não impacta esta leitura).
 */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();
  // Equipe é visão individual (meta/escada/desafios da loja) — marca não altera a leitura.
  const v = useMemo(() => montarEquipeView({ ...escopo, divisao: null }), [escopo]);
  const periodoForaDoMes = Boolean(v.avisoCompetencia?.includes("seguem o período"));
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [grupoFiltro, setGrupoFiltro] = useState<string | null>(null);

  // Se a loja mudar e o grupo sumir da lista, volta para "Todos".
  const grupoAtivo = grupoFiltro && v.gruposDisponiveis.some((g) => g.nome === grupoFiltro) ? grupoFiltro : null;

  const vendedorasFiltradas = useMemo(() => {
    if (!v.vendedoras) return null;
    if (!grupoAtivo) return v.vendedoras;
    return v.vendedoras.filter((l) => l.grupo === grupoAtivo);
  }, [v.vendedoras, grupoAtivo]);

  const metasCardsFiltrados = useMemo(() => {
    if (!grupoAtivo) return v.metasCards;
    return v.metasCards.map((card) => {
      const vendedoras = card.vendedoras.filter((l) => l.grupo === grupoAtivo);
      return { ...card, vendedoras, qtdVendedoras: vendedoras.length, qtdGrupos: 1 };
    });
  }, [v.metasCards, grupoAtivo]);

  const dateRange: DateRange | null = useMemo(() => {
    if (escopo.periodo.tipo === "personalizado" && escopo.periodo.inicio && escopo.periodo.fim) {
      return [deIso(escopo.periodo.inicio), deIso(escopo.periodo.fim)];
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    switch (escopo.periodo.tipo) {
      case "hoje":
        return [hoje, hoje];
      case "ontem": {
        const y = new Date(hoje);
        y.setDate(y.getDate() - 1);
        return [y, y];
      }
      case "7dias": {
        const s = new Date(hoje);
        s.setDate(s.getDate() - 6);
        return [s, hoje];
      }
      case "esteMes":
        return [new Date(hoje.getFullYear(), hoje.getMonth(), 1), hoje];
      case "mesPassado":
        return [new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), new Date(hoje.getFullYear(), hoje.getMonth(), 0)];
      default:
        return null;
    }
  }, [escopo.periodo]);

  function onDateChange(r: DateRange) {
    mudar({
      ...escopo,
      periodo: { tipo: "personalizado", inicio: r[0].toISOString().slice(0, 10), fim: r[1].toISOString().slice(0, 10) },
    });
  }

  const forcarAtualizacao = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setUltimaAtualizacao(new Date());
      setRefreshing(false);
    }, 600);
  }, []);

  const minutosAtras = Math.floor((Date.now() - ultimaAtualizacao.getTime()) / 60000);
  const rotuloAtualizacao = minutosAtras < 1 ? "Atualizado agora" : `Atualizado há ${minutosAtras} min`;

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Equipe"
        subtitle="Desempenho individual, metas, premiações e desafios da equipe."
        crumbs={[{ label: "Dashboard" }, { label: "Equipe" }]}
        actions={
          <>
            <span className={`flex items-center gap-1.5 text-[12px] ${minutosAtras < 10 ? "text-ok" : "text-t2"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${minutosAtras < 10 ? "bg-ok" : "bg-warn"}`} />
              {rotuloAtualizacao}
            </span>
            <Button
              size="sm"
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
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Exportar
            </Button>
            <DateRangePicker value={dateRange} onChange={onDateChange} size="sm" />
            <select
              value={grupoAtivo ?? ""}
              onChange={(e) => setGrupoFiltro(e.target.value || null)}
              className={filtroSelectClass}
            >
              <option value="">Todos os grupos</option>
              {v.gruposDisponiveis.map((g) => (
                <option key={g.id} value={g.nome}>
                  {g.nome}
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="mt-4 flex flex-col gap-4">
        {v.avisos.length > 0 && <Avisos itens={v.avisos} />}

        {v.avisoCompetencia && (
          <AvisoCompetencia
            texto={v.avisoCompetencia}
            onVerMes={periodoForaDoMes ? () => mudar({ ...escopo, periodo: { tipo: "esteMes" } }) : undefined}
          />
        )}

        <BlocoKpisEquipe faturamento={v.kpiFaturamento} atendimentos={v.kpiAtendimentos} ticket={v.kpiTicket} pa={v.kpiPA} />

        {v.evolucaoFaturamento && v.evolucaoFaturamento.length > 1 && (
          <Card padding="lg">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle>Faturamento x meta</CardTitle>
                </div>
                {v.rotuloSerie && <p className="mt-0.5 text-[11px] font-semibold text-t2">{v.rotuloSerie}</p>}
                <div className="mt-2.5 flex flex-wrap gap-5">
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--ok)]" />
                      Realizado
                    </span>
                    <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                      {brlK(v.evolucaoFaturamento[v.evolucaoFaturamento.length - 1]?.realizado ?? 0)}
                    </p>
                  </div>
                  {v.metaAtiva && (
                    <div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                        <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--warn)]" />
                        Meta
                      </span>
                      <p className="mt-0.5 font-mono text-base font-extrabold text-t0">
                        {brlK(v.evolucaoFaturamento[v.evolucaoFaturamento.length - 1]?.meta ?? 0)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <BadgeVsAnterior delta={v.kpiFaturamento.delta} />
            </div>
            <AreaLineChart
              data={v.evolucaoFaturamento.map((e) => e.realizado)}
              compareData={v.metaAtiva ? v.evolucaoFaturamento.map((e) => e.meta) : undefined}
              labels={v.evolucaoFaturamento.map((e) => e.label)}
              color="var(--ok)"
              compareColor="var(--warn)"
              formatValue={brlK}
              showAxisLabels
            />
          </Card>
        )}

        {metasCardsFiltrados.length > 0 ? (
          metasCardsFiltrados.map((card) => (
            <CardMeta key={card.id} card={card} metaAtiva={v.metaAtiva} />
          ))
        ) : (
          <CardVendedoras
            estado={vendedorasFiltradas && vendedorasFiltradas.length > 0 ? "disponivel" : "sem_dados"}
            lista={vendedorasFiltradas}
            metaAtiva={v.metaAtiva}
          />
        )}

        {v.metaAtiva && v.desafios && v.desafios.length > 0 && <BlocoDesafios desafios={v.desafios} />}
        {v.metaAtiva && (!v.desafios || v.desafios.length === 0) && (
          <Card>
            <EmptyState icon="🎯" title="Nenhum desafio nesta competência." description={`Não há desafios cadastrados para ${mesAno(`${v.competencia}-01`)}.`} />
          </Card>
        )}
      </div>
    </div>
  );
}
