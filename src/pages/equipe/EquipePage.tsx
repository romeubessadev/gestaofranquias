import { useMemo } from "react";
import { montarEquipeView } from "@/data/gestao/equipeVisoes";
import { mesAno } from "@/lib/formato";
import { Avisos } from "@/components/gestao/Avisos";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { SeletorEscopo } from "@/pages/dashboard/SeletorEscopo";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { BlocoLeitura } from "@/pages/dashboard/blocos";
import { AvisoCompetencia, BlocoDesafios, BlocoKpisEquipe, BlocoVendedorasRede, CardVendedoras, FaixaMetaGlobal } from "./blocos";

/**
 * Tela Equipe: metas, desafios e premiação do mês (sempre visíveis — AD-046).
 * Os 4 KPIs de desempenho seguem o período filtrado; um aviso deixa o
 * recorte explícito quando o período ≠ competência.
 * Layout independente — NÃO usa DashboardShell (que é exclusivo das subtelas do Dashboard).
 */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarEquipeView(escopo), [escopo]);
  const periodoForaDoMes = Boolean(v.avisoCompetencia?.includes("seguem o período"));

  return (
    <div>
      <PageHeader title="Equipe" subtitle="Quem precisa de atenção, por quê, e quanto vai custar." />

      <div className="mb-5">
        <SeletorEscopo escopo={escopo} onChange={mudar} />
      </div>

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
    </div>
  );
}