/**
 * Desafios ativos da competência (mock determinístico). Tipos reais do
 * negócio: Produto, P.A. e Ticket médio — nunca em reais (regra da futura
 * tela de Configurações · Desafios). O progresso de cada participante é
 * gerado com a mesma técnica de ruído do gerador de vendas: mesma entrada,
 * mesmo valor, em qualquer dia de validação.
 */
import { colaboradores, vendedorElegivel } from "./equipe";

export type TipoDesafio = "produto" | "pa" | "ticket";

export interface Desafio {
  id: string;
  nome: string;
  /** Frase curta do objetivo (o que precisa fazer). */
  objetivo: string;
  tipo: TipoDesafio;
  /** Alvo por participante: 15 un, 1.90 de P.A., 185 de ticket. */
  alvoIndividual: number;
  unidade: "un" | "x";
  /** R$ por participante que fechar o desafio. */
  premio: number;
  /** "AAAA-MM" */
  competencia: string;
  /** Produto/categoria alvo (tipo produto), quando aplicável. */
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

/** Desafios da competência corrente do mock (setembro/2026) — tipicamente 4. */
export const desafios: Desafio[] = [
  {
    id: "d-perfumaria",
    nome: "Perfumaria — 3 acima de R$ 150",
    objetivo: "Quem vender 3 perfumes acima de R$ 150 (mínimo 3 unidades) ganha R$ 80,00.",
    tipo: "produto",
    alvoIndividual: 3,
    unidade: "un",
    premio: 80,
    competencia: "2026-09",
    produtoId: 1,
    participantes: ["c01", "c02", "c07", "c11", "c12", "c14"],
  },
  {
    id: "d-bodycream",
    nome: "Body Cream — acima de 15 un",
    objetivo: "Quem vender mais Body Cream (mínimo 15 unidades) ganha R$ 50,00.",
    tipo: "produto",
    alvoIndividual: 15,
    unidade: "un",
    premio: 50,
    competencia: "2026-09",
    produtoId: 3,
    participantes: ["c01", "c03", "c04", "c08", "c13", "c15", "c17"],
  },
  {
    id: "d-pa",
    nome: "P.A. acima de 1,90",
    objetivo: "Quem mantiver P.A. acima de 1,90 no mês (mínimo 1,90) ganha R$ 60,00.",
    tipo: "pa",
    alvoIndividual: 1.9,
    unidade: "x",
    premio: 60,
    competencia: "2026-09",
    produtoId: null,
    participantes: ATIVAS_SETEMBRO,
  },
  {
    id: "d-ticket",
    nome: "Ticket médio acima de R$ 185",
    objetivo: "Quem mantiver ticket médio acima de R$ 185 (mínimo R$ 185) ganha R$ 100,00.",
    tipo: "ticket",
    alvoIndividual: 185,
    unidade: "x",
    premio: 100,
    competencia: "2026-09",
    produtoId: null,
    participantes: ATIVAS_SETEMBRO,
  },
];

/** Desafios ativos na competência. Sem desafios: lista vazia (a tela segue). */
export function desafiosAtivos(competencia: string): Desafio[] {
  return desafios.filter((d) => d.competencia === competencia);
}

/**
 * Progresso individual do participante no desafio, até agora (relógio do mock:
 * 15/09, 14h). produto: un vendidas; pa/ticket: valor do índice.
 * Determinístico pela chave desafio|participante.
 */
export function progressoIndividual(d: Desafio, colaboradorId: string): number {
  if (!d.participantes.includes(colaboradorId)) return 0;
  const r = prng(hash(`${d.id}|${colaboradorId}`));
  // Fração do alvo já alcançada: ~metade do mês decorrida (15 dias de 31),
  // algumas pessoas à frente e outras atrás. Índice fica perto do alvo.
  if (d.tipo === "pa" || d.tipo === "ticket") {
    const fator = 0.95 + (r() * 2 - 1) * 0.25;
    return Math.round(d.alvoIndividual * fator * 100) / 100;
  }
  const diasDecorridos = 15; // 1–15/set abertos, coerente com HOJE_ISO/HORA_ATUAL
  const diasTotais = 31;
  const base = d.alvoIndividual * (diasDecorridos / diasTotais) * (0.65 + r() * 1.1);
  return Math.max(0, Math.round(base * 10) / 10);
}
