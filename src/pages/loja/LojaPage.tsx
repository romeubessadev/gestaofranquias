import { useMemo } from "react";
import { montarLojaView } from "@/data/gestao/loja";
import { Avisos } from "@/components/gestao/Avisos";
import { cn } from "@/lib/cn";
import { useSessaoAtiva } from "@/session/SessionProvider";
import { DashboardShell } from "./DashboardShell";
import { useEscopo } from "./useEscopo";
import { BlocoAlertas, BlocoCategorias, BlocoChecklist, BlocoComparacao, BlocoEvolucao, BlocoKpis, BlocoLucroBruto, BlocoPorHora, BlocoPorHoraRede, BlocoRegua, BlocoRitmo } from "./blocos";

/**
 * Loja: mesmo conjunto de 4 tiles no topo em qualquer visão. Abaixo, um par
 * de blocos (principal + lateral) que muda conforme a visão, e por fim a
 * régua de lojas e categorias. "Desempenho das lojas" fica isolado numa linha
 * própria: com muitas filiais, a lista cresce e não cabe dividindo espaço com
 * outro card.
 */
export function LojaPage() {
  const sessao = useSessaoAtiva();
  const { escopo, mudar } = useEscopo();
  const v = useMemo(() => montarLojaView(escopo), [escopo]);
  const podeVerCusto = sessao.papel === "GESTOR" || sessao.papel === "ADMIN_GLOBAL" || sessao.papel === "GERENTE";

  // Bloco principal (2/3) e lateral (1/3): o que existir para a visão atual.
  // Ritmo da meta aparece em qualquer visão, então na loja ele empilha junto
  // do Turno/Lucro Bruto em vez de disputar o mesmo espaço.
  const principal = v.graficoHoraRede ? <BlocoPorHoraRede g={v.graficoHoraRede} /> : v.graficoHora ? <BlocoPorHora g={v.graficoHora} /> : v.evolucao ? <BlocoEvolucao g={v.evolucao} /> : null;
  const ladoRitmo = v.ritmo ? <BlocoRitmo ritmo={v.ritmo} /> : v.ritmoAviso ? <p className="text-[13px] text-t2">{v.ritmoAviso}</p> : null;
  const ladoContexto = v.checklist ? <BlocoChecklist c={v.checklist} /> : podeVerCusto && v.lucroBruto ? <BlocoLucroBruto itens={v.lucroBruto.itens} aviso={v.lucroBruto.aviso} divisaoLinha={v.lucroBruto.divisaoLinha} /> : null;
  const lateral =
    ladoRitmo || ladoContexto ? (
      <div className="flex flex-col gap-5">
        {ladoRitmo}
        {ladoContexto}
      </div>
    ) : null;

  return (
    <DashboardShell tab="loja" escopo={escopo} onChange={mudar}>
      <BlocoAlertas alertas={v.alertas} />

      {v.avisos.length > 0 && (
        <div className="mb-5">
          <Avisos itens={v.avisos} />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {v.comparacao && <BlocoComparacao atual={v.comparacao.atual} anterior={v.comparacao.anterior} />}
        <BlocoKpis faturamento={v.kpiFaturamento} tileMeta={v.tileMeta} ticket={v.kpiTicket} pa={v.kpiPA} />

        {principal && (
          <div className={cn("grid grid-cols-1 gap-5", lateral && "lg:grid-cols-3")}>
            <div className={lateral ? "lg:col-span-2" : ""}>{principal}</div>
            {lateral && <div>{lateral}</div>}
          </div>
        )}

        {!principal && lateral}

        {v.regua && <BlocoRegua regua={v.regua} modoMarca={Boolean(escopo.divisao)} onEscolher={(id) => mudar({ ...escopo, filialId: id, divisao: null })} />}

        {podeVerCusto && v.categorias && v.categorias.length > 0 && <BlocoCategorias categorias={v.categorias} escopoId={escopo.filialId} />}
      </div>
    </DashboardShell>
  );
}
