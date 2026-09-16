import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Divisao } from "@/data/gestao/filiais";
import type { Escopo, PeriodoTipo } from "@/data/gestao/dashboard";
import { useSessaoAtiva } from "@/session/SessionProvider";

const PERIODOS: PeriodoTipo[] = ["hoje", "ontem", "7dias", "esteMes", "mesPassado", "personalizado"];

/**
 * Escopo (lojas, período, divisão) mora na URL, não no estado de uma página.
 * Loja e Equipe são abas do mesmo Dashboard e precisam do mesmo filtro.
 *
 * Single-select de loja: `filial` na URL é um id (ex.: "filial=f1").
 * Ausente / vazio = "Todas as lojas" (consolida a rede).
 * Se a URL ainda tiver lista antiga ("f1,f2"), usa só o primeiro id.
 */
export function useEscopo() {
  const sessao = useSessaoAtiva();
  const [params, setParams] = useSearchParams();

  const escopo = useMemo<Escopo>(() => {
    const filialRaw = params.get("filial");
    const idsRaw = filialRaw ? filialRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    // Só aceita ids que a sessão realmente pode ver; single-select → no máx. 1.
    const validos = idsRaw.filter((id) => sessao.filiais.includes(id));
    const filialIds =
      validos.length === 0
        ? sessao.filiais.length > 1
          ? []
          : [sessao.filiais[0]]
        : [validos[0]];

    const tipo = (params.get("periodo") as PeriodoTipo | null) ?? "esteMes";
    const periodoTipo = PERIODOS.includes(tipo) ? tipo : "esteMes";
    const divisaoParam = params.get("divisao");
    const divisao: Divisao | null = divisaoParam === "WEPINK" || divisaoParam === "WPINK" ? divisaoParam : null;

    return {
      filialIds,
      periodo: periodoTipo === "personalizado" ? { tipo: periodoTipo, inicio: params.get("de") ?? undefined, fim: params.get("ate") ?? undefined } : { tipo: periodoTipo },
      divisao,
    };
  }, [params, sessao.filiais]);

  function mudar(e: Escopo) {
    const p = new URLSearchParams();
    // Array vazio = "Todas as lojas" → não grava id (URL limpa).
    // Single-select: grava no máx. o primeiro id.
    if (e.filialIds.length > 0) p.set("filial", e.filialIds[0]);
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