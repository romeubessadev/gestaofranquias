import { useMemo } from "react";
import { montarLojaView } from "@/data/gestao/dashboard";
import { Avisos } from "@/components/gestao/Avisos";
import { DashboardShell } from "./DashboardShell";
import { useEscopo } from "./useEscopo";
import { BlocoEvolucao, BlocoKpis, BlocoPorHora, BlocoRegua, EstadoBloco } from "./blocos";

/**
 * Visão geral do Dashboard: o resumo que funciona com qualquer filtro.
 * KPIs no topo (com “Variações vs …” na base da comparação); gráfico AreaLine
 * por hora ou por dia com overlay — AD-048 / AD-050.
 */
export function DashboardPage() {
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarLojaView(escopo), [escopo]);

  // Gráfico principal: por hora (dia) ou evolução diária (período > 1 dia).
  const principal = v.graficoHora ? <BlocoPorHora g={v.graficoHora} /> : v.evolucao ? <BlocoEvolucao g={v.evolucao} /> : null;

  return (
    <DashboardShell tab="loja" escopo={escopo} onChange={mudar}>
      {v.avisos.length > 0 && (
        <div className="mb-5">
          <Avisos itens={v.avisos} />
        </div>
      )}

      <div className="flex flex-col gap-5">
        <EstadoBloco estado={v.estados.kpis}>
          <BlocoKpis faturamento={v.kpiFaturamento} ticket={v.kpiTicket} pa={v.kpiPA} atendimentos={v.kpiAtendimentos} />
        </EstadoBloco>

        {principal && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">{principal}</div>
            {v.regua && (
              <BlocoRegua
                regua={v.regua}
                titulo={v.reguaTitulo}
                modoMarca={Boolean(escopo.divisao)}
                onEscolher={(id) => mudar({ ...escopo, filialId: id, divisao: null })}
              />
            )}
          </div>
        )}

        {/* Sem gráfico (ex.: sem dados), a régua ocupa a linha inteira. */}
        {!principal && v.regua && (
          <BlocoRegua
            regua={v.regua}
            titulo={v.reguaTitulo}
            modoMarca={Boolean(escopo.divisao)}
            onEscolher={(id) => mudar({ ...escopo, filialId: id, divisao: null })}
          />
        )}

        {/* Direto das outras abas: sinais de Financeiro/Equipe/Produtos entram aqui
            quando essas telas existirem (cada aba fornece o próprio resumo). */}
      </div>
    </DashboardShell>
  );
}
