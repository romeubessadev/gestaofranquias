import { useMemo, useState, useCallback } from "react";
import { montarEquipeView } from "@/data/gestao/equipeVisoes";
import { mesAno, brl, deIso } from "@/lib/formato";
import { Avisos } from "@/components/gestao/Avisos";
import { Button, Card, CardTitle, DateRangePicker, EmptyState, PageHeader } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { BlocoLeitura } from "@/pages/dashboard/blocos";
import { AvisoCompetencia, BlocoDesafios, BlocoKpisEquipe, CardVendedoras, FaixaMetaGlobal } from "./blocos";
import { Tooltip } from "@/components/ui/Tooltip";
import type { DateRange } from "@/components/ui/DateRangePicker";

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 hover:text-t1 transition-colors">
      ?
    </span>
  </Tooltip>
);

const filtroSelectClass =
  "h-8 rounded-[var(--radius-vela-sm)] border border-line bg-bg-3 px-3 text-xs font-semibold text-t0 transition-colors hover:border-acc focus:border-acc focus:outline-none";

/**
 * Tela Equipe: metas, desafios e premiação do mês (sempre visíveis — AD-046).
 * Chrome alinhado às demais subtelas do Dashboard (Período + Marca no header).
 */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarEquipeView(escopo), [escopo]);
  const periodoForaDoMes = Boolean(v.avisoCompetencia?.includes("seguem o período"));
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

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

  function onMarcaChange(divisao: "WEPINK" | "WPINK" | null) {
    mudar({ ...escopo, divisao });
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
        crumbs={[{ label: "Dashboard", to: "/dashboard/visao-geral" }, { label: "Equipe" }]}
        title="Equipe"
        subtitle="Quem precisa de atenção, por quê, e quanto vai custar."
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? "animate-spin" : ""}>
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
              value={escopo.divisao ?? ""}
              onChange={(e) => onMarcaChange(e.target.value ? (e.target.value as "WEPINK" | "WPINK") : null)}
              className={filtroSelectClass}
            >
              <option value="">Todas as marcas</option>
              <option value="WEPINK">WEPINK</option>
              <option value="WPINK">WPINK</option>
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

        {v.leitura && <BlocoLeitura texto={v.leitura} />}

        <BlocoKpisEquipe faturamento={v.kpiFaturamento} atendimentos={v.kpiAtendimentos} ticket={v.kpiTicket} pa={v.kpiPA} />

        {v.evolucaoFaturamento && v.evolucaoFaturamento.length > 1 && (
          <Card padding="lg">
            <div className="mb-4 flex items-center gap-1.5">
              <CardTitle>Evolução do Faturamento</CardTitle>
              <TipHelp label="Faturamento da equipe ao longo do período selecionado." />
            </div>
            <AreaLineChart
              data={v.evolucaoFaturamento.map((e) => e.valor)}
              labels={v.evolucaoFaturamento.map((e) => e.label)}
              color="var(--acc)"
              height={200}
              formatValue={brl}
            />
          </Card>
        )}

        {v.visao === "rede" && v.metaGlobal && <FaixaMetaGlobal meta={v.metaGlobal} />}

        <CardVendedoras
          estado={v.estados.vendedoras}
          lista={v.vendedoras}
          metaAtiva={v.metaAtiva}
          competenciaTexto={mesAno(`${v.competencia}-01`)}
          mostrarShopping={v.visao === "rede"}
        />

        {v.metaAtiva && v.desafios && v.desafios.length > 0 && <BlocoDesafios desafios={v.desafios} />}
        {v.metaAtiva && (!v.desafios || v.desafios.length === 0) && (
          <Card>
            <EmptyState icon="🎯" title="Sem desafios" description={`Nenhum desafio cadastrado para ${mesAno(`${v.competencia}-01`)}.`} />
          </Card>
        )}
      </div>
    </div>
  );
}
