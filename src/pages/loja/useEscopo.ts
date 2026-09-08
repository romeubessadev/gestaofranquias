import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Divisao } from "@/data/gestao/filiais";
import type { Escopo, PeriodoTipo } from "@/data/gestao/loja";
import { useSessaoAtiva } from "@/session/SessionProvider";

const PERIODOS: PeriodoTipo[] = ["hoje", "ontem", "7dias", "esteMes", "mesPassado", "personalizado"];

/**
 * Escopo (loja, período, divisão) mora na URL, não no estado de uma página.
 * Loja e Equipe são abas do mesmo Dashboard e precisam do mesmo filtro.
 */
export function useEscopo() {
  const sessao = useSessaoAtiva();
  const [params, setParams] = useSearchParams();

  const escopo = useMemo<Escopo>(() => {
    const filialParam = params.get("filial");
    const filialPadrao = sessao.filiais.length > 1 ? "todas" : sessao.filiais[0];
    const filialId = filialParam && (filialParam === "todas" || sessao.filiais.includes(filialParam)) ? filialParam : filialPadrao;
    const tipo = (params.get("periodo") as PeriodoTipo | null) ?? "hoje";
    const periodoTipo = PERIODOS.includes(tipo) ? tipo : "hoje";
    const divisaoParam = params.get("divisao");
    const divisao: Divisao | null = divisaoParam === "WEPINK" || divisaoParam === "WPINK" ? divisaoParam : null;
    return {
      filialId: filialId === "todas" && sessao.filiais.length === 1 ? sessao.filiais[0] : filialId,
      periodo: periodoTipo === "personalizado" ? { tipo: periodoTipo, inicio: params.get("de") ?? undefined, fim: params.get("ate") ?? undefined } : { tipo: periodoTipo },
      divisao,
    };
  }, [params, sessao.filiais]);

  function mudar(e: Escopo) {
    const p = new URLSearchParams();
    p.set("filial", e.filialId);
    p.set("periodo", e.periodo.tipo);
    if (e.periodo.tipo === "personalizado") {
      if (e.periodo.inicio) p.set("de", e.periodo.inicio);
      if (e.periodo.fim) p.set("ate", e.periodo.fim);
    }
    if (e.divisao) p.set("divisao", e.divisao);
    setParams(p, { replace: true });
  }

  return { escopo, mudar };
}
