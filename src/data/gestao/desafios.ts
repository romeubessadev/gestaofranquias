/**
 * Desafios ativos da competência (mock determinístico). Desafio é objetivo
 * pontual de produto, quantidade ou índice — nunca em reais (regra da futura
 * tela de Configurações · Desafios). O progresso de cada participante é
 * gerado com a mesma técnica de ruído do gerador de vendas: mesma entrada,
 * mesmo valor, em qualquer dia de validação.
 */
import { colaboradores, vendedorElegivel } from "./equipe";

export type TipoDesafio = "produto" | "quantidade" | "indice";

export interface Desafio {
  id: string;
  nome: string;
  tipo: TipoDesafio;
  /** Alvo por participante: 15 un de Body Cream, 3 un de produto, 1.90 de P.A. */
  alvoIndividual: number;
  unidade: "un" | "x";
  /** R$ por participante que fechar o desafio. */
  premio: number;
  /** "AAAA-MM" */
  competencia: string;
  /** Produto alvo (tipo produto), quando aplicável. */
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

/** Participantes: vendedoras elegíveis de ambas as lojas no início do mês. */
const ELEGIVEIS_SETEMBRO = colaboradores
  .filter((c) => vendedorElegivel(c) && c.dataAdmissao <= "2026-09-01" && (!c.dataInatividade || c.dataInatividade > "2026-09-01"))
  .map((c) => c.id);

/** Desafios da competência corrente do mock (setembro/2026). */
export const desafios: Desafio[] = [
  {
    id: "d-perfumaria",
    nome: "Perfumaria — 3 acima de R$ 150",
    tipo: "produto",
    alvoIndividual: 3,
    unidade: "un",
    premio: 80,
    competencia: "2026-09",
    produtoId: 3,
    participantes: ELEGIVEIS_SETEMBRO,
  },
  {
    id: "d-bodycream",
    nome: "Body Cream — acima de 15 un",
    tipo: "quantidade",
    alvoIndividual: 15,
    unidade: "un",
    premio: 50,
    competencia: "2026-09",
    produtoId: 2,
    participantes: ELEGIVEIS_SETEMBRO,
  },
  {
    id: "d-pa",
    nome: "P.A. acima de 1,90",
    tipo: "indice",
    alvoIndividual: 1.9,
    unidade: "x",
    premio: 60,
    competencia: "2026-09",
    produtoId: null,
    participantes: ELEGIVEIS_SETEMBRO,
  },
  {
    id: "d-protocolo",
    nome: "Kit Presente — acima de 5 un",
    tipo: "produto",
    alvoIndividual: 5,
    unidade: "un",
    premio: 70,
    competencia: "2026-09",
    produtoId: 7,
    participantes: ELEGIVEIS_SETEMBRO,
  },
  {
    id: "d-serum",
    nome: "Sérum Vitamina C — acima de 8 un",
    tipo: "quantidade",
    alvoIndividual: 8,
    unidade: "un",
    premio: 45,
    competencia: "2026-09",
    produtoId: 5,
    participantes: ELEGIVEIS_SETEMBRO,
  },
  {
    id: "d-ticket",
    nome: "Ticket acima de R$ 185",
    tipo: "indice",
    alvoIndividual: 185,
    unidade: "x",
    premio: 100,
    competencia: "2026-09",
    produtoId: null,
    participantes: ELEGIVEIS_SETEMBRO,
  },
];

/** Desafios ativos na competência. Sem desafios: lista vazia (a tela segue). */
export function desafiosAtivos(competencia: string): Desafio[] {
  return desafios.filter((d) => d.competencia === competencia);
}

/**
 * Progresso individual do participante no desafio, até agora (relógio do mock:
 * 15/09, 14h). produto/quantidade: un vendidas; índice: valor do índice (P.A.).
 * Determinístico pela chave desafio|participante.
 */
export function progressoIndividual(d: Desafio, colaboradorId: string): number {
  if (!d.participantes.includes(colaboradorId)) return 0;
  const r = prng(hash(`${d.id}|${colaboradorId}`));
  // Fração do alvo já alcançada: ~metade do mês decorrida (15 dias de 31),
  // algumas pessoas à frente e outras atrás. Índice fica perto do alvo.
  if (d.tipo === "indice") {
    const fator = 0.95 + (r() * 2 - 1) * 0.25;
    return Math.round(d.alvoIndividual * fator * 100) / 100;
  }
  const diasDecorridos = 15; // 1–15/set abertos, coerente com HOJE_ISO/HORA_ATUAL
  const diasTotais = 31;
  const base = d.alvoIndividual * (diasDecorridos / diasTotais) * (0.65 + r() * 1.1);
  return Math.max(0, Math.round(base * 10) / 10);
}