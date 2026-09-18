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
 *
 * Progresso individual é fixture explícita (não PRNG) para a demo cobrir
 * barras vermelha / amarela / verde com valores realistas por tipo.
 */
import { colaboradores, vendedorElegivel } from "./equipe";
import { HOJE_ISO } from "./relogio";

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
   * para o gerente fechar. Meta gerente = este × piso/alvo (tipos un/R$ soma).
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
 *
 * Barras agregadas (régua ProgressBar):
 * - Perfumaria (encerrado) → vermelha (~44%)
 * - Body Cream (ativo) → amarela (~70%)
 * - P.A. (ativo) → verde (~média 1,80 / 1,90)
 * - Ticket (a começar) → 0% (ainda não começou)
 */
export const desafios: Desafio[] = [
  {
    id: "d-perfumaria",
    nome: "Perfumaria — 3 acima de R$ 150",
    objetivo: "Vender 3 perfumes acima de R$ 150 e ganhar R$ 50,00.",
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
    objetivo: "Quem vender mais Body Cream (mínimo 15 un) ganha R$ 50,00.",
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
    objetivo: "Manter P.A. acima de 1,90 no mês e ganhar R$ 50,00.",
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
    objetivo: "Manter ticket médio acima de R$ 185 e ganhar R$ 50,00.",
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

/**
 * Progresso fixo por participante — valores na unidade do desafio.
 * Cobrem <50% (vermelho), 50–79% (amarelo) e ≥80% (verde) nas barras.
 */
const PROGRESSO_FIXO: Record<string, Record<string, number>> = {
  // Encerrado: poucos fecharam → agregado gerente vermelho (~44%).
  "d-perfumaria": {
    c01: 2, // 67% amarelo
    c02: 1, // 33% vermelho
    c07: 0,
    c11: 1, // 33%
    c12: 0,
    c14: 0,
  },
  // Ativo: ritmo médio → agregado gerente amarelo (~70%).
  "d-bodycream": {
    c01: 9, // 60% amarelo
    c03: 8, // 53%
    c04: 7, // 47% vermelho
    c08: 6, // 40%
    c13: 5, // 33%
    c15: 4, // 27%
    c17: 3, // 20%
  },
  // Ativo: média da equipe ~1,85 (barra = média/1,90 → ~97% verde).
  // Poucas no 100% no topo; o resto espalha amarelo/vermelho (não parece "todas batendo").
  "d-pa": {
    c01: 2.05, // atingiu
    c02: 1.98, // atingiu
    c03: 1.92, // atingiu
    c04: 1.88, // quase
    c05: 1.85,
    c07: 1.82,
    c08: 1.78,
    c11: 1.72,
    c12: 1.65, // amarelo
    c13: 1.55,
    c14: 1.42,
    c15: 1.15, // vermelho-ish 61%
    c16: 0.95, // vermelho
    c17: 0.78,
  },
  // A começar (20/09): sem progresso até a janela abrir.
  "d-ticket": {},
};

/** Desafios da competência. Sem desafios: lista vazia (a tela segue). */
export function desafiosAtivos(competencia: string): Desafio[] {
  return desafios.filter((d) => d.competencia === competencia);
}

/** Piso efetivo: minimo configurado ou o próprio alvo. */
export function pisoDoDesafio(d: Desafio): number {
  return d.minimo ?? d.alvoIndividual;
}

/** P.A. e ticket são índices — agregação por média, não por soma. */
export function desafioEhIndice(d: Pick<Desafio, "tipo">): boolean {
  return d.tipo === "pa" || d.tipo === "ticket";
}

/**
 * Meta do gerente (tipos un / R$ soma): piso × N vendedoras que precisam atingir.
 * No escopo filtrado, N nunca passa do nº de participantes visíveis.
 * Para índices (pa/ticket), a UI usa o próprio piso como alvo da média.
 */
export function alvoGerenteDoDesafio(d: Desafio, participantesNoEscopo: number): number {
  if (desafioEhIndice(d)) return pisoDoDesafio(d);
  const n = Math.min(d.minimoVendedorasAtingindo, Math.max(0, participantesNoEscopo));
  return pisoDoDesafio(d) * n;
}

/**
 * Progresso rumo à meta do gerente (regra A, tipos un/R$): cada vendedora
 * contribui no máximo até o piso individual — uma não “carrega” as outras.
 */
export function progressoGerenteCapped(progressos: number[], piso: number): number {
  return progressos.reduce((s, p) => s + Math.min(Math.max(0, p), piso), 0);
}

/** Média aritmética (índices pa/ticket). */
export function mediaProgressos(progressos: number[]): number {
  if (progressos.length === 0) return 0;
  return progressos.reduce((s, p) => s + Math.max(0, p), 0) / progressos.length;
}

/**
 * Progresso individual do participante no desafio.
 * Antes do início da janela → 0. Determinístico via fixture.
 */
export function progressoIndividual(d: Desafio, colaboradorId: string): number {
  if (!d.participantes.includes(colaboradorId)) return 0;
  if (HOJE_ISO < d.inicio) return 0;
  const fixo = PROGRESSO_FIXO[d.id]?.[colaboradorId];
  if (fixo != null) return fixo;
  return 0;
}
