/**
 * Desafios da competência (mock determinístico).
 *
 * Tipos:
 * - quantidade — meta fixa em unidades (ex.: vender 3)
 * - produto — quem vende mais unidades (com mínimo opcional)
 * - faturamento — quem vende mais em R$ (com mínimo opcional)
 * - pa — índice P.A. (peças/atendimento)
 * - ticket — ticket médio em R$
 *
 * Nunca em reais como tipo de premiação (prêmio é o único campo monetário
 * de recompensa). Cada desafio tem janela própria (inicio/fim).
 */
import { colaboradores, vendedorElegivel } from "./equipe";

export type TipoDesafio = "produto" | "quantidade" | "faturamento" | "pa" | "ticket";
export type UnidadeDesafio = "un" | "x" | "R$";

export interface Desafio {
  id: string;
  nome: string;
  /** Frase curta do objetivo (o que precisa fazer). */
  objetivo: string;
  tipo: TipoDesafio;
  /** Alvo / piso por participante (un, índice ou R$). */
  alvoIndividual: number;
  /**
   * Mínimo para valer o desafio. null = sem piso separado (usa o alvo).
   * Em "vender mais", é o piso para concorrer; o ranking ordena pelo realizado.
   */
  minimo: number | null;
  unidade: UnidadeDesafio;
  /** R$ por participante (vendedora) que fechar o desafio. */
  premio: number;
  /**
   * R$ do gerente se a regra de loja fechar
   * (mín. N vendedoras atingindo o alvo individual).
   */
  premioGerente: number;
  /**
   * Quantas vendedoras precisam bater o alvo individual
   * para o gerente fechar. Meta gerente = este × piso/alvo.
   */
  minimoVendedorasAtingindo: number;
  /** "AAAA-MM" */
  competencia: string;
  /** Início da janela do desafio (ISO). */
  inicio: string;
  /** Fim da janela do desafio (ISO), inclusive. */
  fim: string;
  /** Produto/categoria alvo (tipo produto/quantidade), quando aplicável. */
  produtoId: number | null;
  participantes: string[];
}

/** PRNG determinístico (mulberry32) — cópia da técnica de vendas.ts. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Vendedoras ativas na competência (sem caixa, sem férias, admitidas até o
 * dia 1). Usado como pool; cada desafio escolhe o subconjunto engajado.
 */
const ATIVAS_SETEMBRO = colaboradores
  .filter(
    (c) =>
      vendedorElegivel(c) &&
      c.dataAdmissao <= "2026-09-01" &&
      (!c.dataInatividade || c.dataInatividade > "2026-09-15"),
  )
  .map((c) => c.id);

/**
 * Desafios de setembro/2026 — tipicamente 4, com status mistos no relógio
 * do mock (HOJE = 2026-09-15): encerrado, ativo, ativo, a começar.
 */
export const desafios: Desafio[] = [
  {
    id: "d-perfumaria",
    nome: "Perfumaria — 3 acima de R$ 150",
    objetivo: "Quem vender 3 perfumes acima de R$ 150 (mínimo 3 unidades) ganha R$ 50,00.",
    tipo: "quantidade",
    alvoIndividual: 3,
    minimo: 3,
    unidade: "un",
    premio: 50,
    premioGerente: 50,
    minimoVendedorasAtingindo: 3,
    competencia: "2026-09",
    inicio: "2026-09-01",
    fim: "2026-09-10",
    produtoId: 1,
    participantes: ["c01", "c02", "c07", "c11", "c12", "c14"],
  },
  {
    id: "d-bodycream",
    nome: "Body Cream — quem vender mais",
    objetivo: "Quem vender mais Body Cream (mínimo 15 unidades) ganha R$ 50,00.",
    tipo: "produto",
    alvoIndividual: 15,
    minimo: 15,
    unidade: "un",
    premio: 50,
    premioGerente: 50,
    minimoVendedorasAtingindo: 4,
    competencia: "2026-09",
    inicio: "2026-09-01",
    fim: "2026-09-30",
    produtoId: 3,
    participantes: ["c01", "c03", "c04", "c08", "c13", "c15", "c17"],
  },
  {
    id: "d-pa",
    nome: "P.A. acima de 1,90",
    objetivo: "Quem mantiver P.A. acima de 1,90 no mês (mínimo 1,90) ganha R$ 50,00.",
    tipo: "pa",
    alvoIndividual: 1.9,
    minimo: 1.9,
    unidade: "x",
    premio: 50,
    premioGerente: 50,
    minimoVendedorasAtingindo: 5,
    competencia: "2026-09",
    inicio: "2026-09-01",
    fim: "2026-09-30",
    produtoId: null,
    participantes: ATIVAS_SETEMBRO,
  },
  {
    id: "d-ticket",
    nome: "Ticket médio acima de R$ 185",
    objetivo: "Quem mantiver ticket médio acima de R$ 185 (mínimo R$ 185) ganha R$ 50,00.",
    tipo: "ticket",
    alvoIndividual: 185,
    minimo: 185,
    unidade: "R$",
    premio: 50,
    premioGerente: 50,
    minimoVendedorasAtingindo: 5,
    competencia: "2026-09",
    inicio: "2026-09-20",
    fim: "2026-09-30",
    produtoId: null,
    participantes: ATIVAS_SETEMBRO,
  },
];

/** Desafios da competência. Sem desafios: lista vazia (a tela segue). */
export function desafiosAtivos(competencia: string): Desafio[] {
  return desafios.filter((d) => d.competencia === competencia);
}

/** Piso efetivo: minimo configurado ou o próprio alvo. */
export function pisoDoDesafio(d: Desafio): number {
  return d.minimo ?? d.alvoIndividual;
}

/**
 * Meta do gerente: piso × N vendedoras que precisam atingir.
 * No escopo filtrado, N nunca passa do nº de participantes visíveis.
 */
export function alvoGerenteDoDesafio(d: Desafio, participantesNoEscopo: number): number {
  const n = Math.min(d.minimoVendedorasAtingindo, Math.max(0, participantesNoEscopo));
  return pisoDoDesafio(d) * n;
}

/**
 * Progresso rumo à meta do gerente (regra A): cada vendedora contribui no
 * máximo até o piso individual — uma não “carrega” as outras.
 */
export function progressoGerenteCapped(progressos: number[], piso: number): number {
  return progressos.reduce((s, p) => s + Math.min(Math.max(0, p), piso), 0);
}

/**
 * Progresso individual do participante no desafio, até agora (relógio do mock:
 * 15/09, 14h). un/R$: realizado; pa/ticket: valor do índice.
 * Determinístico pela chave desafio|participante.
 */
export function progressoIndividual(d: Desafio, colaboradorId: string): number {
  if (!d.participantes.includes(colaboradorId)) return 0;
  const r = prng(hash(`${d.id}|${colaboradorId}`));
  if (d.tipo === "pa" || d.tipo === "ticket") {
    const fator = 0.95 + (r() * 2 - 1) * 0.25;
    return Math.round(d.alvoIndividual * fator * 100) / 100;
  }
  if (d.tipo === "faturamento") {
    const diasDecorridos = 15;
    const diasTotais = 31;
    const base = d.alvoIndividual * (diasDecorridos / diasTotais) * (0.65 + r() * 1.1);
    return Math.max(0, Math.round(base));
  }
  // quantidade / produto: unidades inteiras (não existe 8,1 un)
  const diasDecorridos = 15;
  const diasTotais = 31;
  const base = d.alvoIndividual * (diasDecorridos / diasTotais) * (0.65 + r() * 1.1);
  return Math.max(0, Math.round(base));
}
