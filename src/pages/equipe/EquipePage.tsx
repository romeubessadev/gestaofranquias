import { useMemo } from "react";
import { montarEquipeView } from "@/data/gestao/equipeVisoes";
import { mesAno } from "@/lib/formato";
import { Avisos } from "@/components/gestao/Avisos";
import { Card, EmptyState } from "@/components/ui";
import { DashboardShell } from "@/pages/dashboard/DashboardShell";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { BlocoLeitura } from "@/pages/dashboard/blocos";
import { AvisoCompetencia, BlocoDesafios, BlocoKpisEquipe, BlocoVendedorasRede, CardVendedoras, FaixaMetaGlobal } from "./blocos";

/**
 * Aba Equipe: metas, desafios e premiação do mês (sempre visíveis — AD-046).
 * Os 4 KPIs de desempenho seguem o período filtrado; um aviso deixa o
 * recorte explícito quando o período ≠ competência.
 */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarEquipeView(escopo), [escopo]);
  const periodoForaDoMes = Boolean(v.avisoCompetencia?.includes("seguem o período"));

  return (
    <DashboardShell tab="equipe" escopo={escopo} onChange={mudar}>
      <div className="flex flex-col gap-5">
        {v.avisos.length > 0 && <Avisos itens={v.avisos} />}

        {v.avisoCompetencia && (
          <AvisoCompetencia
            texto={v.avisoCompetencia}
            onVerMes={periodoForaDoMes ? () => mudar({ ...escopo, periodo: { tipo: "esteMes" } }) : undefined}
          />
        )}

        {v.leitura && <BlocoLeitura texto={v.leitura} />}

        <BlocoKpisEquipe faturamento={v.kpiFaturamento} atendimentos={v.kpiAtendimentos} ticket={v.kpiTicket} pa={v.kpiPA} />

        {v.visao === "rede" && v.metaGlobal && <FaixaMetaGlobal meta={v.metaGlobal} />}

        {v.visao === "loja" ? (
          <CardVendedoras estado={v.estados.vendedoras} lista={v.vendedoras} metaAtiva={v.metaAtiva} competenciaTexto={mesAno(`${v.competencia}-01`)} />
        ) : (
          <BlocoVendedorasRede estado={v.estados.vendedoras} lista={v.vendedoras} lojas={v.lojas} metaAtiva={v.metaAtiva} competenciaTexto={mesAno(`${v.competencia}-01`)} />
        )}

        {v.metaAtiva && v.desafios && v.desafios.length > 0 && <BlocoDesafios desafios={v.desafios} />}
        {v.metaAtiva && (!v.desafios || v.desafios.length === 0) && (
          <Card>
            <EmptyState icon="🎯" title="Sem desafios ativos" description={`Nenhum desafio cadastrado para ${mesAno(`${v.competencia}-01`)}.`} />
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}