/** Metas mensais por filial, com degraus configuráveis. Sempre em reais. */

export interface Degrau {
  nome: string;
  atingimentoMinPct: number;
  comissaoPct: number;
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

export const degrausPadrao: Degrau[] = [
  { nome: "Meta", atingimentoMinPct: 100, comissaoPct: 1.5, bonus: 50 },
  { nome: "Super Meta", atingimentoMinPct: 120, comissaoPct: 2.0, bonus: 100 },
  { nome: "Hiper Meta", atingimentoMinPct: 150, comissaoPct: 2.5, bonus: 150 },
  { nome: "Meta Desafio", atingimentoMinPct: 180, comissaoPct: 3.0, bonus: 200 },
];

export const metas: Meta[] = [
  { id: "m-f1-2026-07", filialId: "f1", competencia: "2026-07", nome: "Julho 2026", valorLoja: 168000, degraus: degrausPadrao },
  { id: "m-f1-2026-08", filialId: "f1", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 172000, degraus: degrausPadrao },
  { id: "m-f1-2026-09", filialId: "f1", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 185000, degraus: degrausPadrao },
  { id: "m-f2-2026-07", filialId: "f2", competencia: "2026-07", nome: "Julho 2026", valorLoja: 88000, degraus: degrausPadrao },
  { id: "m-f2-2026-08", filialId: "f2", competencia: "2026-08", nome: "Agosto 2026", valorLoja: 92000, degraus: degrausPadrao },
  { id: "m-f2-2026-09", filialId: "f2", competencia: "2026-09", nome: "Setembro 2026", valorLoja: 98000, degraus: degrausPadrao },
];

export function metaDaFilial(filialId: string, competencia: string): Meta | undefined {
  return metas.find((m) => m.filialId === filialId && m.competencia === competencia);
}
