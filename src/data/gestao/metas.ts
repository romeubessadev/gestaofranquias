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

export interface Meta {
  id: string;
  filialId: string;
  /** "AAAA-MM" */
  competencia: string;
  nome: string;
  valorLoja: number;
  degraus: Degrau[];
}

/** Escada padrão: Meta → Super → Hiper → Meta Desafio (+R$ 50/nível, acumulativo). */
export const BONUS_POR_NIVEL = 50;

export const degrausPadrao: Degrau[] = [
  { nome: "Meta", atingimentoMinPct: 100, comissaoPct: 1.5, bonus: BONUS_POR_NIVEL * 1 },
  { nome: "Super Meta", atingimentoMinPct: 120, comissaoPct: 2.0, bonus: BONUS_POR_NIVEL * 2 },
  { nome: "Hiper Meta", atingimentoMinPct: 150, comissaoPct: 2.5, bonus: BONUS_POR_NIVEL * 3 },
  { nome: "Meta Desafio", atingimentoMinPct: 180, comissaoPct: 3.0, bonus: BONUS_POR_NIVEL * 4 },
];

export const metas: Meta[] = [
  // f1 (Shopping Campo Grande) = loja âncora, meta bem acima de f2
  { id: "m-f1-2026-07", filialId: "f1", competencia: "2026-07", nome: "Julho 2026", valorLoja: 240000, degraus: degrausPadrao },
  { id: "m-f1-2026-08", filialId: "f1", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 250000, degraus: degrausPadrao },
  { id: "m-f1-2026-09", filialId: "f1", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 280000, degraus: degrausPadrao },
  { id: "m-f2-2026-07", filialId: "f2", competencia: "2026-07", nome: "Julho 2026", valorLoja: 88000, degraus: degrausPadrao },
  { id: "m-f2-2026-08", filialId: "f2", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 92000, degraus: degrausPadrao },
  { id: "m-f2-2026-09", filialId: "f2", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 98000, degraus: degrausPadrao },
];

export function metaDaFilial(filialId: string, competencia: string): Meta | undefined {
  return metas.find((m) => m.filialId === filialId && m.competencia === competencia);
}
