/**
 * Camada de visões da aba Equipe (EQUIP-01..07). Mesma arquitetura da Visão
 * geral: `montarEquipeView(escopo)` calcula tudo e a página só monta blocos.
 * Fica em arquivo próprio porque vendas.ts consome o cadastro de colaboradores
 * (equipe.ts) no boot — importar a camada de views daqui evita ciclo.
 *
 * Regra `metaAtiva` (decisão do usuário): só quando o período do filtro é
 * exatamente o mês da competência (Este mês, Mês passado). Hoje, Ontem, 7
 * dias, personalizado ou período cruzando meses mostram só desempenho do
 * período: 3 KPIs, tabela sem colunas de meta/comissão e sem desafios.
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
  /** Próximo degrau e quanto falta em R$; null no último degrau. */
  proximo: { nome: string; faltaValor: number } | null;
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
    ? { nome: seguinte.nome, faltaValor: Math.max(0, (metaInd.valor * seguinte.atingimentoMinPct) / 100 - realizado) }
    : null;
  return { degrau, premiacao, bonus, proximo };
}

/* ------------------------- Tipos da visão ------------------------- */

export interface KpiEquipeValor {
  valor: string;
  delta: { value: string; positive: boolean } | undefined;
}

export interface VendedoraLinha {
  colaboradorId: string;
  nome: string;
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
  degrauAtual: string | null;
  proximoDegrau: { nome: string; faltaValor: number } | null;
  /** Premiação acumulada da escada de metas (realizado × pct do degrau). */
  premiacaoAcumulada: number;
  bonusAlcancado: number;
  // Atenção
  paAbaixoPct: number | null;
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
  melhor: { nome: string; atingimentoPct: number } | null;
  pior: { nome: string; atingimentoPct: number } | null;
}

export interface EstadosEquipeView {
  kpis: EstadoBloco;
  leitura: EstadoBloco;
  vendedoras: EstadoBloco;
  desafios: EstadoBloco;
}

export interface EquipeView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  visao: "loja" | "rede";
  competencia: string;
  /** Período do filtro é exatamente o mês da competência: meta/premiação/desafios entram. */
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
    // P.A. ≥5% abaixo da média da loja: ponto de atenção (context.md).
    const paAbaixoPct = paMedioLoja > 0 && pa > 0 && pa < paMedioLoja * 0.95 ? (pa / paMedioLoja - 1) * 100 : null;
    return {
      colaboradorId: c.id,
      nome: c.nome,
      faturamentoValor: ag.faturamento,
      faturamento: brl(ag.faturamento),
      atendimentos: ag.atendimentos,
      ticketValor: ticket,
      ticket: brl(ticket),
      paValor: pa,
      pa: num(pa, 2),
      diasTrabalhados: ag.diasTrabalhados,
      tendencia: tendenciaVendedora(c, filialId, periodo.fim),
      metaIndividualValor: metaInd?.valor ?? 0,
      metaProporcional: metaInd?.proporcional ?? false,
      diasElegiveis: metaInd?.diasElegiveis ?? 0,
      atingimentoPct: metaInd && metaInd.valor > 0 ? (ag.faturamento / metaInd.valor) * 100 : 0,
      barraPct: metaInd && metaInd.valor > 0 ? Math.min(100, (ag.faturamento / metaInd.valor) * 100) : 0,
      degrauAtual: escada?.degrau?.nome ?? null,
      proximoDegrau: escada?.proximo ?? null,
      premiacaoAcumulada: escada?.premiacao ?? 0,
      bonusAlcancado: escada?.bonus ?? 0,
      paAbaixoPct,
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

function visaoLoja(escopo: Escopo, periodo: PeriodoResolvido, competencia: string, metaAtiva: boolean): EquipeView {
  const filialId = escopo.filialId;
  const filial = filialPorId(filialId);
  const ant = periodoAnterior(periodo);
  const atual = agregadoLoja(filialId, periodo.inicio, periodo.fim);
  const anterior = somarAgregados(
    intervaloDias(ant.inicio, ant.fim).map((iso) => {
      const dia = diaVendas(filialId, iso);
      if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
      // Hoje no período comparado usa a hora atual só quando o fim é hoje.
      const horaMax = iso === ant.fim && ant.horaMax !== undefined ? ant.horaMax : undefined;
      return agregadoDoDia(dia, null, horaMax);
    }),
  );

  const temComparacao = anterior.atendimentos > 0;
  const ticket = divSeguro(atual.faturamento, atual.atendimentos);
  const pa = divSeguro(atual.itens, atual.atendimentos);
  const ticketAnt = divSeguro(anterior.faturamento, anterior.atendimentos);
  const paAnt = divSeguro(anterior.itens, anterior.atendimentos);

  const vendedoras = visaoVendedoras(filialId, periodo, metaAtiva, competencia);
  const premiacao = metaAtiva ? premiacaoProjetada(filialId, competencia, vendedoras) : null;

  const avisos: string[] = [];
  if (escopo.divisao && metaAtiva) {
    avisos.push("Com marca selecionada, as metas individuais continuam sendo da loja inteira.");
  }
  const avisoCompetencia = metaAtiva && periodo.tipo === "mesPassado" ? `Meta e premiação valem para a competência ${mesAno(`${competencia}-01`)}.` : null;

  return {
    escopo,
    periodo,
    visao: "loja",
    competencia,
    metaAtiva,
    avisoCompetencia,
    avisos,
    kpiFaturamento: { valor: brlK(atual.faturamento), delta: temComparacao ? kpiDelta(atual.faturamento, anterior.faturamento) : undefined },
    kpiAtendimentos: { valor: num(atual.atendimentos), delta: temComparacao ? kpiDelta(atual.atendimentos, anterior.atendimentos) : undefined },
    kpiTicket: { valor: brl(ticket), delta: temComparacao ? kpiDelta(ticket, ticketAnt) : undefined },
    kpiPA: { valor: num(pa, 2), delta: temComparacao ? kpiDelta(pa, paAnt) : undefined },
    kpiPremiacao: premiacao === null ? null : { valor: brl(premiacao), delta: undefined },
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

function visaoRede(escopo: Escopo, periodo: PeriodoResolvido, competencia: string, metaAtiva: boolean): EquipeView {
  const lojas: LojaEquipeResumo[] = filiais.map((f, i) => {
    const escopoLoja: Escopo = { ...escopo, filialId: f.id };
    const vLoja = visaoLoja(escopoLoja, periodo, competencia, metaAtiva);
    const linhas = vLoja.vendedoras ?? [];
    const comMeta = metaAtiva ? linhas.filter((l) => !l.semMeta) : [];
    const ordenadas = [...comMeta].sort((a, b) => b.atingimentoPct - a.atingimentoPct);
    const melhor = ordenadas.length > 0 ? { nome: primeiroNome(ordenadas[0].nome), atingimentoPct: ordenadas[0].atingimentoPct } : null;
    const pior = ordenadas.length > 0 ? { nome: primeiroNome(ordenadas[ordenadas.length - 1].nome), atingimentoPct: ordenadas[ordenadas.length - 1].atingimentoPct } : null;
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
      melhor,
      pior,
    };
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
  const desafios = metaAtiva ? desafiosViewDaCompetencia(competencia, filiais.map((f) => f.id)) : null;
  const semDesafios = metaAtiva && desafiosAtivos(competencia).length === 0;

// Premiação da rede = escada de metas de cada loja + desafios uma única
// vez (desafio é da competência inteira, não por loja).
let premiacaoRede: number | null = null;
if (metaAtiva) {
  let parteEscada = 0;
  for (const f of filiais) {
    const vLoja = visaoLoja({ ...escopo, filialId: f.id }, periodo, competencia, metaAtiva);
    const escadaLoja = premiacaoEscada(f.id, competencia, vLoja.vendedoras ?? []);
    if (escadaLoja !== null) parteEscada += escadaLoja;
  }
  const parteDesafios = premiacaoDesafios(competencia, filiais.map((f) => f.id));
  premiacaoRede = parteEscada > 0 || parteDesafios > 0 ? parteEscada + parteDesafios : null;
}

  return {
    escopo,
    periodo,
    visao: "rede",
    competencia,
    metaAtiva,
    avisoCompetencia: null,
    avisos: [],
    kpiFaturamento: { valor: brlK(atual.faturamento), delta: temComparacao ? kpiDelta(atual.faturamento, anterior.faturamento) : undefined },
    kpiAtendimentos: { valor: num(atual.atendimentos), delta: temComparacao ? kpiDelta(atual.atendimentos, anterior.atendimentos) : undefined },
    kpiTicket: { valor: brl(divSeguro(atual.faturamento, atual.atendimentos)), delta: temComparacao ? kpiDelta(divSeguro(atual.faturamento, atual.atendimentos), divSeguro(anterior.faturamento, anterior.atendimentos)) : undefined },
    kpiPA: { valor: num(divSeguro(atual.itens, atual.atendimentos), 2), delta: temComparacao ? kpiDelta(divSeguro(atual.itens, atual.atendimentos), divSeguro(anterior.itens, anterior.atendimentos)) : undefined },
    kpiPremiacao: premiacaoRede === null ? null : { valor: brl(premiacaoRede), delta: undefined },
    leitura: null,
    vendedoras: null,
    lojas: lojas,
    desafios,
    estados: {
      kpis: "disponivel",
      leitura: "sem_dados",
      vendedoras: "sem_dados",
      desafios: metaAtiva ? (semDesafios ? "sem_dados" : "disponivel") : "indisponivel",
    },
  };
}

/* ------------------------- Entrada da aba ------------------------- */

export function montarEquipeView(escopo: Escopo): EquipeView {
  const periodo = resolverPeriodo(escopo.periodo);
  const metaAtiva = periodo.granularidade === "mes" && !periodo.atravessaMeses && (periodo.tipo === "esteMes" || periodo.tipo === "mesPassado");
  const competencia = periodo.granularidade === "mes" ? periodo.inicio.slice(0, 7) : HOJE_ISO.slice(0, 7);
  const v = escopo.filialId === "todas" ? visaoRede(escopo, periodo, competencia, metaAtiva) : visaoLoja(escopo, periodo, competencia, metaAtiva);
  v.leitura = montarLeituraEquipe(v);
  v.estados.leitura = v.leitura ? "disponivel" : "sem_dados";
  return v;
}