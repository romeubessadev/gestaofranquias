import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Divisao } from "@/data/gestao/filiais";
import type { Escopo, PeriodoTipo } from "@/data/gestao/dashboard";
import { useSessaoAtiva } from "@/session/SessionProvider";

const PERIODOS: PeriodoTipo[] = ["hoje", "ontem", "7dias", "esteMes", "mesPassado", "personalizado"];

/** Loja global — sobrevive a troca de tela mesmo quando o Link não leva `?filial=`. */
const FILIAL_STORAGE_KEY = "gestao.filial";

function lerFilialSalva(): string | null {
  try {
    return sessionStorage.getItem(FILIAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function salvarFilial(id: string) {
  try {
    sessionStorage.setItem(FILIAL_STORAGE_KEY, id);
  } catch {
    /* private mode / quota — URL ainda funciona na mesma tela */
  }
}

/**
 * Escopo (lojas, período, divisão) mora na URL, não no estado de uma página.
 * A **loja** também fica em sessionStorage: é filtro global de todas as telas
 * e os NavLinks do menu não carregam a query string.
 *
 * Single-select de loja: `filial` na URL é um id (ex.: "filial=f1").
 * Ausente / vazio = "Todas as lojas" (consolida a rede), salvo se houver
 * preferência salva (aí reidrata a loja escolhida).
 * Se a URL ainda tiver lista antiga ("f1,f2"), usa só o primeiro id.
 */
export function useEscopo() {
  const sessao = useSessaoAtiva();
  const [params, setParams] = useSearchParams();

  const escopo = useMemo<Escopo>(() => {
    const temParamFilial = params.has("filial");
    const filialRaw = params.get("filial");
    let idsRaw = filialRaw ? filialRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

    // Sem `?filial=` na URL (navegação pelo menu): recupera a última loja.
    if (!temParamFilial) {
      const salva = lerFilialSalva();
      if (salva) idsRaw = [salva];
    }

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

  // Mantém storage alinhado com a URL (bookmark / share / abas do Dashboard).
  useEffect(() => {
    if (!params.has("filial")) return;
    salvarFilial(params.get("filial")?.split(",")[0]?.trim() || "");
  }, [params]);

  // Reidrata `?filial=` na URL quando a preferência veio só do storage.
  useEffect(() => {
    if (params.has("filial")) return;
    const id = escopo.filialIds[0];
    if (!id) return;
    const p = new URLSearchParams(params);
    p.set("filial", id);
    setParams(p, { replace: true });
  }, [params, escopo.filialIds, setParams]);

  function mudar(e: Escopo) {
    const p = new URLSearchParams();
    // Array vazio = "Todas as lojas" → não grava id (URL limpa) + storage "".
    // Single-select: grava no máx. o primeiro id.
    if (e.filialIds.length > 0) {
      p.set("filial", e.filialIds[0]);
      salvarFilial(e.filialIds[0]);
    } else {
      salvarFilial("");
    }
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
