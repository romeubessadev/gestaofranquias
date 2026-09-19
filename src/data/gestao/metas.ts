/** Metas mensais por filial, com degraus configuráveis. Sempre em reais. */

export interface Degrau {
  nome: string;
  atingimentoMinPct: number;
  /** % da premiação sobre o faturamento realizado neste degrau. */
  comissaoPct: number;
  /**
   * Bônus acumulado ao atingir este degrau.
   * Regra de produto: R$ 50 por nível (1→50, 2→100, 3→150, 4→200).
   */
  bonus: number;
}

export type MetaTipo = "individual" | "coletiva";
export type MetaMarca = "WEPINK" | "WPINK";

export interface Meta {
  id: string;
  filialId: string;
  /** "AAAA-MM" */
  competencia: string;
  nome: string;
  valorLoja: number;
  degraus: Degrau[];
  /** Individual = meta por vendedora; coletiva = meta da loja/time. */
  tipo: MetaTipo;
  /**
   * Marcas cobertas pela meta.
   * Ambas (WEPINK+WPINK) = meta de loja/mix completo; uma só = meta de marca.
   */
  marcas: MetaMarca[];
}

/**
 * Escada padrão (demo / default de fábrica).
 * Tipicamente: Meta 50% → Super 75% → Hiper 100% (= meta da loja) → Desafio 110%.
 * Não é regra fixa — a loja configura os % na tela de Metas.
 */
export const BONUS_POR_NIVEL = 50;

export const degrausPadrao: Degrau[] = [
  { nome: "Meta", atingimentoMinPct: 50, comissaoPct: 1.5, bonus: BONUS_POR_NIVEL * 1 },
  { nome: "Super Meta", atingimentoMinPct: 75, comissaoPct: 2.0, bonus: BONUS_POR_NIVEL * 2 },
  { nome: "Hiper Meta", atingimentoMinPct: 100, comissaoPct: 2.5, bonus: BONUS_POR_NIVEL * 3 },
  { nome: "Meta Desafio", atingimentoMinPct: 110, comissaoPct: 3.0, bonus: BONUS_POR_NIVEL * 4 },
];

const AMBAS: MetaMarca[] = ["WEPINK", "WPINK"];

export const metas: Meta[] = [
  // f1 (Shopping Campo Grande) = loja âncora, meta acima de f2.
  // Valores calibrados ao gerador de vendas (MTD ~ metade do mês ≈ 50% da meta).
  { id: "m-f1-2026-07", filialId: "f1", competencia: "2026-07", nome: "Julho 2026", valorLoja: 158000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
  { id: "m-f1-2026-08", filialId: "f1", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 162000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
  { id: "m-f1-2026-09", filialId: "f1", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 170000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
  // Meta de marca paralela (demo de N cards no Ao vivo).
  { id: "m-f1-2026-09-wpink", filialId: "f1", competencia: "2026-09", nome: "Meta WPINK", valorLoja: 32000, degraus: degrausPadrao.slice(0, 3), tipo: "individual", marcas: ["WPINK"] },
  { id: "m-f2-2026-07", filialId: "f2", competencia: "2026-07", nome: "Julho 2026", valorLoja: 88000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
  { id: "m-f2-2026-08", filialId: "f2", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 92000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
  { id: "m-f2-2026-09", filialId: "f2", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 98000, degraus: degrausPadrao, tipo: "coletiva", marcas: AMBAS },
];

/** Todas as metas da loja na competência (pode haver mais de uma — ex.: loja + marca). */
export function metasDaFilial(filialId: string, competencia: string): Meta[] {
  return metas.filter((m) => m.filialId === filialId && m.competencia === competencia);
}

/**
 * Meta “principal” da loja (coletiva / mix completo).
 * Usada por KPIs, dashboard e escada — não mistura com metas de marca.
 */
export function metaDaFilial(filialId: string, competencia: string): Meta | undefined {
  const list = metasDaFilial(filialId, competencia);
  return (
    list.find((m) => m.tipo === "coletiva" && m.marcas.length !== 1) ??
    list.find((m) => m.tipo === "coletiva") ??
    list[0]
  );
}
