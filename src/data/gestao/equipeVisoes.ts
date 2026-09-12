/**
 * Camada de visões da aba Equipe (EQUIP-01..07). Mesma arquitetura da Visão
 * geral: `montarEquipeView(escopo)` calcula tudo e a página só monta blocos.
 * Fica em arquivo próprio porque vendas.ts consome o cadastro de colaboradores
 * (equipe.ts) no boot — importar a camada de views daqui evita ciclo.
 *
 * Regra AD-046: meta, escada, premiação e desafios são SEMPRE do mês da
 * competência (mês corrente, ou mês passado se o filtro for “Mês passado”) e
 * permanecem visíveis. Os 4 KPIs de desempenho obedecem ao período filtrado.
 * Quando o período ≠ competência, um aviso deixa o recorte explícito.
 */
import { vendedorElegivel, colaboradoresDaFilial, type Colaborador } from "./equipe";
import { metaDaFilial, type Degrau } from "./metas";
import { desafiosAtivos, progressoIndividual, type Desafio } from "./desafios";
import { HOJE_ISO, HORA_ATUAL } from "./relogio";
import { agregadoDoDia, diaVendas, lojaAberta, somarAgregados, type Agregado } from "./vendas";
import { filialPorId, filiais, type Filial } from "./filiais";
import { brlK, curvaReceita, kpiDelta, periodoAnterior, resolverPeriodo, type Escopo, type PeriodoResolvido, type EstadoBloco } from "./dashboard";
import { brl, fimDoMes, intervaloDias, mesAno, num, somarDias } from "@/lib/formato";
import type { TintKey } from "@/pages/dashboards/icons";

const PALETA_LOJAS: TintKey[] = ["acc", "ok", "info", "warn", "bad"];

function divSeguro(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

/* ------------------------- Elegibilidade e meta individual (EQUIP-03) ------------------------- */

/** Vendedora elegível presente na loja no dia (admissão ≤ dia < inatividade). */
export function presenteNoDia(c: Colaborador, iso: string): boolean {
  if (!vendedorElegivel(c)) return false;
  if (c.dataAdmissao > iso) return false;
  if (c.dataInatividade && c.dataInatividade <= iso) return false;
  return true;
}

/** Dias abertos da loja em que a vendedora estava presente, dentro do intervalo. */
function diasElegiveis(c: Colaborador, filial: Filial, inicio: string, fim: string): string[] {
  const primeiro = c.dataAdmissao > inicio ? c.dataAdmissao : inicio;
  const ultimo = c.dataInatividade && c.dataInatividade <= fim ? somarDias(c.dataInatividade, -1) : fim;
  if (primeiro > ultimo) return [];
  return intervaloDias(primeiro, ultimo).filter((iso) => lojaAberta(filial, iso));
}

/** Vendedoras elegíveis presentes na loja no mês (base de listas e somas). */
export function vendedorasDaLoja(filialId: string, competencia: string): Colaborador[] {
  const primeiroMes = `${competencia}-01`;
  return colaboradoresDaFilial(filialId).filter((c) => presenteNoDia(c, primeiroMes) || presenteNoDia(c, HOJE_ISO));
}

export interface MetaIndividual {
  valor: number;
  /** Admissão ou inatividade no meio do mês: meta proporcional aos dias elegíveis. */
  proporcional: boolean;
  diasElegiveis: number;
  /** Dias abertos da loja no mês inteiro — base da proporcionalidade. */
  diasAbertosMes: number;
}

/**
 * Meta individual derivada: meta da loja distribuída pelo peso de venda das
 * elegíveis. Período parcial (admissão/inatividade no meio do mês): o peso
 * fica proporcional aos dias elegíveis e a meta é redistribuída entre todas —
 * a soma das individuais fecha com a meta da loja em qualquer composição.
 */
export function metaIndividual(c: Colaborador, filialId: string, competencia: string): MetaIndividual | null {
  const meta = metaDaFilial(filialId, competencia);
  if (!meta) return null;
  const filial = filialPorId(filialId);
  const primeiroMes = `${competencia}-01`;
  const ultimoMes = fimDoMes(primeiroMes);
  const elegiveisMes = vendedorasDaLoja(filialId, competencia);
  if (elegiveisMes.length === 0) return null;

  const diasAbertosMes = intervaloDias(primeiroMes, ultimoMes).filter((iso) => lojaAberta(filial, iso)).length;
  const dias = diasElegiveis(c, filial, primeiroMes, ultimoMes);
  const pesoAjustado = c.pesoVenda * (diasAbertosMes > 0 ? dias.length / diasAbertosMes : 0);
  const somaPesosAjustados = elegiveisMes.reduce((s, x) => {
    const d = diasElegiveis(x, filial, primeiroMes, ultimoMes);
    return s + x.pesoVenda * (diasAbertosMes > 0 ? d.length / diasAbertosMes : 0);
  }, 0);
  if (somaPesosAjustados <= 0) return null;
  const valor = (meta.valorLoja * pesoAjustado) / somaPesosAjustados;
  return { valor, proporcional: dias.length < diasAbertosMes, diasElegiveis: dias.length, diasAbertosMes };
}

/* ------------------------- Agregado por vendedora (EQUIP-02) ------------------------- */

export interface AgregadoVendedora {
  colaboradorId: string;
  faturamento: number;
  atendimentos: number;
  itens: number;
  diasTrabalhados: number;
}

/** Agregado da vendedora no período (respeitando a fração do dia de hoje). */
export function agregadoVendedoraPeriodo(c: Colaborador, filialId: string, inicio: string, fim: string): AgregadoVendedora {
  const out = { colaboradorId: c.id, faturamento: 0, atendimentos: 0, itens: 0, diasTrabalhados: 0 };
  for (const iso of intervaloDias(inicio, fim)) {
    if (!presenteNoDia(c, iso)) continue;
    const dia = diaVendas(filialId, iso);
    if (!dia) continue;
    // Hoje incompleto: o gerador já trunca porHora na hora atual; o total do
    // dia, não. Recorte a fatia da vendedora pela fração do dia realizada.
    const horaMax = iso === HOJE_ISO ? HORA_ATUAL : undefined;
    const totalDia = agregadoDoDia(dia, null, horaMax);
    const doDia = dia.porVendedora[c.id];
    if (!doDia || totalDia.faturamento <= 0) continue;
    const fr = totalDia.faturamento / dia.total.faturamento;
    const faturamento = Math.round(doDia.faturamento * fr);
    const atendimentos = Math.round(doDia.atendimentos * fr);
    const itens = Math.round(doDia.itens * fr);
    if (faturamento > 0 || atendimentos > 0) out.diasTrabalhados += 1;
    out.faturamento += faturamento;
    out.atendimentos += atendimentos;
    out.itens += itens;
  }
  return out;
}

/* ------------------------- Escada de degraus (EQUIP-04) ------------------------- */

export interface EscadaLinha {
  /** Degrau alcançado (maior minPct ≤ atingimento); null antes do primeiro. */
  degrau: Degrau | null;
  /** Premiação da escada: realizado × pct do degrau ÷ 100 (paga como premiação, AD-041). */
  premiacao: number;
  /** Bônus do degrau — só entra quando o degrau é alcançado. */
  bonus: number;
  /** Próximo degrau, quanto falta e o que ele passa a pagar; null no último. */
  proximo: { nome: string; faltaValor: number; pctPremiacao: number; bonus: number; atingMinPct: number } | null;
}

/** Escada de degraus da Meta customizada da filial (não a padrão global). */
export function degrausDaFilial(filialId: string, competencia: string): Degrau[] {
  return metaDaFilial(filialId, competencia)?.degraus ?? [];
}

/**
 * Posição na escada: degrau alcançado pelo atingimento individual, premiação
 * acumulada e bônus, e quanto falta pro próximo degrau. Sem degrau a
 * premiação é 0 — a vendedora só premia ao entrar no primeiro degrau.
 * (O usuário paga tudo como premiação, não como comissão — AD-041.)
 */
export function escadaVendedora(
  realizado: number,
  metaInd: MetaIndividual | null,
  degraus: Degrau[],
): EscadaLinha | null {
  if (!metaInd || metaInd.valor <= 0) return null;
  const atingPct = (realizado / metaInd.valor) * 100;
  let degrau: Degrau | null = null;
  for (const d of degraus) {
    if (atingPct >= d.atingimentoMinPct) degrau = d;
    else break;
  }
  const idx = degrau ? degraus.indexOf(degrau) : -1;
  const premiacao = degrau ? (realizado * degrau.comissaoPct) / 100 : 0;
  const bonus = degrau ? degrau.bonus : 0;
  const seguinte = idx + 1 < degraus.length ? degraus[idx + 1] : null;
  const proximo = seguinte
    ? {
        nome: seguinte.nome,
        faltaValor: Math.max(0, (metaInd.valor * seguinte.atingimentoMinPct) / 100 - realizado),
        pctPremiacao: seguinte.comissaoPct,
        bonus: seguinte.bonus,
        atingMinPct: seguinte.atingimentoMinPct,
      }
    : null;
  return { degrau, premiacao, bonus, proximo };
}

/* ------------------------- Tipos da visão ------------------------- */

export interface KpiEquipeValor {
  valor: string;
  delta: { value: string; positive: boolean; vs?: string } | undefined;
}

export interface VendedoraLinha {
  colaboradorId: string;
  nome: string;
  /** Filial da vendedora — necessária na visão rede (coluna Shopping). */
  filialId: string;
  filialNome: string;
  faturamentoValor: number;
  faturamento: string;
  atendimentos: number;
  ticketValor: number;
  ticket: string;
  paValor: number;
  pa: string;
  diasTrabalhados: number;
  tendencia: "subindo" | "estavel" | "caindo";
  // Meta individual (só com meta ativa; sem meta ficam zerados e semMeta=true)
  metaIndividualValor: number;
  metaProporcional: boolean;
  diasElegiveis: number;
  atingimentoPct: number;
  barraPct: number;
  /** Marcos da escada p/ barra segmentada: { nome, pct, bonus, pctPremiacao }. */
  marcosEscada: { nome: string; pct: number; pctPremiacao: number; bonus: number }[];
  degrauAtual: string | null;
  proximoDegrau: { nome: string; faltaValor: number; pctPremiacao: number; bonus: number; atingMinPct: number } | null;
  /** Premiação acumulada da escada de metas (realizado × pct do degrau). */
  premiacaoAcumulada: number;
  /** Premiação projetada pelo ritmo: realizado escalado × pct do degrau projetado. */
  premiacaoProjetadaIndividual: number | null;
  /** Atingimento projetado pelo ritmo da competência (100 = fecha a meta). */
  atingimentoProjetadoPct: number | null;
  bonusAlcancado: number;
  // Atenção — um ponto por vendedora, na ordem de prioridade do mockup.
  atencao: { tipo: "pa" | "ritmo" | "preco"; texto: string; detalhe: string } | null;
  semMeta: boolean;
}

export interface DesafioView {
  id: string;
  nome: string;
  tipo: Desafio["tipo"];
  alvoIndividual: number;
  unidade: "un" | "x";
  premio: number;
  participantes: number;
  engajadas: number;
  progressoAgregado: number;
  alvoAgregado: number;
  progressoPct: number;
  /** Projeção linear até o fim do período alcança o alvo agregado. */
  fechaNoRitmo: boolean;
  /** Ninguém fez progresso ainda: estado "sem engajamento" (EQUIP-05 AC 3). */
  semEngajamento: boolean;
  /** Rótulo curto do tipo pro filtro visual da tabela. */
  tipoTexto: string;
}

export interface LojaEquipeResumo {
  filialId: string;
  nome: string;
  tint: TintKey;
  faturamento: string;
  ticket: string;
  pa: string;
  premiacaoProjetada: string;
  /** Meta da loja na competência (0 se sem meta). */
  metaValor: number;
  /** Realizado da loja no período. */
  realizadoValor: number;
  /** Meta da loja / meta global × 100 (0 se meta global = 0). */
  pctMetaGlobal: number;
  melhor: { nome: string; atingimentoPct: number } | null;
  pior: { nome: string; atingimentoPct: number } | null;
}

export interface EstadosEquipeView {
  kpis: EstadoBloco;
  leitura: EstadoBloco;
  vendedoras: EstadoBloco;
  desafios: EstadoBloco;
}

export interface RedeMetaGlobal {
  /** "Setembro 2026" */
  competTexto: string;
  /** Faturamento da rede na competência. */
  realizado: number;
  /** Soma das metas das lojas do escopo com meta. */
  total: number;
  /** realizado / total × 100. */
  pct: number;
  /** Projeção da rede pelo índice de desempenho acumulado (AD-021). */
  projetadoPct: number;
  /** Dias abertos da competência a partir de hoje (incluindo hoje). */
  diasRestantes: number;
}

export interface EquipeView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  visao: "loja" | "rede";
  competencia: string;
  /** Há meta na competência: escada/premiação/desafios entram (AD-046 — independente do filtro de período). */
  metaAtiva: boolean;
  avisoCompetencia: string | null;
  avisos: string[];
  kpiFaturamento: KpiEquipeValor;
  kpiAtendimentos: KpiEquipeValor;
  kpiTicket: KpiEquipeValor;
  kpiPA: KpiEquipeValor;
  /**
   * Premiação projetada — VERBA ÚNICA (decisão do usuário: paga tudo como
   * premiação, nunca como comissão): escada de metas + prêmios dos desafios
   * que fecham. null sem meta ativa (vira 4 KPIs).
   */
  kpiPremiacao: KpiEquipeValor | null;
  /** Faixa global da rede — só em visão rede com meta ativa. */
  metaGlobal: RedeMetaGlobal | null;
  leitura: string | null;
  vendedoras: VendedoraLinha[] | null;
  lojas: LojaEquipeResumo[] | null;
  desafios: DesafioView[] | null;
  estados: EstadosEquipeView;
}

/* ------------------------- Loja: KPIs e lista ------------------------- */

/** Agregado da loja no período, com o dia de hoje truncado na hora atual. */
function agregadoLoja(filialId: string, inicio: string, fim: string): Agregado {
  return somarAgregados(
    intervaloDias(inicio, fim).map((iso) => {
      const dia = diaVendas(filialId, iso);
      if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
      return agregadoDoDia(dia, null, iso === HOJE_ISO ? HORA_ATUAL : undefined);
    }),
  );
}

/** Tendência: últimos 7 dias vs. 7 anteriores da vendedora; ±5% = estável. */
function tendenciaVendedora(c: Colaborador, filialId: string, fimIso: string): VendedoraLinha["tendencia"] {
  const soma = (inicio: string, fim: string) =>
    intervaloDias(inicio, fim).reduce((s, iso) => s + agregadoVendedoraPeriodo(c, filialId, iso, iso).faturamento, 0);
  const ultimos = soma(somarDias(fimIso, -6), fimIso);
  const anteriores = soma(somarDias(fimIso, -13), somarDias(fimIso, -7));
  if (anteriores <= 0 || ultimos <= 0) return "estavel";
  const v = ((ultimos - anteriores) / anteriores) * 100;
  if (v > 5) return "subindo";
  if (v < -5) return "caindo";
  return "estavel";
}

/** Lista de vendedoras da loja com desempenho do período + meta quando ativa. */
function visaoVendedoras(filialId: string, periodo: PeriodoResolvido, metaAtiva: boolean, competencia: string): VendedoraLinha[] {
  const filial = filialPorId(filialId);
  const agLoja = agregadoLoja(filialId, periodo.inicio, periodo.fim);
  const paMedioLoja = divSeguro(agLoja.itens, agLoja.atendimentos);
  const degraus = degrausDaFilial(filialId, competencia);

  return vendedorasDaLoja(filialId, competencia)
    .map((c) => {
    const ag = agregadoVendedoraPeriodo(c, filialId, periodo.inicio, periodo.fim);
    const ticket = divSeguro(ag.faturamento, ag.atendimentos);
    const pa = divSeguro(ag.itens, ag.atendimentos);
    const metaInd = metaAtiva ? metaIndividual(c, filialId, competencia) : null;
    const escada = metaInd ? escadaVendedora(ag.faturamento, metaInd, degraus) : null;
    const tendencia = tendenciaVendedora(c, filialId, periodo.fim);

    // Projeção do fechamento individual: realizado escalado pela fração da
    // curva de receita já decorrida da competência (mesma base do Dashboard).
    const fechado = fimDoMes(`${competencia}-01`) < HOJE_ISO;
    let projecaoFinal = 0;
    if (metaInd && metaInd.valor > 0 && !fechado) {
      const curva = curvaReceita([filial], competencia);
      let fracaoAcum = 0;
      for (const iso of intervaloDias(`${competencia}-01`, HOJE_ISO)) fracaoAcum += curva.peso(iso);
      if (fracaoAcum > 0) projecaoFinal = ag.faturamento / fracaoAcum;
    }
    const atingProjPct = metaInd && metaInd.valor > 0 ? (projecaoFinal / metaInd.valor) * 100 : 0;
    const degrauProjetado = (() => {
      let d: Degrau | null = null;
      for (const g of degraus) {
        if (atingProjPct >= g.atingimentoMinPct) d = g;
        else break;
      }
      return d;
    })();

    // Premiação projetada individual (EQUIP-04): projeção × pct do degrau
    // projetado + bônus já garantido. Mês fechado: o que de fato veio.
    const premiacaoProjetadaIndividual =
      metaInd && metaInd.valor > 0
        ? fechado
          ? (escada?.premiacao ?? 0) + (escada?.bonus ?? 0)
          : projecaoFinal > 0
            ? (projecaoFinal * (degrauProjetado?.comissaoPct ?? 0)) / 100 + (escada?.bonus ?? 0)
            : null
        : null;

    // Ponto de atenção — um por vendedora, prioridade do mockup: P.A. ≥5%
    // abaixo da média da loja → tendência caindo (com leitura de ritmo).
    let atencao: VendedoraLinha["atencao"] = null;
    if (metaInd && metaInd.valor > 0) {
      const paAbaixoPct = paMedioLoja > 0 && pa > 0 && pa < paMedioLoja * 0.95 ? (pa / paMedioLoja - 1) * 100 : null;
      if (paAbaixoPct !== null) {
        atencao = { tipo: "pa", texto: `P.A. ${num(pa, 2)}`, detalhe: `${num(Math.abs(paAbaixoPct), 0)}% abaixo` };
      } else if (tendencia === "caindo") {
        atencao =
          atingProjPct < 100
            ? { tipo: "ritmo", texto: "Ritmo", detalhe: `projeta ${num(atingProjPct, 0)}% da meta` }
            : { tipo: "ritmo", texto: "Ritmo", detalhe: "caindo, mas fecha no ritmo" };
      }
    }

    return {
      colaboradorId: c.id,
      nome: c.nome,
      filialId,
      filialNome: filial.fantasia,
      faturamentoValor: ag.faturamento,
      faturamento: brl(ag.faturamento),
      atendimentos: ag.atendimentos,
      ticketValor: ticket,
      ticket: brl(ticket),
      paValor: pa,
      pa: num(pa, 2),
      diasTrabalhados: ag.diasTrabalhados,
      tendencia,
      metaIndividualValor: metaInd?.valor ?? 0,
      metaProporcional: metaInd?.proporcional ?? false,
      diasElegiveis: metaInd?.diasElegiveis ?? 0,
      atingimentoPct: metaInd && metaInd.valor > 0 ? (ag.faturamento / metaInd.valor) * 100 : 0,
      barraPct: metaInd && metaInd.valor > 0 ? Math.min(100, (ag.faturamento / metaInd.valor) * 100) : 0,
      // Marcos da escada para a barra segmentada do mockup (posição % de cada
      // degrau + % de premiação que ele paga acima dele).
      marcosEscada: degraus.map((d) => ({ nome: d.nome, pct: d.atingimentoMinPct, pctPremiacao: d.comissaoPct, bonus: d.bonus })),
      degrauAtual: escada?.degrau?.nome ?? null,
      proximoDegrau: escada?.proximo ?? null,
      premiacaoAcumulada: escada?.premiacao ?? 0,
      premiacaoProjetadaIndividual,
      /** Atingimento projetado pelo ritmo da competência (100 = fecha). */
      atingimentoProjetadoPct: metaInd && metaInd.valor > 0 && !fechado && projecaoFinal > 0 ? atingProjPct : null,
      bonusAlcancado: escada?.bonus ?? 0,
      atencao,
      semMeta: !metaInd || metaInd.valor <= 0,
    };
    })
    // Ordena por atingimento (meta ativa) ou faturamento; zeros no fim.
    .sort((a, b) => {
      const ka = metaAtiva && !a.semMeta ? a.atingimentoPct : a.faturamentoValor;
      const kb = metaAtiva && !b.semMeta ? b.atingimentoPct : b.faturamentoValor;
      return kb - ka;
    });
}

/* ------------------------- Desafios (EQUIP-05) ------------------------- */

const TIPO_TEXTO: Record<Desafio["tipo"], string> = { produto: "Produto", quantidade: "Quantidade", indice: "Índice" };

/** Veredito de ritmo: projeção linear do progresso agregado até o fim do período. */
function desafioView(d: Desafio, diasDecorridos: number, diasTotais: number): DesafioView {
  const progressos = d.participantes.map((id) => progressoIndividual(d, id));
  const progressoAgregado = progressos.reduce((s, p) => s + p, 0);
  const alvoAgregado = d.alvoIndividual * d.participantes.length;
  const projetado = diasDecorridos > 0 ? (progressoAgregado / diasDecorridos) * diasTotais : 0;
  const semEngajamento = progressoAgregado <= 0;
  return {
    id: d.id,
    nome: d.nome,
    tipo: d.tipo,
    alvoIndividual: d.alvoIndividual,
    unidade: d.unidade,
    premio: d.premio,
    participantes: d.participantes.length,
    engajadas: progressos.filter((p) => p > 0).length,
    progressoAgregado,
    alvoAgregado,
    progressoPct: alvoAgregado > 0 ? (progressoAgregado / alvoAgregado) * 100 : 0,
    fechaNoRitmo: semEngajamento ? false : projetado >= alvoAgregado,
    semEngajamento,
    tipoTexto: TIPO_TEXTO[d.tipo],
  };
}

function diasAbertosDaCompetencia(competencia: string, filiaisIds: string[]): { decorridos: number; totais: number } {
  const primeiro = `${competencia}-01`;
  const ultimo = fimDoMes(primeiro);
  const abertos = intervaloDias(primeiro, ultimo).filter((iso) => filiaisIds.some((id) => lojaAberta(filialPorId(id), iso)));
  const decorridos = abertos.filter((iso) => iso <= HOJE_ISO).length;
  return { decorridos, totais: abertos.length };
}

/* ------------------------- Premiação projetada (EQUIP-04/05) ------------------------- */

/**
 * Fonte 1 — escada de metas da filial (EQUIP-04): realizado de cada vendedora
 * escalado pelo ritmo da loja até o fim do mês (fração acumulada da curva —
 * equivale a "realizado + restante × índice de desempenho"), pago pelo degrau
 * que a projeção alcança. Bônus entra uma única vez, só de degrau já alcançado
 * (risco D4). Competência encerrada: premiação final do mês.
 * null quando não há meta na competência (a escada não paga nada).
 */
function premiacaoEscada(filialId: string, competencia: string, vendedoras: VendedoraLinha[]): number | null {
  const meta = metaDaFilial(filialId, competencia);
  if (!meta) return null;
  const filial = filialPorId(filialId);
  const primeiro = `${competencia}-01`;
  const fechado = fimDoMes(primeiro) < HOJE_ISO;

  if (fechado) {
    return vendedoras.reduce((s, l) => s + l.premiacaoAcumulada + l.bonusAlcancado, 0);
  }

  const curva = curvaReceita([filial], competencia);
  let fracaoAcum = 0;
  for (const iso of intervaloDias(primeiro, HOJE_ISO)) fracaoAcum += curva.peso(iso);
  if (fracaoAcum <= 0) return null;

  let total = 0;
  for (const l of vendedoras) {
    if (l.semMeta || l.metaIndividualValor <= 0) continue;
    // Realizado escalado: hoje está em fracaoAcum do mês → projeção linear
    // pelo mesmo índice de desempenho acumulado do Dashboard (LOJA-03).
    const projecaoFinal = l.faturamentoValor / fracaoAcum;
    const atingPct = (projecaoFinal / l.metaIndividualValor) * 100;
    let degrau: Degrau | null = null;
    for (const d of meta.degraus) {
      if (atingPct >= d.atingimentoMinPct) degrau = d;
      else break;
    }
    const pctDegrau = degrau?.comissaoPct ?? 0;
    total += (projecaoFinal * pctDegrau) / 100 + l.bonusAlcancado;
  }
  return total;
}

/**
 * Fonte 2 — desafios (EQUIP-05): prêmio de cada participante cuja projeção
 * linear do progresso fecha o alvo individual (mesma projeção do
 * `desafioView`). Desafio é da COMPETÊNCIA, não da loja: na visão rede entra
 * uma única vez. Competência encerrada: prêmio dos que de fato fecharam.
 */
function premiacaoDesafios(competencia: string, filiaisIds: string[]): number {
  const { decorridos, totais } = diasAbertosDaCompetencia(competencia, filiaisIds);
  let total = 0;
  const fechado = fimDoMes(`${competencia}-01`) < HOJE_ISO;
  for (const d of desafiosAtivos(competencia)) {
    for (const id of d.participantes) {
      const p = progressoIndividual(d, id);
      if (p <= 0) continue;
      const venceAgora = p >= d.alvoIndividual;
      if (fechado) {
        total += venceAgora ? d.premio : 0;
      } else if (decorridos > 0) {
        const projetado = (p / decorridos) * totais;
        if (projetado >= d.alvoIndividual) total += d.premio;
      }
    }
  }
  return total;
}

/**
 * KPI da visão loja: escada da loja + desafios. Os desafios são da
 * competência inteira; a visão rede soma a escada de todas e os desafios uma
 * única vez (ver visaoRede).
 */
function premiacaoProjetada(filialId: string, competencia: string, vendedoras: VendedoraLinha[]): number | null {
  const escada = premiacaoEscada(filialId, competencia, vendedoras);
  const desafios = premiacaoDesafios(competencia, [filialId]);
  if (escada === null) return desafios > 0 ? desafios : null;
  return escada + desafios;
}

/* ------------------------- Leitura da IA (EQUIP-06) ------------------------- */

/**
 * Leitura da aba: no produto o LLM redige a partir dos números; aqui a frase
 * é montada por regra, com o padrão do leitura.ts do Dashboard. Até 2 linhas:
 * (a) efeito de ticket/P.A. da equipe no período e (b) destaque de quem está
 * abaixo da meta e caindo. Só diz o que os números da tela não dizem.
 */
function montarLeituraEquipe(v: EquipeView): string | null {
  const partes: string[] = [];
  const linhas = v.vendedoras ?? [];

  // Linha (a): efeito de ticket/P.A. — só quando o delta diz algo.
  const pa = v.kpiPA.delta;
  const ticket = v.kpiTicket.delta;
  if (pa && !pa.positive && ticket && !ticket.positive) {
    partes.push(`A equipe está vendendo menos peças por atendimento (P.A. ${pa.value}): o segundo produto está ficando na prateleira — reforçar a oferta de segunda peça e kit no caixa.`);
  } else if (pa && !pa.positive) {
    partes.push(`P.A. da equipe caiu ${pa.value} contra o período anterior: menos peças por venda, mesmo com o ticket segurando.`);
  }

  // Linha (b): quem está abaixo da meta e caindo (omitida quando ninguém).
  // Só com meta ativa: sem meta no período não existe "abaixo da meta".
  if (v.metaAtiva) {
    const emRisco = linhas.filter((l) => l.atingimentoPct < 100 && l.tendencia === "caindo");
    if (emRisco.length > 0) {
      const nomes = emRisco.map((l) => primeiroNome(l.nome)).join(", ");
      const acao = emRisco.length === 1 ? `Vale uma conversa hoje com ${primeiroNome(emRisco[0].nome)}` : "Vale conversar com cada uma hoje";
      partes.push(`${nomes} ${emRisco.length === 1 ? "está" : "estão"} abaixo da meta individual e caindo. ${acao}.`);
    }
  }
  return partes.length > 0 ? partes.join(" ") : null;
}

function primeiroNome(nomeCompleto: string): string {
  return nomeCompleto.split(" ")[0];
}

/* ------------------------- Visão loja ------------------------- */

function visaoLoja(escopo: Escopo, periodo: PeriodoResolvido, periodoMeta: PeriodoResolvido, competencia: string, metaAtiva: boolean): EquipeView {
  const filialId = escopo.filialIds.length === 1 ? escopo.filialIds[0] : filiais[0]?.id ?? "";
  const filial = filialPorId(filialId);
  const ant = periodoAnterior(periodo);
  // KPIs de desempenho: período filtrado (AD-046).
  const atual = agregadoLoja(filialId, periodo.inicio, periodo.fim);
  const anterior = somarAgregados(
    intervaloDias(ant.inicio, ant.fim).map((iso) => {
      const dia = diaVendas(filialId, iso);
      if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
      const horaMax = iso === ant.fim && ant.horaMax !== undefined ? ant.horaMax : undefined;
      return agregadoDoDia(dia, null, horaMax);
    }),
  );

  const temComparacao = anterior.atendimentos > 0;
  const vsRotulo = temComparacao ? ant.rotulo : undefined;
  const ticket = divSeguro(atual.faturamento, atual.atendimentos);
  const pa = divSeguro(atual.itens, atual.atendimentos);
  const ticketAnt = divSeguro(anterior.faturamento, anterior.atendimentos);
  const paAnt = divSeguro(anterior.itens, anterior.atendimentos);

  // Meta/escada/premiação: sempre janela da competência (AD-046).
  const vendedoras = visaoVendedoras(filialId, periodoMeta, metaAtiva, competencia);
  const premiacao = metaAtiva ? premiacaoProjetada(filialId, competencia, vendedoras) : null;

  const avisos: string[] = [];
  if (escopo.divisao && metaAtiva) {
    avisos.push("Com marca selecionada, as metas individuais continuam sendo da loja inteira.");
  }

  return {
    escopo,
    periodo,
    visao: "loja",
    competencia,
    metaAtiva,
    avisoCompetencia: null, // preenchido em montarEquipeView
    avisos,
    kpiFaturamento: { valor: brlK(atual.faturamento), delta: temComparacao ? kpiDelta(atual.faturamento, anterior.faturamento, vsRotulo) : undefined },
    kpiAtendimentos: { valor: num(atual.atendimentos), delta: temComparacao ? kpiDelta(atual.atendimentos, anterior.atendimentos, vsRotulo) : undefined },
    kpiTicket: { valor: brl(ticket), delta: temComparacao ? kpiDelta(ticket, ticketAnt, vsRotulo) : undefined },
    kpiPA: { valor: num(pa, 2), delta: temComparacao ? kpiDelta(pa, paAnt, vsRotulo) : undefined },
    kpiPremiacao: premiacao === null ? null : { valor: brl(premiacao), delta: undefined },
    metaGlobal: null,
    leitura: null,
    vendedoras,
    lojas: null,
    desafios: metaAtiva ? desafiosViewDaCompetencia(competencia, [filial.id]) : null,
    estados: {
      kpis: "disponivel",
      leitura: "sem_dados",
      vendedoras: vendedoras.length > 0 ? "disponivel" : "sem_dados",
      desafios: metaAtiva ? (desafiosAtivos(competencia).length > 0 ? "disponivel" : "sem_dados") : "indisponivel",
    },
  };
}

function desafiosViewDaCompetencia(competencia: string, filiaisIds: string[]): DesafioView[] {
  const { decorridos, totais } = diasAbertosDaCompetencia(competencia, filiaisIds);
  return desafiosAtivos(competencia).map((d) => desafioView(d, decorridos, totais));
}

/* ------------------------- Visão rede (EQUIP-07) ------------------------- */

function visaoRede(escopo: Escopo, periodo: PeriodoResolvido, periodoMeta: PeriodoResolvido, competencia: string, metaAtiva: boolean): EquipeView {
  // Meta global = soma das metas das lojas do escopo que têm meta (REDE-08).
  const metaGlobalTotal = filiais.reduce((s, f) => s + (metaDaFilial(f.id, competencia)?.valorLoja ?? 0), 0);

  const vendedorasFlat: VendedoraLinha[] = [];
  const lojas: LojaEquipeResumo[] = filiais.map((f, i) => {
    const escopoLoja: Escopo = { ...escopo, filialIds: [f.id] };
    const vLoja = visaoLoja(escopoLoja, periodo, periodoMeta, competencia, metaAtiva);
    const linhas = vLoja.vendedoras ?? [];
    vendedorasFlat.push(...linhas);
    const comMeta = metaAtiva ? linhas.filter((l) => !l.semMeta) : [];
    const ordenadas = [...comMeta].sort((a, b) => b.atingimentoPct - a.atingimentoPct);
    const melhor = ordenadas.length > 0 ? { nome: primeiroNome(ordenadas[0].nome), atingimentoPct: ordenadas[0].atingimentoPct } : null;
    const pior = ordenadas.length > 0 ? { nome: primeiroNome(ordenadas[ordenadas.length - 1].nome), atingimentoPct: ordenadas[ordenadas.length - 1].atingimentoPct } : null;
    const metaValor = metaDaFilial(f.id, competencia)?.valorLoja ?? 0;
    const realizadoValor = linhas.reduce((s, l) => s + l.faturamentoValor, 0);
    return {
      filialId: f.id,
      nome: f.fantasia,
      tint: PALETA_LOJAS[i % PALETA_LOJAS.length],
      faturamento: vLoja.kpiFaturamento.valor,
      ticket: vLoja.kpiTicket.valor,
      pa: vLoja.kpiPA.valor,
      // Premiação da loja = só a escada de metas dela; os desafios são da rede
      // e entram uma vez no KPI da visão rede (não dobram por loja).
      premiacaoProjetada: vLoja.kpiPremiacao?.valor ?? "—",
      metaValor,
      realizadoValor,
      pctMetaGlobal: metaGlobalTotal > 0 ? (metaValor / metaGlobalTotal) * 100 : 0,
      melhor,
      pior,
    };
  });

  // Flat da rede: mesma regra de ordenação da loja (atingimento / faturamento).
  vendedorasFlat.sort((a, b) => {
    const ka = metaAtiva && !a.semMeta ? a.atingimentoPct : a.faturamentoValor;
    const kb = metaAtiva && !b.semMeta ? b.atingimentoPct : b.faturamentoValor;
    return kb - ka;
  });

  // KPIs da rede: soma das lojas (ticket e P.A. recalculados sobre a soma).
  const atual = somarAgregados(filiais.map((f) => agregadoLoja(f.id, periodo.inicio, periodo.fim)));
  const ant = periodoAnterior(periodo);
  const anterior = somarAgregados(
    intervaloDias(ant.inicio, ant.fim).map((iso) => {
      const horaMax = iso === ant.fim && ant.horaMax !== undefined ? ant.horaMax : undefined;
      return somarAgregados(filiais.map((f) => {
        const dia = diaVendas(f.id, iso);
        return dia ? agregadoDoDia(dia, null, horaMax) : { faturamento: 0, atendimentos: 0, itens: 0 };
      }));
    }),
  );
  const temComparacao = anterior.atendimentos > 0;
  const vsRotulo = temComparacao ? ant.rotulo : undefined;
  const desafios = metaAtiva ? desafiosViewDaCompetencia(competencia, filiais.map((f) => f.id)) : null;
  const semDesafios = metaAtiva && desafiosAtivos(competencia).length === 0;

// Premiação da rede = escada de metas de cada loja + desafios uma única
// vez (desafio é da competência inteira, não por loja).
let premiacaoRede: number | null = null;
if (metaAtiva) {
  let parteEscada = 0;
  for (const f of filiais) {
    const vLoja = visaoLoja({ ...escopo, filialIds: [f.id] }, periodo, periodoMeta, competencia, metaAtiva);
    const escadaLoja = premiacaoEscada(f.id, competencia, vLoja.vendedoras ?? []);
    if (escadaLoja !== null) parteEscada += escadaLoja;
  }
  const parteDesafios = premiacaoDesafios(competencia, filiais.map((f) => f.id));
  premiacaoRede = parteEscada > 0 || parteDesafios > 0 ? parteEscada + parteDesafios : null;
}

  // Faixa global (REDE-06..09): só com meta ativa.
  let metaGlobal: RedeMetaGlobal | null = null;
  if (metaAtiva && metaGlobalTotal > 0) {
    const primeiro = `${competencia}-01`;
    const ultimo = fimDoMes(primeiro);
    const realizado = somarAgregados(filiais.map((f) => agregadoLoja(f.id, primeiro, ultimo <= HOJE_ISO ? ultimo : HOJE_ISO))).faturamento;
    const pct = (realizado / metaGlobalTotal) * 100;
    const fechado = ultimo < HOJE_ISO;
    let projetadoPct = pct;
    if (!fechado) {
      const curva = curvaReceita(filiais, competencia);
      let fracaoAcum = 0;
      for (const iso of intervaloDias(primeiro, HOJE_ISO)) fracaoAcum += curva.peso(iso);
      if (fracaoAcum > 0) projetadoPct = (realizado / fracaoAcum / metaGlobalTotal) * 100;
    }
    // Dias abertos restantes (incluindo hoje) — AD-019.
    const abertosRestantes = intervaloDias(HOJE_ISO, ultimo).filter((iso) =>
      filiais.some((f) => lojaAberta(f, iso)),
    );
    metaGlobal = {
      competTexto: mesAno(primeiro),
      realizado,
      total: metaGlobalTotal,
      pct,
      projetadoPct,
      diasRestantes: fechado ? 0 : abertosRestantes.length,
    };
  }

  return {
    escopo,
    periodo,
    visao: "rede",
    competencia,
    metaAtiva,
    avisoCompetencia: null,
    avisos: [],
    kpiFaturamento: { valor: brlK(atual.faturamento), delta: temComparacao ? kpiDelta(atual.faturamento, anterior.faturamento, vsRotulo) : undefined },
    kpiAtendimentos: { valor: num(atual.atendimentos), delta: temComparacao ? kpiDelta(atual.atendimentos, anterior.atendimentos, vsRotulo) : undefined },
    kpiTicket: { valor: brl(divSeguro(atual.faturamento, atual.atendimentos)), delta: temComparacao ? kpiDelta(divSeguro(atual.faturamento, atual.atendimentos), divSeguro(anterior.faturamento, anterior.atendimentos), vsRotulo) : undefined },
    kpiPA: { valor: num(divSeguro(atual.itens, atual.atendimentos), 2), delta: temComparacao ? kpiDelta(divSeguro(atual.itens, atual.atendimentos), divSeguro(anterior.itens, anterior.atendimentos), vsRotulo) : undefined },
    kpiPremiacao: premiacaoRede === null ? null : { valor: brl(premiacaoRede), delta: undefined },
    metaGlobal,
    leitura: null,
    vendedoras: vendedorasFlat,
    lojas: lojas,
    desafios,
    estados: {
      kpis: "disponivel",
      leitura: "sem_dados",
      vendedoras: vendedorasFlat.length > 0 ? "disponivel" : "sem_dados",
      desafios: metaAtiva ? (semDesafios ? "sem_dados" : "disponivel") : "indisponivel",
    },
  };
}

/* ------------------------- Entrada da aba ------------------------- */

/**
 * Competência da Equipe (AD-046): mês passado só quando o filtro é
 * “Mês passado”; nos demais casos, mês corrente. Meta/escada/desafios
 * usam essa janela; KPIs usam o período filtrado.
 */
function competenciaDaEquipe(periodo: PeriodoResolvido): string {
  return periodo.tipo === "mesPassado" ? periodo.inicio.slice(0, 7) : HOJE_ISO.slice(0, 7);
}

/** Período resolvido da competência (mês inteiro até hoje ou fechado). */
function periodoDaCompetencia(competencia: string): PeriodoResolvido {
  return resolverPeriodo(competencia === HOJE_ISO.slice(0, 7) ? { tipo: "esteMes" } : { tipo: "mesPassado" });
}

/** True quando o filtro já é exatamente o mês da competência. */
function periodoBateComCompetencia(periodo: PeriodoResolvido, competencia: string): boolean {
  if (periodo.atravessaMeses) return false;
  if (periodo.tipo === "esteMes") return competencia === HOJE_ISO.slice(0, 7);
  if (periodo.tipo === "mesPassado") return competencia === periodo.inicio.slice(0, 7);
  return false;
}

export function montarEquipeView(escopo: Escopo): EquipeView {
  const periodo = resolverPeriodo(escopo.periodo);
  const competencia = competenciaDaEquipe(periodo);
  const periodoMeta = periodoDaCompetencia(competencia);
  const ehRede = escopo.filialIds.length === 0;
  const filiaisEscopo = ehRede ? filiais : escopo.filialIds.map((id) => filialPorId(id)).filter(Boolean) as Filial[];
  // Meta ativa = existe meta cadastrada na competência (não depende mais do filtro).
  const metaAtiva = filiaisEscopo.some((f) => Boolean(metaDaFilial(f.id, competencia)));

  const v = ehRede ? visaoRede(escopo, periodo, periodoMeta, competencia, metaAtiva) : visaoLoja(escopo, periodo, periodoMeta, competencia, metaAtiva);

  if (metaAtiva && !periodoBateComCompetencia(periodo, competencia)) {
    v.avisoCompetencia = `KPIs do topo seguem o período filtrado. Meta, escada e desafios são de ${mesAno(`${competencia}-01`)}.`;
  } else if (metaAtiva && periodo.tipo === "mesPassado") {
    v.avisoCompetencia = `Meta e premiação valem para a competência ${mesAno(`${competencia}-01`)}.`;
  }

  v.leitura = montarLeituraEquipe(v);
  v.estados.leitura = v.leitura ? "disponivel" : "sem_dados";
  return v;
}