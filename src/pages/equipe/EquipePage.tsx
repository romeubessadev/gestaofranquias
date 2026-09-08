import { useMemo } from "react";
import { montarEquipeView } from "@/data/gestao/equipeVisoes";
import { mesAno } from "@/lib/formato";
import { Avisos } from "@/components/gestao/Avisos";
import { DashboardShell } from "@/pages/dashboard/DashboardShell";
import { useEscopo } from "@/pages/dashboard/useEscopo";
import { BlocoLeitura } from "@/pages/dashboard/blocos";
import { AvisoCompetencia, BlocoDesafios, BlocoKpisEquipe, BlocoResumoRede, CardVendedoras } from "./blocos";

/**
 * Aba Equipe: análise de metas, desafios e comissão do mês por vendedora.
 * Filtro global (período/loja/marca); "todas as lojas" mostra um resumo por
 * loja. Período que não é o mês da competência mostra só desempenho.
 */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarEquipeView(escopo), [escopo]);

  return (
    <DashboardShell tab="equipe" escopo={escopo} onChange={mudar}>
      <div className="flex flex-col gap-5">
        {v.avisos.length > 0 && <Avisos itens={v.avisos} />}

        {v.avisoCompetencia && <AvisoCompetencia texto={v.avisoCompetencia} />}

        {v.leitura && <BlocoLeitura texto={v.leitura} />}

        <BlocoKpisEquipe
          faturamento={v.kpiFaturamento}
          atendimentos={v.kpiAtendimentos}
          ticket={v.kpiTicket}
          pa={v.kpiPA}
          premiacao={v.kpiPremiacao}
          desafios={v.desafios}
          metaAtiva={v.metaAtiva}
        />

        {v.visao === "loja" ? (
          <CardVendedoras
            estado={v.estados.vendedoras}
            lista={v.vendedoras}
            metaAtiva={v.metaAtiva}
            competenciaTexto={mesAno(`${v.competencia}-01`)}
          />
        ) : (
          <BlocoResumoRede lojas={v.lojas ?? []} onEscolher={(id) => mudar({ ...escopo, filialId: id, divisao: null })} />
        )}

        {v.metaAtiva && v.desafios && v.desafios.length > 0 && <BlocoDesafios desafios={v.desafios} />}
      </div>
    </DashboardShell>
  );
}