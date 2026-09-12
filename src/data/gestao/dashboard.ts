/**
 * Camada de visões da Visão geral. Faz o papel do backend: recebe o escopo
 * (filial, período, divisão) e devolve os blocos com números prontos.
 *
 * AD-047 — adaptar, não esconder: o gráfico principal é por hora (1 dia) ou
 * por dia (período > 1 dia), inclusive na rede. A régua sempre aparece:
 * % da meta, % da marca na rede, ou participação da marca na loja única.
 * AD-048 — KPIs com subtítulo só do próprio indicador; gráfico compara
 * períodos no mesmo eixo (padrão Finance / Revenue vs expenses).
 */
import { categorias, filiais, filialPorId, tarefas, turnos, type Divisao, type Filial } from "./filiais";
import { metaDaFilial } from "./metas";
import { AGORA, ATUALIZADO_AS, HOJE_ISO, HORA_ATUAL, INTERVALO_SYNC_MIN, ULTIMO_SYNC } from "./relogio";
import { agregadoDoDia, diaVendas, diasVendas, lojaAberta, pesoDia, somarAgregados, type Agregado } from "./vendas";
import { brl, dataCompleta, dataCurta, deIso, delta as fmtDelta, diaSemanaCurto, fimDoMes, inicioDoMes, intervaloDias, mesAno, num, pct, somarDias } from "@/lib/formato";
import type { TintKey } from "@/pages/dashboards/icons";
import { montarLeituraLoja } from "./leitura";

export type PeriodoTipo = "hoje" | "ontem" | "7dias" | "esteMes" | "mesPassado" | "personalizado";

/** Uma cor por loja, fixa pela posição no cadastro: a loja não muda de cor conforme o desempenho, como não muda o "Desktop"/"Mobile" da demo. */
const PALETA_LOJAS: TintKey[] = ["acc", "ok", "info", "warn", "bad"];

export interface Periodo {
  tipo: PeriodoTipo;
  inicio?: string;
  fim?: string;
}

export type Granularidade = "dia" | "periodo" | "mes";

export interface PeriodoResolvido {
  tipo: PeriodoTipo;
  inicio: string;
  fim: string;
  granularidade: Granularidade;
  atravessaMeses: boolean;
  ehHoje: boolean;
  mesAberto: boolean;
  rotulo: string;
}

export interface Escopo {
  /**
   * Lojas selecionadas (multi-select). Array vazio = "Todas as lojas"
   * (consolida a rede). Um id = visão detalhada daquela loja. Vários =
   * soma daquelas lojas. Substitui o antigo `filialId: string | "todas"`.
   */
  filialIds: string[];
  periodo: Periodo;
  divisao: Divisao | null;
}

export const rotulosPeriodo: Record<PeriodoTipo, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  "7dias": "7 dias",
  esteMes: "Este mês",
  mesPassado: "Mês passado",
  personalizado: "Personalizado",
};

/* ---------- Tipos do motor de trilho ---------- */

export type EstadoBloco = "disponivel" | "carregando" | "sem_dados" | "indisponivel";

export interface EstadosLojaView {
  kpis: EstadoBloco;
  trilho: EstadoBloco;
  vendaNecessaria: EstadoBloco;
  projecao: EstadoBloco;
  diagnostico: EstadoBloco;
  mix: EstadoBloco;
  lojas: EstadoBloco;
}

export type StatusTrilho = "no_trilho" | "atencao" | "abaixo" | "meta_batida" | "meta_nao_batida";

export interface TrilhoView {
  status: StatusTrilho;
  /** Percentual do trilho (realizado ÷ meta × fração acumulada da curva), null em competência encerrada. */
  pctTrilho: number | null;
  competencia: string;
}

export interface VendaNecessariaView {
  /** (faltaRestante × pesoHoje ÷ Σ pesosRestantes) − realizadoHoje */
  valor: number | null;
  realizadoHoje: number;
  faltaRestante: number;
  diasRestantes: number;
  diaReferencia: string;
  cumpridaHoje: boolean;
  metaMesAtingida: boolean;
  semMeta: boolean;
}

export interface LacunaView {
  exibir: boolean;
  efeitoFluxo: number;
  efeitoTicket: number;
  gapTotal: number;
  alavancaDominante: "fluxo" | "ticket" | null;
  semMeta: boolean;
}

export interface MixView {
  itens: { categoria: string; divisao: string; margem: number; receita: number; pct: number }[];
  periodo: string;
}

/** Linha da visão de grupo (LOJA-05): status do trilho por loja + se tem meta. */
export interface LojaResumoView {
  filialId: string;
  nome: string;
  pctTrilho: number | null;
  status: StatusTrilho;
  temMeta: boolean;
}

const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export function resolverPeriodo(p: Periodo): PeriodoResolvido {
  const hojeD = deIso(HOJE_ISO);
  const mesPassadoRef = new Date(hojeD.getFullYear(), hojeD.getMonth() - 1, 1);
  const mesPassadoIso = `${mesPassadoRef.getFullYear()}-${String(mesPassadoRef.getMonth() + 1).padStart(2, "0")}-01`;
  let inicio: string;
  let fim: string;
  switch (p.tipo) {
    case "hoje":
      inicio = fim = HOJE_ISO;
      break;
    case "ontem":
      inicio = fim = somarDias(HOJE_ISO, -1);
      break;
    case "7dias":
      inicio = somarDias(HOJE_ISO, -6);
      fim = HOJE_ISO;
      break;
    case "esteMes":
      inicio = inicioDoMes(HOJE_ISO);
      fim = HOJE_ISO;
      break;
    case "mesPassado":
      inicio = mesPassadoIso;
      fim = fimDoMes(mesPassadoIso);
      break;
    case "personalizado":
      inicio = p.inicio ?? somarDias(HOJE_ISO, -6);
      fim = p.fim ?? HOJE_ISO;
      if (fim > HOJE_ISO) fim = HOJE_ISO;
      if (inicio > fim) inicio = fim;
      break;
  }
  const dias = intervaloDias(inicio, fim).length;
  const atravessaMeses = inicio.slice(0, 7) !== fim.slice(0, 7);
  const granularidade: Granularidade = dias === 1 ? "dia" : p.tipo === "esteMes" || p.tipo === "mesPassado" ? "mes" : "periodo";
  const ehHoje = inicio === HOJE_ISO && fim === HOJE_ISO;
  const mesAberto = granularidade === "mes" && !atravessaMeses && inicio.slice(0, 7) === HOJE_ISO.slice(0, 7);

  let rotulo: string;
  if (granularidade === "dia") rotulo = ehHoje ? "Hoje" : dataCurta(inicio);
  else if (p.tipo === "esteMes" || p.tipo === "mesPassado") rotulo = mesAno(inicio);
  else rotulo = `${dataCurta(inicio)} a ${dataCurta(fim)}`;

  return { tipo: p.tipo, inicio, fim, granularidade, atravessaMeses, ehHoje, mesAberto, rotulo };
}

/* ---------- Tipos dos blocos ---------- */

export interface AlertaSistema {
  id: string;
  texto: string;
  tom: "warning" | "danger" | "info";
}

/** Um indicador do topo, no formato do KpiTile do template. */
export interface KpiValor {
  valor: string;
  delta?: { value: string; positive: boolean; /** Rótulo curto da base, ex.: "ago" / "Segunda passada" */ vs?: string };
  /** Série curta para o traço de tendência. Só o Faturamento usa. */
  serie?: number[];
  /** Só o Faturamento sobrescreve rótulo e subtítulo — os outros usam o texto fixo do componente. */
  rotulo?: string;
  sub?: string;
}

/** Segundo tile da fileira: Meta do mês (dia), Projeção (mês) ou Participação da marca (recorte por marca). Mesmo lugar, papel diferente conforme o contexto. */
export interface TileMetaProjecao {
  tipo: "meta" | "projecao" | "participacao" | "indisponivel";
  rotulo: string;
  valorPrincipal: string;
  barraPct: number;
  detalhe: string;
}

/** Card lateral da rede: só enquanto a meta está em jogo (não fechada, não batida antes da hora). */
export interface RitmoCard {
  realizadoDia: string;
  necessarioDia: string;
  projecaoLinha: string;
  /** Projeção sobre meta, 0-100, pra desenhar a barra. */
  barraPct: number;
}

export interface LinhaRegua {
  filialId: string;
  nome: string;
  faturamento: string;
  faturamentoValor: number;
  atingimentoPct: number;
  /** Já inclui o sufixo pronto: "42% da meta" ou "23% da marca". */
  atingimentoTexto: string;
  barraPct: number;
  /** Cor de identidade da loja, estável independente da ordenação por desempenho. */
  tint: TintKey;
  variacaoDia: { value: string; positive: boolean } | null;
  variacaoDiaValor: number | null;
}

/** Loja fora do ritmo da própria meta: quem precisa de atenção, não quem vendeu mais. */
export interface PontoAtencao {
  filialId: string;
  nome: string;
  atingimentoTexto: string;
  status: string;
  faltaPorDia: string;
  veredito: "nao_atinge" | "incerto";
}

export interface GraficoHora {
  horas: number[];
  valores: number[];
  /** Mesmo dia da semana anterior (semana passada), alinhado por hora — AD-048. */
  anterior: number[] | null;
  rotuloAnterior: string;
  horaAtual: number | null;
}

/** Por hora, empilhado por loja — só na rede, período de um dia. Acima de 5 lojas, colapsa: uma cor só, soma simples. */
export interface GraficoHoraRede {
  horas: number[];
  series: { filialId: string; nome: string; tint: TintKey; valores: number[] }[];
  horaAtual: number | null;
  colapsado: boolean;
}

export interface GraficoEvolucao {
  rotulos: string[];
  valores: number[];
  anterior: number[] | null;
  rotuloAnterior: string;
}

export interface ItemLucro {
  rotulo: string;
  valor: string;
  pct: string;
}

export interface CategoriaLinha {
  categoriaId: number;
  nome: string;
  receita: string;
  margem: string;
  margemPct: string;
  /** Relativa à maior margem em R$ do grupo — pra desenhar a barra da lista. */
  barraPct: number;
}

export interface TurnoLinha {
  id: string;
  nome: string;
  horario: string;
  estado: "encerrado" | "andamento" | "naoComecou";
  feitas: number;
  total: number;
  tarefas: { titulo: string; feita: boolean }[];
}

/** Checklist do dia: um turno por linha, cada um com o próprio estado e lista de tarefas. */
export interface ChecklistDia {
  dataTexto: string;
  turnos: TurnoLinha[];
}

export interface ProjecaoView {
  valor: number | null;
  disponivel: boolean;
  encerrada: boolean;
  /** Índice de desempenho da competência (realizado ÷ meta acumulada), usado para escalar a curva restante. */
  indice: number | null;
  /** Meta mensal em R$ — para a UI desenhar a barra sem duplicar o pct (AD-029). */
  metaValor: number;
}

/** Período com agregados consolidados para a comparação única (LOJA-06 AC 1-3). */
export interface PeriodoAgregadoComparacao {
  inicio: string;
  fim: string;
  faturamento: number;
  atendimentos: number;
  itens: number;
}

export interface ComparacaoView {
  atual: PeriodoAgregadoComparacao;
  anterior: PeriodoAgregadoComparacao;
  rotuloAtual: string;
  rotuloAnterior: string;
}

export interface LojaView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  atualizadoAs: string;
  proximoSyncMin: number;
  visao: "rede" | "dia" | "periodo";
  alertas: AlertaSistema[];
  leitura: string | null;
  avisos: string[];
  comparacao: ComparacaoView | null;
  trilho: TrilhoView | null;
  vendaNecessaria: VendaNecessariaView | null;
  projecao: ProjecaoView | null;
  diagnostico: LacunaView | null;
  mix: MixView | null;
  lojas: LojaResumoView[];
  estados: EstadosLojaView;
  kpiFaturamento: KpiValor;
  kpiTicket: KpiValor;
  kpiPA: KpiValor;
  kpiAtendimentos: KpiValor;
  tileMeta: TileMetaProjecao | null;
  ritmo: RitmoCard | null;
  ritmoAviso: string | null;
  regua: LinhaRegua[] | null;
  /** Título da régua: "Desempenho das lojas" (rede) ou "Desempenho da loja" (uma loja). */
  reguaTitulo: string;
  pontosAtencao: PontoAtencao[] | null;
  graficoHora: GraficoHora | null;
  graficoHoraRede: GraficoHoraRede | null;
  evolucao: GraficoEvolucao | null;
  checklist: ChecklistDia | null;
  lucroBruto: { itens: ItemLucro[]; aviso: string; divisaoLinha: string | null } | null;
  categorias: CategoriaLinha[] | null;
}

/* ---------- Helpers ---------- */

function filiaisDoEscopo(escopo: Escopo): Filial[] {
  // Array vazio = "Todas as lojas" → consolida a rede inteira.
  // Um ou mais ids → só aquelas lojas (multi-select).
  return escopo.filialIds.length === 0 ? filiais : filiais.filter((f) => escopo.filialIds.includes(f.id));
}

function agregadoPeriodo(f: Filial, inicio: string, fim: string, divisao: Divisao | null, horaMax?: number): Agregado {
  return somarAgregados(diasVendas(f.id, inicio, fim).map((d) => agregadoDoDia(d, divisao, horaMax)));
}

function divSeguro(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function pctDelta(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return ((atual - anterior) / anterior) * 100;
}

/** Delta pronto para o KpiTile do template: sem sinal no texto, a seta já indica. */
export function kpiDelta(atual: number, anterior: number, vs?: string): { value: string; positive: boolean; vs?: string } | undefined {
  if (anterior <= 0) return undefined;
  const v = pctDelta(atual, anterior);
  const casas = Math.abs(v) < 10 ? 1 : 0;
  // Arredondou pra zero: sem selo — não é queda nem alta, não há o que marcar.
  if (num(Math.abs(v), casas) === num(0, casas)) return undefined;
  return { value: fmtDelta(v, casas).replace(/^[+−]/, ""), positive: v >= 0, ...(vs ? { vs } : {}) };
}

/** Dias com loja aberta que ainda restam no mês corrente. */
function diasRestantesMes(fs: Filial[]): number {
  return intervaloDias(somarDias(HOJE_ISO, 1), fimDoMes(HOJE_ISO)).filter((iso) => fs.some((f) => lojaAberta(f, iso))).length;
}

/**
 * Série curta de faturamento para o traço de tendência do KPI: por hora
 * quando o período é um dia só (truncada na hora atual, sem horas futuras
 * zeradas que pareceriam queda), por dia nos demais períodos. Serve rede,
 * loja e mês com a mesma função, porque soma sobre `fs`.
 */
function serieTendenciaAgregada(fs: Filial[], periodo: PeriodoResolvido, divisao: Divisao | null): Agregado[] {
  if (periodo.granularidade === "dia") {
    const abertura = Math.min(...fs.map((f) => f.abertura));
    const fechamento = Math.max(...fs.map((f) => f.fechamento));
    const horas: number[] = [];
    for (let h = abertura; h < fechamento; h++) horas.push(h);
    let pontos = horas.map((h) =>
      fs.reduce(
        (soma, f) => {
          const dia = diaVendas(f.id, periodo.inicio);
          const a = dia?.porHora[h];
          if (!a) return soma;
          if (!divisao) return { faturamento: soma.faturamento + a.faturamento, atendimentos: soma.atendimentos + a.atendimentos, itens: soma.itens + a.itens };
          const fr = dia!.total.faturamento > 0 ? dia!.porDivisao[divisao].faturamento / dia!.total.faturamento : 0;
          return { faturamento: soma.faturamento + Math.round(a.faturamento * fr), atendimentos: soma.atendimentos + Math.round(a.atendimentos * fr), itens: soma.itens + Math.round(a.itens * fr) };
        },
        { faturamento: 0, atendimentos: 0, itens: 0 },
      ),
    );
    if (periodo.ehHoje) {
      const idx = horas.indexOf(HORA_ATUAL);
      if (idx >= 0) pontos = pontos.slice(0, idx + 1);
    }
    return pontos;
  }
  const dias = intervaloDias(periodo.inicio, periodo.fim);
  return dias.map((iso) => somarAgregados(fs.map((f) => agregadoDoDia(diaVendas(f.id, iso)!, divisao))));
}

/** Uma série por métrica, derivada dos mesmos pontos (por hora no dia, por dia nos demais períodos). */
function seriesTendencia(fs: Filial[], periodo: PeriodoResolvido, divisao: Divisao | null): { faturamento?: number[]; ticket?: number[]; pa?: number[]; atendimentos?: number[] } {
  const pontos = serieTendenciaAgregada(fs, periodo, divisao);
  if (pontos.length < 2) return {};
  return {
    faturamento: pontos.map((p) => p.faturamento),
    ticket: pontos.map((p) => divSeguro(p.faturamento, p.atendimentos)),
    pa: pontos.map((p) => divSeguro(p.itens, p.atendimentos)),
    atendimentos: pontos.map((p) => p.atendimentos),
  };
}

/** Expectativa para um dia: média do mesmo dia da semana nas 4 semanas anteriores. */
function esperadoDia(f: Filial, iso: string, divisao: Divisao | null): number {
  if (!lojaAberta(f, iso)) return 0;
  let soma = 0;
  let n = 0;
  for (let k = 1; k <= 4; k++) {
    const ref = somarDias(iso, -7 * k);
    const d = diaVendas(f.id, ref);
    if (d && ref !== HOJE_ISO) {
      soma += agregadoDoDia(d, divisao).faturamento;
      n++;
    }
  }
  return n ? soma / n : 0;
}

/** R$ 85,3k — valor curto, pra não quebrar componente. R$ 1,2M a partir de 1 milhão. Abaixo de R$ 10.000, valor cheio — R$ 3.022, não R$ 3k, que esconderia precisão que cabe na tela. Sem ",0" à toa: só mostra casa decimal quando ela diz algo (283k, não 283,0k). */
/** Formata número inteiro com separador de milhar (ex.: 5778 → "5.778"). */
export function num(v: number): string {
  return Math.round(v).toLocaleString("pt-BR");
}

export function brlK(v: number): string {
  const abs = Math.abs(v);
  const compacto = (dividido: number) => dividido.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  if (abs >= 1_000_000) return `R$ ${compacto(v / 1_000_000)}M`;
  if (abs >= 10_000) return `R$ ${compacto(v / 1000)}k`;
  return brl(v);
}


interface MetaCalculada {
  valor: number;
  realizado: number;
  atingimentoPct: number;
  necessarioDia: number | null;
  diasRestantes: number;
  diaDoMes: number;
  diasNoMes: number;
  projecao: number | null;
  pessimista: number | null;
  otimista: number | null;
  veredito: "atinge" | "incerto" | "nao_atinge" | null;
  fechada: boolean;
}

/** Meta do mês. Sempre mensal, mesmo quando o período exibido é diferente. */
function calcularMeta(fs: Filial[], competencia: string): MetaCalculada | null {
  const metasFs = fs.map((f) => metaDaFilial(f.id, competencia)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  if (metasFs.length === 0) return null;

  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const fechada = ultimoDia < HOJE_ISO;
  const fimReal = fechada ? ultimoDia : HOJE_ISO;

  const valor = metasFs.reduce((s, m) => s + m.valorLoja, 0);
  const realizado = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).faturamento, 0);
  const diasRestantes = fechada ? 0 : diasRestantesMes(fs);
  const necessarioDia = fechada || diasRestantes === 0 || realizado >= valor ? null : (valor - realizado) / diasRestantes;
  const atingimentoPct = divSeguro(realizado, valor) * 100;

  // Projeção só a partir do dia 7: cinco dias não projetam trinta.
  const diaDoMes = deIso(fechada ? ultimoDia : HOJE_ISO).getDate();
  let projecao: number | null = null;
  let pessimista: number | null = null;
  let otimista: number | null = null;
  let veredito: MetaCalculada["veredito"] = null;

  if (fechada) {
    veredito = atingimentoPct >= 100 ? "atinge" : "nao_atinge";
  } else if (diaDoMes >= 7) {
    let futuro = 0;
    for (const iso of intervaloDias(somarDias(HOJE_ISO, 1), ultimoDia)) {
      for (const f of fs) futuro += esperadoDia(f, iso, null);
    }
    let restoHoje = 0;
    for (const f of fs) {
      const feito = agregadoDoDia(diaVendas(f.id, HOJE_ISO)!, null).faturamento;
      restoHoje += Math.max(0, esperadoDia(f, HOJE_ISO, null) - feito);
    }
    // A faixa se estreita conforme o mês avança: menos dias por vir, menos incerteza.
    const fracaoRestante = divSeguro(futuro + restoHoje, realizado + futuro + restoHoje);
    const amplitude = 0.06 + 0.22 * fracaoRestante;
    projecao = realizado + futuro + restoHoje;
    pessimista = realizado + (futuro + restoHoje) * (1 - amplitude);
    otimista = realizado + (futuro + restoHoje) * (1 + amplitude);
    veredito = pessimista >= valor ? "atinge" : otimista < valor ? "nao_atinge" : "incerto";
  }

  return { valor, realizado, atingimentoPct, necessarioDia, diasRestantes, diaDoMes, diasNoMes: deIso(ultimoDia).getDate(), projecao, pessimista, otimista, veredito, fechada };
}

/** "abaixo do ritmo" / "no ritmo" / "acima do ritmo": realizado por dia contra o necessário por dia, a mesma conta em todo lugar que fala de ritmo. */
function statusRitmo(m: MetaCalculada): string {
  const emJogo = m.necessarioDia !== null;
  const ritmoDiario = m.diaDoMes > 0 ? m.realizado / m.diaDoMes : 0;
  if (m.fechada) return m.atingimentoPct >= 100 ? "meta batida" : "meta não batida";
  if (!emJogo) return "meta batida";
  if (ritmoDiario >= m.necessarioDia! * 1.05) return "acima do ritmo";
  if (ritmoDiario >= m.necessarioDia!) return "no ritmo";
  return "abaixo do ritmo";
}

/** Período anterior comparável, com o rótulo que a tela exibe. */
export function periodoAnterior(periodo: PeriodoResolvido): { inicio: string; fim: string; rotulo: string; horaMax?: number } {
  if (periodo.granularidade === "dia") {
    const ref = somarDias(periodo.inicio, -7);
    return { inicio: ref, fim: ref, rotulo: `${DIAS_SEMANA[deIso(ref).getDay()]} passada`, horaMax: periodo.ehHoje ? HORA_ATUAL : undefined };
  }
  if (periodo.granularidade === "mes") {
    const ini = deIso(periodo.inicio);
    const mesAnt = new Date(ini.getFullYear(), ini.getMonth() - 1, 1);
    const inicio = `${mesAnt.getFullYear()}-${String(mesAnt.getMonth() + 1).padStart(2, "0")}-01`;
    const fim = periodo.mesAberto ? somarDias(inicio, deIso(periodo.fim).getDate() - 1) : fimDoMes(inicio);
    return { inicio, fim, rotulo: mesAno(inicio).split(" de ")[0] };
  }
  const n = intervaloDias(periodo.inicio, periodo.fim).length;
  const fim = somarDias(periodo.inicio, -1);
  return { inicio: somarDias(fim, -(n - 1)), fim, rotulo: `os ${n} dias anteriores` };
}

/** "15/09/2026" para um único dia, "01/09/2026 – 07/09/2026" para um intervalo. */
function formatarIntervalo(inicio: string, fim: string): string {
  return inicio === fim ? dataCompleta(inicio) : `${dataCompleta(inicio)} – ${dataCompleta(fim)}`;
}

interface CustoAgregado {
  cmv: number;
  porCategoria: Record<number, { faturamento: number; cmv: number }>;
}

function custoPeriodo(fs: Filial[], inicio: string, fim: string, divisao: Divisao | null): CustoAgregado {
  const out: CustoAgregado = { cmv: 0, porCategoria: {} };
  for (const f of fs) {
    for (const d of diasVendas(f.id, inicio, fim)) {
      for (const [id, c] of Object.entries(d.porCategoria)) {
        const cat = categorias.find((x) => x.id === Number(id));
        if (!cat || (divisao && cat.divisao !== divisao)) continue;
        const acc = (out.porCategoria[cat.id] ??= { faturamento: 0, cmv: 0 });
        acc.faturamento += c.faturamento;
        acc.cmv += c.cmv;
        out.cmv += c.cmv;
      }
    }
  }
  return out;
}

/** Alertas de sistema: aparecem acima de tudo e somem quando resolvem. */
function montarAlertas(fs: Filial[]): AlertaSistema[] {
  const alertas: AlertaSistema[] = [];
  const minutosSemSync = Math.floor((AGORA.getTime() - ULTIMO_SYNC.getTime()) / 60000);
  if (minutosSemSync > 60) {
    const h = Math.floor(minutosSemSync / 60);
    alertas.push({ id: "sync", tom: "warning", texto: `Dados de ${ATUALIZADO_AS}. Sync não roda há ${h}h${String(minutosSemSync % 60).padStart(2, "0")}.` });
  }
  for (const f of fs.filter((x) => x.id === "f2")) {
    alertas.push({ id: `nota-${f.id}`, tom: "info", texto: `${f.fantasia} tem 8 produtos com nota de entrada pendente.` });
  }
  return alertas;
}

/* ---------- Motor de trilho ---------- */

/** Curva de pesos normalizados: `peso(iso)` soma 1 nos dias abertos; `pesoBruto` é o valor pré-normalização. */
export interface CurvaReceita {
  peso: (iso: string) => number;
  pesoBruto: (iso: string) => number;
  soma: number;
}

/**
 * curvaReceita (AD-034): pesos diários normalizados (soma = 1 nos dias abertos)
 * derivados do histórico real de faturamento — média simples das quatro
 * ocorrências equivalentes anteriores do mesmo dia da semana; menos ocorrências
 * usa o que houver; nenhuma usa `pesoDia` como base.
 */
export function curvaReceita(fs: Filial[], competencia: string): CurvaReceita {
  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const pesos = new Map<string, number>();
  let soma = 0;
  for (const iso of intervaloDias(primeiroDia, ultimoDia)) {
    let bruto = 0;
    let abertas = 0;
    for (const f of fs) {
      if (!lojaAberta(f, iso)) continue;
      const ocas = ocorrenciasAnteriores(f, iso, 4);
      bruto += ocas.length > 0 ? ocas.reduce((s, d) => s + d.total.faturamento, 0) / ocas.length : pesoDia(f, iso);
      abertas++;
    }
    if (abertas === 0) continue; // nenhuma loja abre nesse dia
    pesos.set(iso, bruto);
    soma += bruto;
  }
  return {
    soma,
    peso: (iso: string) => (soma > 0 ? (pesos.get(iso) ?? 0) / soma : 0),
    pesoBruto: (iso: string) => pesos.get(iso) ?? 0,
  };
}

/** As últimas `n` ocorrências anteriores do mesmo dia da semana, com loja aberta (AD-034). */
function ocorrenciasAnteriores(f: Filial, iso: string, n: number): DiaVendasVendas[] {
  const out: DiaVendasVendas[] = [];
  for (let i = 7; out.length < n && i <= 28; i += 7) {
    const ref = somarDias(iso, -i);
    const d = diaVendas(f.id, ref);
    // Só contam ocorrências com loja aberta e registro no histórico (undefined antes do início).
    if (d && lojaAberta(f, ref)) out.push(d);
  }
  return out;
}

/** Tipo mínimo de DiaVendas usado pelas curvas. */
interface DiaVendasVendas {
  data: string;
  total: { faturamento: number; atendimentos: number };
}

/** Meta acumulada esperada até hoje: meta mensal × fração acumulada da curvaReceita (LOJA-01 AC 2-7). */
function metaAcumuladaAteHoje(fs: Filial[], competencia: string, metaValor: number, hojeIso: string): number {
  const curva = curvaReceita(fs, competencia);
  const primeiroDia = `${competencia}-01`;
  let fração = 0;
  for (const iso of intervaloDias(primeiroDia, hojeIso)) fração += curva.peso(iso);
  return metaValor * fração;
}

/** Status do trilho do mês (LOJA-01). */
function calcularTrilho(fs: Filial[], competencia: string): TrilhoView | null {
  const metasFs = fs.map((f) => metaDaFilial(f.id, competencia)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  if (metasFs.length === 0) return null;
  const valor = metasFs.reduce((s, m) => s + m.valorLoja, 0);

  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const fechada = ultimoDia < HOJE_ISO;
  const fimReal = fechada ? ultimoDia : HOJE_ISO;
  const realizado = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).faturamento, 0);

  const metaAcum = metaAcumuladaAteHoje(fs, competencia, valor, fimReal);

  let status: StatusTrilho;
  let pctTrilho: number | null;
  if (fechada) {
    status = realizado >= valor ? "meta_batida" : "meta_nao_batida";
    pctTrilho = null;
  } else {
    const pct = metaAcum > 0 ? (realizado / metaAcum) * 100 : 0;
    pctTrilho = pct;
    status = pct >= 98 ? "no_trilho" : pct >= 90 ? "atencao" : "abaixo";
  }
  return { status, pctTrilho, competencia };
}

/** Venda necessária hoje (LOJA-02): (falta × pesoHoje ÷ Σ pesos restantes) − realizadoHoje. */
function vendaNecessariaHoje(fs: Filial[], competencia: string): VendaNecessariaView | null {
  const metasFs = fs.map((f) => metaDaFilial(f.id, competencia)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  if (metasFs.length === 0) return { valor: null, realizadoHoje: 0, faltaRestante: 0, diasRestantes: 0, diaReferencia: HOJE_ISO, cumpridaHoje: false, metaMesAtingida: false, semMeta: true };

  const valor = metasFs.reduce((s, m) => s + m.valorLoja, 0);
  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const fechada = ultimoDia < HOJE_ISO;
  const fimReal = fechada ? ultimoDia : HOJE_ISO;
  const realizado = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).faturamento, 0);
  if (fechada) return null;

  const realizadoHoje = fs.reduce((s, f) => s + (diaVendas(f.id, HOJE_ISO) ? agregadoDoDia(diaVendas(f.id, HOJE_ISO)!, null).faturamento : 0), 0);
  const faltaRestante = valor - realizado;
  const curva = curvaReceita(fs, competencia);
  const abertosRestantes = intervaloDias(HOJE_ISO, ultimoDia).filter((iso) => fs.some((f) => lojaAberta(f, iso)));
  if (abertosRestantes.length === 0) return null;

  // Dia de referência: hoje se aberto, senão o próximo dia aberto (LOJA-02 AC 5).
  const diaRef = fs.some((f) => lojaAberta(f, HOJE_ISO)) ? HOJE_ISO : abertosRestantes[0];
  const pesoHoje = curva.peso(diaRef);
  const somaPesosRest = abertosRestantes.reduce((s, iso) => s + curva.peso(iso), 0);
  const faltaRestanteRef = valor - realizado; // gap absoluto no mês (sem descontar a projeção futura)
  const necessarioBruto = somaPesosRest > 0 ? (faltaRestanteRef * pesoHoje) / somaPesosRest : 0;
  const valorHoje = Math.max(0, necessarioBruto - (diaRef === HOJE_ISO ? realizadoHoje : 0));

  return {
    valor: valorHoje,
    realizadoHoje,
    faltaRestante,
    diasRestantes: abertosRestantes.length,
    diaReferencia: diaRef,
    cumpridaHoje: valorHoje === 0 && realizado > 0,
    metaMesAtingida: realizado >= valor,
    semMeta: false,
  };
}

/** Projeção de fechamento (LOJA-03): índice da competência × curva restante, com gate do dia 7. */
function calcularProjecao(fs: Filial[], competencia: string): ProjecaoView {
  const metasFs = fs.map((f) => metaDaFilial(f.id, competencia)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  const valor = metasFs.reduce((s, m) => s + m.valorLoja, 0);
  if (metasFs.length === 0) return { valor: null, disponivel: false, encerrada: false, indice: null, metaValor: 0 };

  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const fechada = ultimoDia < HOJE_ISO;
  const fimReal = fechada ? ultimoDia : HOJE_ISO;
  const realizado = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).faturamento, 0);

  if (fechada) return { valor: realizado, disponivel: false, encerrada: true, indice: null, metaValor: valor };

  const diaDoMes = deIso(fimReal).getDate();
  if (diaDoMes < 7) return { valor: null, disponivel: false, encerrada: false, indice: null, metaValor: valor };

  const metaAcum = metaAcumuladaAteHoje(fs, competencia, valor, fimReal);
  const indice = metaAcum > 0 ? realizado / metaAcum : 0;
  const fracaoRestante = 1 - metaAcumuladaAteHoje(fs, competencia, 1, fimReal);
  const projecao = realizado + valor * fracaoRestante * indice;
  return { valor: projecao, disponivel: true, encerrada: false, indice, metaValor: valor };
}

/** curvaAtendimentos (AD-034): pesos diários normalizados a partir do histórico de atendimentos. */
function curvaAtendimentos(fs: Filial[], competencia: string): CurvaReceita {
  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const pesos = new Map<string, number>();
  let soma = 0;
  for (const iso of intervaloDias(primeiroDia, ultimoDia)) {
    let bruto = 0;
    let abertas = 0;
    for (const f of fs) {
      if (!lojaAberta(f, iso)) continue;
      const ocas = ocorrenciasAnteriores(f, iso, 4);
      bruto += ocas.length > 0 ? ocas.reduce((s, d) => s + d.total.atendimentos, 0) / ocas.length : pesoDia(f, iso);
      abertas++;
    }
    if (abertas === 0) continue;
    pesos.set(iso, bruto);
    soma += bruto;
  }
  return {
    soma,
    peso: (iso: string) => (soma > 0 ? (pesos.get(iso) ?? 0) / soma : 0),
    pesoBruto: (iso: string) => pesos.get(iso) ?? 0,
  };
}

/** Diagnóstica a lacuna de receita entre fluxo e ticket (LOJA-04 AC 1-9). */
function calcularLacuna(fs: Filial[], competencia: string, pctTrilho: number | null): LacunaView {
  const metasFs = fs.map((f) => metaDaFilial(f.id, competencia)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  if (metasFs.length === 0) return { exibir: false, efeitoFluxo: 0, efeitoTicket: 0, gapTotal: 0, alavancaDominante: null, semMeta: true };

  const meta = metasFs.reduce((s, m) => s + m.valorLoja, 0);
  const primeiroDia = `${competencia}-01`;
  const ultimoDia = fimDoMes(primeiroDia);
  const fechada = ultimoDia < HOJE_ISO;
  const fimReal = fechada ? ultimoDia : HOJE_ISO;

  // Atendimentos esperados no mês: soma da curvaAtendimentos (peso normalizado × faturamento? Não—
  // é o total esperado de atendimentos do mês). O total esperado = (média diária × dias abertos).
  const cA = curvaAtendimentos(fs, competencia);
  const cR = curvaReceita(fs, competencia);
  // Total esperado do mês = soma dos pesos brutos de atendimentos (cada dia = média de 4 semanas).
  const totalEsperadoMes = cA.soma; // soma dos pesos brutos = média diária × nº dias — já é n atendimentos esperados.
  const ticketMeta = totalEsperadoMes > 0 ? meta / totalEsperadoMes : 0;

  // Atendimentos esperados até hoje = total mensal × fração acumulada da curvaReceita.
  const fracaoAcumReceita = intervaloDias(primeiroDia, fimReal).reduce((s, iso) => s + cR.peso(iso), 0);
  const atendimentosEsperadosAteHoje = totalEsperadoMes * fracaoAcumReceita;

  // Atendimentos realizados até hoje.
  const atendimentosRealizadosAteHoje = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).atendimentos, 0);

  // Ticket realizado até hoje.
  const realizadoReceita = fs.reduce((s, f) => s + agregadoPeriodo(f, primeiroDia, fimReal, null).faturamento, 0);
  const ticketRealAteHoje = atendimentosRealizadosAteHoje > 0 ? realizadoReceita / atendimentosRealizadosAteHoje : 0;

  // Efeitos (LOJA-04 AC 5-6); interação já contida no efeito fluxo.
  const efeitoFluxo = (atendimentosEsperadosAteHoje - atendimentosRealizadosAteHoje) * ticketMeta;
  const efeitoTicket = (ticketMeta - ticketRealAteHoje) * atendimentosRealizadosAteHoje;
  const gapTotal = meta * fracaoAcumReceita - realizadoReceita;

  // Alavanca dominante (AC 8-9): apenas efeitos positivos; maior ≥ 60% da soma dos positivos.
  const positivos = [efeitoFluxo, efeitoTicket].filter((e) => e > 0);
  const somaPositivos = positivos.reduce((s, e) => s + e, 0);
  let alavancaDominante: LacunaView["alavancaDominante"] = null;
  if (somaPositivos > 0 && positivos.length > 0) {
    const maior = Math.max(...positivos);
    if (maior >= 0.6 * somaPositivos) alavancaDominante = efeitoFluxo >= efeitoTicket ? "fluxo" : "ticket";
  }

  // Exibe apenas quando pctTrilho < 90 (AD-033).
  return {
    exibir: pctTrilho !== null && pctTrilho < 90,
    efeitoFluxo,
    efeitoTicket,
    gapTotal,
    alavancaDominante,
    semMeta: false,
  };
}

/** Mix do período/marca selecionados: participação por categoria com margem (LOJA-04 AC 10). */
function montarMix(fs: Filial[], inicio: string, fim: string, divisao: Divisao | null, rotuloPeriodo: string): MixView {
  const catResumo = new Map<number, { receita: number; cmv: number }>();
  for (const f of fs) {
    for (const d of diasVendas(f.id, inicio, fim)) {
      for (const [id, c] of Object.entries(d.porCategoria)) {
        const cat = categorias.find((x) => x.id === Number(id));
        if (!cat || (divisao && cat.divisao !== divisao)) continue;
        let acc = catResumo.get(cat.id);
        if (!acc) {
          acc = { receita: 0, cmv: 0 };
          catResumo.set(cat.id, acc);
        }
        acc.receita += c.faturamento;
        acc.cmv += c.cmv;
      }
    }
  }
  const total = [...catResumo.values()].reduce((s, c) => s + c.receita, 0);
  const itens = [...catResumo.entries()]
    .map(([id, c]) => {
      const cat = categorias.find((x) => x.id === id)!;
      const margem = c.receita - c.cmv;
      return { categoria: cat.nome, divisao: cat.divisao, margem, receita: c.receita, pct: total > 0 ? (c.receita / total) * 100 : 0 };
    })
    .sort((a, b) => b.receita - a.receita);
  return { itens, periodo: rotuloPeriodo };
}

/** Visão de grupo (LOJA-05): status do trilho por loja na competência. */
function montarLojasGrupo(fs: Filial[], competencia: string): LojaResumoView[] {
  return fs.map((f) => {
    const trilho = calcularTrilho([f], competencia);
    return {
      filialId: f.id,
      nome: f.fantasia,
      pctTrilho: trilho?.pctTrilho ?? null,
      status: trilho?.status ?? "abaixo",
      temMeta: Boolean(metaDaFilial(f.id, competencia)),
    };
  });
}

export function montarLojaView(escopo: Escopo): LojaView {
  const periodo = resolverPeriodo(escopo.periodo);
  const fs = filiaisDoEscopo(escopo);
  const divisao = escopo.divisao;
  const todas = escopo.filialIds.length === 0 || escopo.filialIds.length > 1;
  const unica = todas ? null : fs[0];
  const visao: LojaView["visao"] = todas ? "rede" : periodo.granularidade === "dia" ? "dia" : "periodo";

  const atual = somarAgregados(fs.map((f) => agregadoPeriodo(f, periodo.inicio, periodo.fim, divisao)));
  const ant = periodoAnterior(periodo);
  const anterior = somarAgregados(fs.map((f) => agregadoPeriodo(f, ant.inicio, ant.fim, divisao, ant.horaMax)));

  const ticket = divSeguro(atual.faturamento, atual.atendimentos);
  const pa = divSeguro(atual.itens, atual.atendimentos);
  const ticketAnt = divSeguro(anterior.faturamento, anterior.atendimentos);
  const paAnt = divSeguro(anterior.itens, anterior.atendimentos);

  const temComparacao = anterior.atendimentos > 0;
  const vsRotulo = temComparacao ? ant.rotulo : undefined;
  const series = seriesTendencia(fs, periodo, divisao);
  const kpiTicket: KpiValor = { valor: brl(ticket), delta: temComparacao ? kpiDelta(ticket, ticketAnt, vsRotulo) : undefined, serie: series.ticket };
  const kpiPA: KpiValor = { valor: num(pa, 2), delta: temComparacao ? kpiDelta(pa, paAnt, vsRotulo) : undefined, serie: series.pa };

  // Meta é sempre mensal. Divisão ou período cruzando meses desligam.
  const competencia = periodo.granularidade === "mes" ? periodo.inicio.slice(0, 7) : HOJE_ISO.slice(0, 7);
  const semMetaPeriodo = periodo.atravessaMeses && periodo.granularidade !== "mes";
  const metaCalc = divisao || semMetaPeriodo ? null : calcularMeta(fs, competencia);

  // Subtítulos: cada KPI fala só do próprio indicador (AD-048).
  // Faturamento NÃO repete atendimentos nem “precisa R$/dia” (régua/meta cobrem ritmo).
  const nDiasPeriodo = intervaloDias(periodo.inicio, periodo.fim).length;
  let subFaturamento: string | undefined;
  if (!divisao && metaCalc) {
    if (metaCalc.atingimentoPct >= 100) subFaturamento = "meta do mês atingida";
    else if (periodo.granularidade === "mes") subFaturamento = `${pct(metaCalc.atingimentoPct)} da meta`;
    else subFaturamento = `${pct(metaCalc.atingimentoPct)} da meta do mês`;
  } else if (periodo.granularidade !== "dia" && nDiasPeriodo > 0) {
    subFaturamento = `média ${brlK(atual.faturamento / nDiasPeriodo)}/dia`;
  }

  const kpiAtendimentos: KpiValor = {
    valor: num(atual.atendimentos),
    delta: temComparacao ? kpiDelta(atual.atendimentos, anterior.atendimentos, vsRotulo) : undefined,
    serie: series.atendimentos,
    sub: periodo.granularidade !== "dia" && nDiasPeriodo > 0 ? `média ${num(atual.atendimentos / nDiasPeriodo, 0)}/dia` : undefined,
  };

  const kpiFaturamento: KpiValor = {
    valor: brlK(atual.faturamento),
    delta: temComparacao ? kpiDelta(atual.faturamento, anterior.faturamento, vsRotulo) : undefined,
    serie: series.faturamento,
    // O período já está no filtro logo acima do card; sem sufixo "· HOJE".
    // A marca selecionada continua no rótulo porque muda o dado.
    rotulo: `FATURAMENTO${divisao ? ` ${divisao}` : ""}`,
    sub: subFaturamento,
  };

  // Segundo tile: Participação da marca quando filtrado, Meta/Projeção quando não.
  let tileMeta: TileMetaProjecao | null = null;
  if (divisao) {
    const totalTudo = somarAgregados(fs.map((f) => agregadoPeriodo(f, periodo.inicio, periodo.fim, null))).faturamento;
    const participacaoPct = totalTudo > 0 ? (atual.faturamento / totalTudo) * 100 : 0;
    tileMeta = {
      tipo: "participacao",
      rotulo: "PARTICIPAÇÃO",
      valorPrincipal: pct(participacaoPct),
      barraPct: Math.min(100, participacaoPct),
      detalhe: `do faturamento da ${visao === "rede" ? "rede" : "loja"}`,
    };
  } else if (semMetaPeriodo) {
    tileMeta = { tipo: "indisponivel", rotulo: "META DO MÊS", valorPrincipal: "—", barraPct: 0, detalhe: "meta é mensal" };
  } else if (metaCalc) {
    if (periodo.granularidade === "mes") {
      if (!metaCalc.fechada && metaCalc.projecao === null) {
        tileMeta = { tipo: "projecao", rotulo: "PROJEÇÃO", valorPrincipal: "—", barraPct: 0, detalhe: "Projeção disponível a partir do dia 7" };
      } else {
        const valorFinal = metaCalc.fechada ? metaCalc.realizado : metaCalc.projecao!;
        const pctFinal = metaCalc.valor > 0 ? (valorFinal / metaCalc.valor) * 100 : 0;
        tileMeta = {
          tipo: "projecao",
          rotulo: "PROJEÇÃO",
          valorPrincipal: brlK(valorFinal),
          barraPct: Math.min(100, pctFinal),
          detalhe: `${pct(pctFinal)} da meta · ${statusRitmo(metaCalc)}`,
        };
      }
    } else {
      tileMeta = {
        tipo: "meta",
        rotulo: "META DO MÊS",
        valorPrincipal: pct(metaCalc.atingimentoPct),
        barraPct: Math.min(100, metaCalc.atingimentoPct),
        detalhe: `${brlK(metaCalc.realizado)} de ${brlK(metaCalc.valor)} · ${statusRitmo(metaCalc)}`,
      };
    }
  }

  // Ritmo da meta: aparece em qualquer visão (rede ou loja) sempre que houver
  // uma meta mensal aplicável — some só com marca filtrada ou período cruzando
  // meses (metaCalc já vem null nesses dois casos). Sem meta cadastrada, uma
  // linha de aviso no lugar do card. Mês fechado: "Projeção" vira "Fechou em".
  let ritmo: RitmoCard | null = null;
  let ritmoAviso: string | null = null;
  if (!divisao && !semMetaPeriodo) {
    if (!metaCalc) {
      ritmoAviso = `Sem meta cadastrada para ${mesAno(`${competencia}-01`).split(" de ")[0]}.`;
    } else {
      const ritmoDiario = metaCalc.diaDoMes > 0 ? metaCalc.realizado / metaCalc.diaDoMes : 0;
      const necessarioTexto = metaCalc.necessarioDia !== null ? brlK(metaCalc.necessarioDia) : metaCalc.atingimentoPct >= 100 ? "Meta batida" : "—";
      const barraPct = metaCalc.fechada
        ? Math.min(100, metaCalc.atingimentoPct)
        : metaCalc.projecao !== null && metaCalc.valor > 0
          ? Math.min(100, (metaCalc.projecao / metaCalc.valor) * 100)
          : 0;
      ritmo = {
        realizadoDia: brlK(ritmoDiario),
        necessarioDia: necessarioTexto,
        barraPct,
        projecaoLinha: metaCalc.fechada ? `Fechou em ${brlK(metaCalc.realizado)}` : metaCalc.projecao !== null ? `Projeção ${brlK(metaCalc.projecao)}` : "Projeção disponível a partir do dia 7",
      };
    }
  }

  const avisos: string[] = [];
  if (semMetaPeriodo) avisos.push("Meta e lucro bruto são mensais e não aparecem neste período.");
  if (divisao) avisos.push(`Marca ${divisao} selecionada. Meta e projeção são da loja inteira e não aparecem no recorte por marca.`);

  /* --- Régua de lojas e pontos de atenção --- */
  let regua: LinhaRegua[] | null = null;
  let pontosAtencao: PontoAtencao[] | null = null;
  let reguaTitulo: string = "Desempenho das lojas";
  // Sempre adaptamos ao filtro (AD-047): rede = uma linha por loja; loja única =
  // painel de meta (ou de participação da marca, se houver marca). Nunca some.
  if (visao === "rede" || unica) {
    const variacaoBadge = (v: number | null): { value: string; positive: boolean } | null => {
      if (v === null) return null;
      if (Math.abs(v) < 0.5) return { value: "=", positive: true };
      return { value: fmtDelta(v, Math.abs(v) < 10 ? 1 : 0).replace(/^[+−]/, ""), positive: v >= 0 };
    };
    const variacaoDoDia = (f: Filial) => {
      const hojeF = agregadoDoDia(diaVendas(f.id, HOJE_ISO)!, divisao).faturamento;
      const refIso = somarDias(HOJE_ISO, -7);
      const diaRef = diaVendas(f.id, refIso);
      const refF = diaRef ? agregadoDoDia(diaRef, divisao, HORA_ATUAL).faturamento : 0;
      return refF > 0 ? pctDelta(hojeF, refF) : null;
    };

    if (unica && divisao) {
      // Loja + marca: painel da participação da marca no faturamento da loja.
      const fatMarca = agregadoPeriodo(unica, periodo.inicio, periodo.fim, divisao).faturamento;
      const fatLoja = agregadoPeriodo(unica, periodo.inicio, periodo.fim, null).faturamento;
      const participacao = fatLoja > 0 ? (fatMarca / fatLoja) * 100 : 0;
      const indiceCor = filiais.findIndex((x) => x.id === unica.id);
      reguaTitulo = `Desempenho · ${divisao === "WPINK" ? "Wpink" : "Wepink"}`;
      regua = [
        {
          filialId: unica.id,
          nome: unica.fantasia,
          faturamento: brlK(fatMarca),
          faturamentoValor: fatMarca,
          atingimentoPct: participacao,
          atingimentoTexto: `${pct(participacao)} da loja`,
          barraPct: Math.min(100, participacao),
          tint: PALETA_LOJAS[indiceCor % PALETA_LOJAS.length],
          variacaoDia: variacaoBadge(variacaoDoDia(unica)),
          variacaoDiaValor: variacaoDoDia(unica),
        },
      ];
      pontosAtencao = null;
    } else if (divisao) {
      // Rede + marca: a barra vira participação daquela loja no total da marca.
      const receitas = fs.map((f) => ({ f, receita: agregadoPeriodo(f, periodo.inicio, periodo.fim, divisao).faturamento }));
      const totalMarca = receitas.reduce((s, r) => s + r.receita, 0);
      regua = receitas
        .map(({ f, receita }) => {
          const participacao = totalMarca > 0 ? (receita / totalMarca) * 100 : 0;
          const indiceCor = filiais.findIndex((x) => x.id === f.id);
          return { filialId: f.id, nome: f.fantasia, receita, participacao, tint: PALETA_LOJAS[indiceCor % PALETA_LOJAS.length], variacaoDiaValor: variacaoDoDia(f) };
        })
        .sort((a, b) => b.participacao - a.participacao)
        .map((b) => ({
          filialId: b.filialId,
          nome: b.nome,
          faturamento: brlK(b.receita),
          faturamentoValor: b.receita,
          atingimentoPct: b.participacao,
          atingimentoTexto: `${pct(b.participacao)} da marca`,
          barraPct: Math.min(100, b.participacao),
          tint: b.tint,
          variacaoDia: variacaoBadge(b.variacaoDiaValor),
          variacaoDiaValor: b.variacaoDiaValor,
        }));
      pontosAtencao = null;
    } else {
      // Título no singular quando o escopo tem uma loja só (painel de meta dela);
      // plural na rede. Não há variação de hoje nem ordenação na loja única.
      reguaTitulo = fs.length > 1 ? "Desempenho das lojas" : "Desempenho da loja";
      const base = fs.map((f) => {
        const m = calcularMeta([f], competencia);
        const atingimento = m?.atingimentoPct ?? 0;
        const indiceCor = filiais.findIndex((x) => x.id === f.id);
        return { filialId: f.id, nome: f.fantasia, atingimento, tint: PALETA_LOJAS[indiceCor % PALETA_LOJAS.length], variacaoDiaValor: variacaoDoDia(f), m };
      });

      regua = [...base]
        .sort((a, b) => a.atingimento - b.atingimento)
        .map((b) => ({
          filialId: b.filialId,
          nome: b.nome,
          faturamento: brlK(b.m?.realizado ?? 0),
          faturamentoValor: b.m?.realizado ?? 0,
          atingimentoPct: b.atingimento,
          atingimentoTexto: `${pct(b.atingimento)} da meta`,
          barraPct: Math.min(100, b.atingimento),
          tint: b.tint,
          variacaoDia: variacaoBadge(b.variacaoDiaValor),
          variacaoDiaValor: b.variacaoDiaValor,
        }));

      // Ordenada por desempenho (régua), não por faturamento: quem está pior no
      // ritmo da própria meta aparece primeiro, seja loja grande ou pequena.
      pontosAtencao = base
        .filter((b) => b.m?.veredito === "nao_atinge" || b.m?.veredito === "incerto")
        .sort((a, b) => a.atingimento - b.atingimento)
        .map((b) => ({
          filialId: b.filialId,
          nome: b.nome,
          atingimentoTexto: pct(b.atingimento),
          status: statusRitmo(b.m!),
          faltaPorDia: b.m?.necessarioDia !== null && b.m?.necessarioDia !== undefined ? brlK(b.m.necessarioDia) : "Meta batida",
          veredito: b.m!.veredito as "nao_atinge" | "incerto",
        }));
    }
  }

  /* --- Por hora: loja única OU rede (soma) — mesmo gráfico AreaLine com comparação (AD-048) --- */
  let graficoHora: GraficoHora | null = null;
  if (periodo.granularidade === "dia" && fs.length > 0) {
    const refIso = somarDias(periodo.inicio, -7);
    const aberturaMin = Math.min(...fs.map((f) => f.abertura));
    const fechamentoMax = Math.max(...fs.map((f) => f.fechamento));
    const horas: number[] = [];
    for (let h = aberturaMin; h < fechamentoMax; h++) horas.push(h);

    const fatiaHora = (filialId: string, iso: string, h: number) => {
      const d = diaVendas(filialId, iso);
      const a = d?.porHora[h];
      if (!a) return 0;
      if (!divisao) return a.faturamento;
      const fr = d!.total.faturamento > 0 ? d!.porDivisao[divisao].faturamento / d!.total.faturamento : 0;
      return Math.round(a.faturamento * fr);
    };
    const somaHora = (iso: string, h: number) => fs.reduce((s, f) => s + fatiaHora(f.id, iso, h), 0);

    const valores = horas.map((h) => somaHora(periodo.inicio, h));
    const valoresAnt = horas.map((h) => {
      if (periodo.ehHoje && h > HORA_ATUAL) return 0;
      return somaHora(refIso, h);
    });
    const totalRef = valoresAnt.reduce((s, v) => s + v, 0);

    graficoHora = {
      horas,
      valores,
      anterior: totalRef > 0 ? valoresAnt : null,
      rotuloAnterior: `${DIAS_SEMANA[deIso(refIso).getDay()]} passada`,
      horaAtual: periodo.ehHoje ? HORA_ATUAL : null,
    };
  }

  /* Rede por loja empilhada: não usada na Visão geral — o gráfico principal unificou em AreaLine (AD-048). */
  const graficoHoraRede: GraficoHoraRede | null = null;

  /* --- Evolução diária: período > 1 dia (loja única OU rede) — AD-047 --- */
  let evolucao: GraficoEvolucao | null = null;
  if (periodo.granularidade !== "dia") {
    const dias = intervaloDias(periodo.inicio, periodo.fim);
    const diasAnt = intervaloDias(ant.inicio, ant.fim);
    const valores = dias.map((iso) => somarAgregados(fs.map((f) => agregadoDoDia(diaVendas(f.id, iso)!, divisao))).faturamento);
    const anteriores = diasAnt.map((iso) => somarAgregados(fs.map((f) => (diaVendas(f.id, iso) ? agregadoDoDia(diaVendas(f.id, iso)!, divisao) : { faturamento: 0, atendimentos: 0, itens: 0 }))).faturamento);
    evolucao = {
      rotulos: dias.map((iso) => (periodo.granularidade === "mes" ? String(deIso(iso).getDate()) : diaSemanaCurto(iso))),
      valores,
      anterior: anteriores.length === valores.length ? anteriores : null,
      rotuloAnterior: ant.rotulo,
    };
  }

  /* --- Checklist do dia: todos os turnos da loja, em Hoje ou Ontem --- */
  let checklist: ChecklistDia | null = null;
  if (unica && (periodo.tipo === "hoje" || periodo.tipo === "ontem")) {
    const turnosDaLoja = turnos.filter((x) => x.filialId === unica.id).sort((a, b) => a.horaInicio - b.horaInicio);
    if (turnosDaLoja.length > 0) {
      // Mock de conclusão: turno encerrado sai como tudo feito, turno em
      // andamento usa uma marcação fixa por turno, turno futuro nada feito.
      const feitasEmAndamento: Record<string, string[]> = { "t-f1-manha": ["tf1", "tf2", "tf3", "tf5"], "t-f2-tarde": ["tf14"] };
      const linhas: TurnoLinha[] = turnosDaLoja.map((t) => {
        const estado: TurnoLinha["estado"] = periodo.tipo === "ontem" ? "encerrado" : HORA_ATUAL >= t.horaFim ? "encerrado" : HORA_ATUAL >= t.horaInicio ? "andamento" : "naoComecou";
        const tarefasDoTurno = tarefas.filter((x) => x.turnoId === t.id).sort((a, b) => a.ordem - b.ordem);
        const feitasIds = estado === "andamento" ? (feitasEmAndamento[t.id] ?? []) : estado === "encerrado" ? tarefasDoTurno.map((x) => x.id) : [];
        const itens = tarefasDoTurno.map((x) => ({ titulo: x.titulo, feita: feitasIds.includes(x.id) }));
        return {
          id: t.id,
          nome: t.nome,
          horario: `${Math.max(t.horaInicio, unica.abertura)}h às ${Math.min(t.horaFim, unica.fechamento)}h`,
          estado,
          feitas: itens.filter((i) => i.feita).length,
          total: itens.length,
          tarefas: itens,
        };
      });
      checklist = { dataTexto: dataCurta(periodo.inicio), turnos: linhas };
    }
  }

  /* --- Lucro bruto e categorias: período de mês, dentro de uma loja. Continuam filtrados por marca. --- */
  let lucroBruto: LojaView["lucroBruto"] = null;
  let cats: CategoriaLinha[] | null = null;
  if (visao === "periodo" && periodo.granularidade === "mes") {
    const custo = custoPeriodo(fs, periodo.inicio, periodo.fim, divisao);
    const lucro = atual.faturamento - custo.cmv;

    let divisaoLinha: string | null = null;
    if (unica?.temWpink && !divisao) {
      const wepink = agregadoPeriodo(unica, periodo.inicio, periodo.fim, "WEPINK").faturamento;
      const wpink = agregadoPeriodo(unica, periodo.inicio, periodo.fim, "WPINK").faturamento;
      const totalMarca = wepink + wpink;
      if (totalMarca > 0) divisaoLinha = `Wepink ${brlK(wepink)} · ${pct((wepink / totalMarca) * 100, 0)} — Wpink ${brlK(wpink)} · ${pct((wpink / totalMarca) * 100, 0)}`;
    }

    lucroBruto = {
      itens: [
        { rotulo: "Faturamento", valor: brl(atual.faturamento), pct: "100%" },
        { rotulo: "CMV", valor: brl(custo.cmv), pct: pct(divSeguro(custo.cmv, atual.faturamento) * 100) },
        { rotulo: "Lucro bruto", valor: brl(lucro), pct: pct(divSeguro(lucro, atual.faturamento) * 100) },
      ],
      aviso: "Configure aluguel e custo fixo para ver a margem de contribuição.",
      divisaoLinha,
    };

    const catsBase = Object.entries(custo.porCategoria)
      .map(([id, v]) => {
        const cat = categorias.find((c) => c.id === Number(id))!;
        const margem = v.faturamento - v.cmv;
        return { categoriaId: cat.id, nome: cat.nome, margemValor: margem, receita: brl(v.faturamento), margem: brl(margem), margemPct: pct(divSeguro(margem, v.faturamento) * 100) };
      })
      .sort((a, b) => b.margemValor - a.margemValor)
      .slice(0, 4);
    const maiorMargem = Math.max(...catsBase.map((c) => c.margemValor), 1);
    cats = catsBase.map(({ categoriaId, nome, receita, margem, margemPct, margemValor }) => ({
      categoriaId,
      nome,
      receita,
      margem,
      margemPct,
      barraPct: Math.max(0, Math.round((margemValor / maiorMargem) * 100)),
    }));
  }

  // Motor de trilho: sempre da competência do período (AD-023).
  const competenciaTrilho = periodo.granularidade === "mes" ? periodo.inicio.slice(0, 7) : HOJE_ISO.slice(0, 7);
  const trilho = calcularTrilho(fs, competenciaTrilho);
  const vendaNecessaria = trilho ? vendaNecessariaHoje(fs, competenciaTrilho) : null;

  const view: LojaView = {
    escopo,
    periodo,
    atualizadoAs: ATUALIZADO_AS,
    proximoSyncMin: Math.max(0, INTERVALO_SYNC_MIN - Math.floor((AGORA.getTime() - ULTIMO_SYNC.getTime()) / 60000)),
    visao,
    alertas: montarAlertas(fs),
    leitura: null,
    avisos,
    comparacao: temComparacao
      ? {
          atual: { inicio: periodo.inicio, fim: periodo.fim, faturamento: atual.faturamento, atendimentos: atual.atendimentos, itens: atual.itens },
          anterior: { inicio: ant.inicio, fim: ant.fim, faturamento: anterior.faturamento, atendimentos: anterior.atendimentos, itens: anterior.itens },
          rotuloAtual: formatarIntervalo(periodo.inicio, periodo.fim),
          rotuloAnterior: formatarIntervalo(ant.inicio, ant.fim),
        }
      : null,
    trilho,
    vendaNecessaria,
    projecao: calcularProjecao(fs, competenciaTrilho),
    diagnostico: calcularLacuna(fs, competenciaTrilho, trilho?.pctTrilho ?? null),
    mix: visao === "periodo" ? montarMix(fs, periodo.inicio, periodo.fim, divisao, periodo.rotulo) : null,
    lojas: todas && periodo.granularidade === "mes" ? montarLojasGrupo(fs, competenciaTrilho) : [],
    estados: {
      kpis: "disponivel",
      trilho: trilho ? "disponivel" : "sem_dados",
      vendaNecessaria: vendaNecessaria ? "disponivel" : "sem_dados",
      projecao: trilho && vendaNecessaria ? "disponivel" : trilho ? "sem_dados" : "indisponivel",
      diagnostico: trilho?.status === "abaixo" ? "disponivel" : "sem_dados",
      mix: visao === "periodo" ? "disponivel" : "sem_dados",
      lojas: todas && periodo.granularidade === "mes" ? "disponivel" : "sem_dados",
    },
    kpiFaturamento,
    kpiTicket,
    kpiPA,
    kpiAtendimentos,
    tileMeta,
    ritmo,
    ritmoAviso,
    regua,
    reguaTitulo,
    pontosAtencao,
    graficoHora,
    graficoHoraRede,
    evolucao,
    checklist,
    lucroBruto,
    categorias: cats,
  };
  view.leitura = montarLeituraLoja(view);
  return view;
}

/* ================================================================
 * TELA FINANCEIRO — camada de dados (montarFinanceiroView)
 * ================================================================ */

export interface FinanceiroKpi {
  label: string;
  valor: string;
  delta?: { value: string; positive: boolean; vs?: string };
  serie?: number[];
  tooltip?: string;
}

export interface CustoLucroMes {
  mes: string;
  custo: number;
  lucro: number;
  margemPct: number;
  faturamento: number;
}

export interface FormaPagamentoFat {
  forma: string;
  valor: number;
  pct: number;
  cor: string;
}

export interface LinhaCustoFixo {
  rotulo: string;
  valor: number;
  ehTotal?: boolean;
  ehResultado?: boolean;
}

export interface EvolucaoMensalLinha {
  mes: string;
  faturamento: number;
  custo: number;
  lucro: number;
  margemPct: number;
  ticketMedio: number;
}

export interface FinanceiroView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  kpis: FinanceiroKpi[];
  custoLucroMargem: CustoLucroMes[];
  formasPagamento: FormaPagamentoFat[];
  custosFixosFranquia: LinhaCustoFixo[];
  evolucaoMensal: EvolucaoMensalLinha[];
  itensVsPreco: { label: string; qty: number; pa: number }[];
  faturamentoVsTicket: { label: string; faturamento: number; ticket: number }[];
}

const CORES_FORMAS: Record<string, string> = {
  Pix: "var(--ok)",
  "Cartão de crédito": "var(--acc)",
  "Cartão de débito": "var(--info)",
  Dinheiro: "var(--warn)",
};

/** Custos fixos e franquia mockados por filial (mensais). Na futura aba DRE viram CRUD. */
function custosFixosDaFilial(f: Filial): { aluguelFixo: number; aluguelPct: number; royalties: number; taxaMktWepink: number; taxaMktWpink: number } {
  // Valores base proporcionais ao porte da filial (baseDia dos parâmetros de vendas).
  const base = f.id === "f1" ? 6100 : 3450;
  const fator = base / 5000;
  return {
    aluguelFixo: Math.round(18000 * fator),
    aluguelPct: Math.round(9000 * fator),
    royalties: Math.round(12000 * fator),
    taxaMktWepink: Math.round(6000 * fator),
    taxaMktWpink: Math.round(4000 * fator),
  };
}

/** Últimos N meses (incluindo o atual) em ordem cronológica. */
function ultimosMeses(n: number): string[] {
  const hoje = deIso(HOJE_ISO);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function agregadoMes(fs: Filial[], mes: string, divisao: Divisao | null): Agregado & { cmv: number; porMeio: Record<string, number> } {
  const inicio = `${mes}-01`;
  const fim = fimDoMes(inicio);
  const agg = somarAgregados(fs.map((f) => agregadoPeriodo(f, inicio, fim, divisao)));
  const custo = custoPeriodo(fs, inicio, fim, divisao).cmv;
  // Soma das formas de pagamento no mês.
  const dias = intervaloDias(inicio, fim);
  const porMeio: Record<string, number> = {};
  for (const f of fs) {
    for (const diaIso of dias) {
      const dv = diaVendas(f.id, diaIso);
      if (!dv) continue;
      for (const [meio, val] of Object.entries(dv.porMeio)) {
        porMeio[meio] = (porMeio[meio] ?? 0) + val;
      }
    }
  }
  return { ...agg, cmv: custo, porMeio };
}

export function montarFinanceiroView(escopo: Escopo): FinanceiroView {
  const periodo = resolverPeriodo(escopo.periodo);
  const fs = filiaisDoEscopo(escopo);
  const divisao = escopo.divisao;

  // Atual e anterior para deltas dos KPIs.
  const atual = somarAgregados(fs.map((f) => agregadoPeriodo(f, periodo.inicio, periodo.fim, divisao)));
  const custoAtual = custoPeriodo(fs, periodo.inicio, periodo.fim, divisao).cmv;
  const ant = periodoAnterior(periodo);
  const anterior = somarAgregados(fs.map((f) => agregadoPeriodo(f, ant.inicio, ant.fim, divisao, ant.horaMax)));
  const custoAnterior = custoPeriodo(fs, ant.inicio, ant.fim, divisao).cmv;

  const lucroAtual = atual.faturamento - custoAtual;
  const lucroAnterior = anterior.faturamento - custoAnterior;
  const margemAtual = divSeguro(lucroAtual, atual.faturamento) * 100;
  const margemAnterior = divSeguro(lucroAnterior, anterior.faturamento) * 100;
  const ticketAtual = divSeguro(atual.faturamento, atual.atendimentos);
  const ticketAnterior = divSeguro(anterior.faturamento, anterior.atendimentos);

  const temComp = anterior.atendimentos > 0;
  const vsRotulo = temComp ? ant.rotulo : undefined;

  // Séries de tendência (últimos 7 pontos do período, ou 7 dias se período curto).
  const serieFaturamento = seriesTendencia(fs, periodo, divisao).faturamento.slice(-7);
  const serieCmv = serieFaturamento.map((_, i) => {
    const frac = custoAtual / (atual.faturamento || 1);
    return Math.round(serieFaturamento[i] * frac);
  });
  const serieLucro = serieFaturamento.map((v, i) => v - serieCmv[i]);
  const serieMargem = serieFaturamento.map((v, i) => v > 0 ? ((v - serieCmv[i]) / v) * 100 : 0);

  const kpis: FinanceiroKpi[] = [
    {
      label: "Faturamento",
      valor: brlK(atual.faturamento),
      delta: temComp ? kpiDelta(atual.faturamento, anterior.faturamento, vsRotulo) : undefined,
      serie: serieFaturamento,
      tooltip: "Receita bruta total das vendas no período selecionado.",
    },
    {
      label: "Custo dos produtos",
      valor: brlK(custoAtual),
      delta: temComp ? kpiDelta(custoAtual, custoAnterior, vsRotulo) : undefined,
      serie: serieCmv,
      tooltip: "CMV — quanto custou a mercadoria vendida. Se sobe mais que o faturamento, corrói margem.",
    },
    {
      label: "Lucro bruto",
      valor: brlK(lucroAtual),
      delta: temComp ? kpiDelta(lucroAtual, lucroAnterior, vsRotulo) : undefined,
      serie: serieLucro,
      tooltip: "Faturamento − CMV. O que sobra antes de descontar aluguel, salários etc.",
    },
    {
      label: "Margem",
      valor: pct(margemAtual),
      delta: temComp ? { value: `${Math.abs(margemAtual - margemAnterior).toFixed(1)} p.p.`, positive: margemAtual >= margemAnterior, vs: vsRotulo } : undefined,
      serie: serieMargem,
      tooltip: "Quantos centavos de lucro cada R$ 1 vendido deixa (antes das despesas fixas).",
    },
  ];

  // Custo/Lucro/Margem por mês (últimos 6 meses).
  const meses = ultimosMeses(6);
  const custoLucroMargem: CustoLucroMes[] = meses.map((mes) => {
    const agg = agregadoMes(fs, mes, divisao);
    const lucro = agg.faturamento - agg.cmv;
    return {
      mes: mesAno(`${mes}-01`).split(" de ")[0],
      custo: agg.cmv,
      lucro,
      margemPct: divSeguro(lucro, agg.faturamento) * 100,
      faturamento: agg.faturamento,
    };
  });

  // Formas de pagamento no período.
  const diasPeriodo = intervaloDias(periodo.inicio, periodo.fim);
  const totaisForma: Record<string, number> = {};
  for (const f of fs) {
    for (const diaIso of diasPeriodo) {
      const dv = diaVendas(f.id, diaIso);
      if (!dv) continue;
      for (const [meio, val] of Object.entries(dv.porMeio)) {
        totaisForma[meio] = (totaisForma[meio] ?? 0) + val;
      }
    }
  }
  const totalFormas = Object.values(totaisForma).reduce((s, v) => s + v, 0) || 1;
  const formasPagamento: FormaPagamentoFat[] = Object.entries(totaisForma)
    .sort((a, b) => b[1] - a[1])
    .map(([forma, valor]) => ({
      forma,
      valor,
      pct: (valor / totalFormas) * 100,
      cor: CORES_FORMAS[forma] ?? "var(--t2)",
    }));

  // Custos fixos e franquia (mini-DRE → Resultado Operacional).
  const custosAgg = fs.reduce(
    (acc, f) => {
      const c = custosFixosDaFilial(f);
      acc.aluguelFixo += c.aluguelFixo;
      acc.aluguelPct += c.aluguelPct;
      acc.royalties += c.royalties;
      acc.taxaMktWepink += c.taxaMktWepink;
      acc.taxaMktWpink += c.taxaMktWpink;
      return acc;
    },
    { aluguelFixo: 0, aluguelPct: 0, royalties: 0, taxaMktWepink: 0, taxaMktWpink: 0 },
  );
  const totalCustosFixos = custosAgg.aluguelFixo + custosAgg.aluguelPct + custosAgg.royalties + custosAgg.taxaMktWepink + custosAgg.taxaMktWpink;
  const resultadoOperacional = lucroAtual - totalCustosFixos;
  const custosFixosFranquia: LinhaCustoFixo[] = [
    { rotulo: "Lucro bruto", valor: lucroAtual },
    { rotulo: "Aluguel fixo", valor: custosAgg.aluguelFixo },
    { rotulo: "Aluguel % shopping", valor: custosAgg.aluguelPct },
    { rotulo: "Royalties", valor: custosAgg.royalties },
    { rotulo: "Taxa marketing WEPINK", valor: custosAgg.taxaMktWepink },
    { rotulo: "Taxa marketing WPINK", valor: custosAgg.taxaMktWpink },
    { rotulo: "Total custos fixos", valor: totalCustosFixos, ehTotal: true },
    { rotulo: "Resultado operacional", valor: resultadoOperacional, ehResultado: true },
  ];

  // Itens vendidos vs Preço médio (PA) por mês.
  const itensVsPreco = meses.map((mes) => {
    const agg = agregadoMes(fs, mes, divisao);
    return {
      label: mesAno(`${mes}-01`).split(" de ")[0],
      qty: agg.itens,
      pa: divSeguro(agg.faturamento, agg.itens),
    };
  });

  // Faturamento vs Ticket médio por mês.
  const faturamentoVsTicket = meses.map((mes) => {
    const agg = agregadoMes(fs, mes, divisao);
    return {
      label: mesAno(`${mes}-01`).split(" de ")[0],
      faturamento: agg.faturamento,
      ticket: divSeguro(agg.faturamento, agg.atendimentos),
    };
  });

  // Evolução mensal (tabela DRE simplificada).
  const evolucaoMensal: EvolucaoMensalLinha[] = meses.map((mes) => {
    const agg = agregadoMes(fs, mes, divisao);
    const lucro = agg.faturamento - agg.cmv;
    return {
      mes: mesAno(`${mes}-01`).split(" de ")[0],
      faturamento: agg.faturamento,
      custo: agg.cmv,
      lucro,
      margemPct: divSeguro(lucro, agg.faturamento) * 100,
      ticketMedio: divSeguro(agg.faturamento, agg.atendimentos),
    };
  });

  return {
    escopo,
    periodo,
    kpis,
    custoLucroMargem,
    formasPagamento,
    custosFixosFranquia,
    evolucaoMensal,
    itensVsPreco,
    faturamentoVsTicket,
  };
}

/* ================================================================
 * TELA PRODUTOS — camada de dados (montarProdutosView)
 * ================================================================ */

import { produtosDaCategoria, type ProdutoResumo } from "./produtos";

export interface ProdutosKpi {
  label: string;
  valor: string;
  delta?: { value: string; positive: boolean; vs?: string };
  serie?: number[];
  tooltip?: string;
}

export interface CategoriaFat {
  categoriaId: number;
  nome: string;
  faturamento: number;
  cmv: number;
  lucro: number;
  margemPct: number;
  itens: number;
}

export interface LinhaProduto {
  nome: string;
  faturamento: number;
}

export interface ProdutoLinha extends ProdutoResumo {
  categoriaNome: string;
  cmv: number;
  cmvPct: number;
  ticketMedio: number;
  tmPorItem: number;
  tendencia: "up" | "down" | "flat";
}

export interface ProdutosView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  kpis: ProdutosKpi[];
  categorias: CategoriaFat[];
  topLinhas: LinhaProduto[];
  /** Filtro de categoria ativo na view (null = todas). */
  categoriaFiltro: number | null;
  produtos: ProdutoLinha[];
}

/** Deriva "linha de produto" do nome (primeiras 1-2 palavras significativas). */
function extrairLinha(nome: string): string {
  const upper = nome.toUpperCase();
  // Linhas conhecidas dos mocks
  const linhas = ["OBSESSED", "GOLDEN", "HEAVEN", "LIBERTE", "CHERRY BLOSSOM", "PINK DREAM", "SWEET VANILLA", "BLACK ORCHID", "OCEAN BREEZE", "COCONUT", "FRESH MINT", "LAVANDA", "KARITÉ", "RECONSTRUÇÃO", "HIDRATAÇÃO", "PROTEÇÃO", "VITAMINA C", "ARGILA"];
  for (const l of linhas) {
    if (upper.includes(l)) return l;
  }
  // Fallback: primeiras 2 palavras
  const partes = nome.split(" ");
  return partes.slice(0, Math.min(2, partes.length)).join(" ");
}

export function montarProdutosView(escopo: Escopo, categoriaFiltro: number | null = null): ProdutosView {
  const periodo = resolverPeriodo(escopo.periodo);
  const fs = filiaisDoEscopo(escopo);
  const divisao = escopo.divisao;

  // Agregados por categoria no período
  const catMap = new Map<number, { faturamento: number; cmv: number; itens: number }>();
  for (const f of fs) {
    for (const d of diasVendas(f.id, periodo.inicio, periodo.fim)) {
      for (const [id, c] of Object.entries(d.porCategoria)) {
        const cat = categorias.find((x) => x.id === Number(id));
        if (!cat || (divisao && cat.divisao !== divisao)) continue;
        const acc = catMap.get(cat.id) ?? { faturamento: 0, cmv: 0, itens: 0 };
        acc.faturamento += c.faturamento;
        acc.cmv += c.cmv;
        acc.itens += c.itens;
        catMap.set(cat.id, acc);
      }
    }
  }

  const totalFat = [...catMap.values()].reduce((s, c) => s + c.faturamento, 0);
  const totalCmv = [...catMap.values()].reduce((s, c) => s + c.cmv, 0);
  const totalItens = [...catMap.values()].reduce((s, c) => s + c.itens, 0);
  const totalLucro = totalFat - totalCmv;
  const totalMargem = divSeguro(totalLucro, totalFat) * 100;

  // Período anterior para deltas
  const ant = periodoAnterior(periodo);
  const antCatMap = new Map<number, { faturamento: number; cmv: number; itens: number }>();
  for (const f of fs) {
    for (const d of diasVendas(f.id, ant.inicio, ant.fim)) {
      for (const [id, c] of Object.entries(d.porCategoria)) {
        const cat = categorias.find((x) => x.id === Number(id));
        if (!cat || (divisao && cat.divisao !== divisao)) continue;
        const acc = antCatMap.get(cat.id) ?? { faturamento: 0, cmv: 0, itens: 0 };
        acc.faturamento += c.faturamento;
        acc.cmv += c.cmv;
        acc.itens += c.itens;
        antCatMap.set(cat.id, acc);
      }
    }
  }
  const antTotalFat = [...antCatMap.values()].reduce((s, c) => s + c.faturamento, 0);
  const antTotalCmv = [...antCatMap.values()].reduce((s, c) => s + c.cmv, 0);
  const antTotalItens = [...antCatMap.values()].reduce((s, c) => s + c.itens, 0);
  const antTotalLucro = antTotalFat - antTotalCmv;
  const antTotalMargem = divSeguro(antTotalLucro, antTotalFat) * 100;
  const temComp = antTotalFat > 0;
  const vsRotulo = temComp ? ant.rotulo : undefined;

  // Séries de tendência (7 pontos)
  const serieFat = seriesTendencia(fs, periodo, divisao).faturamento?.slice(-7) ?? [];

  const kpis: ProdutosKpi[] = [
    {
      label: "Faturamento",
      valor: brlK(totalFat),
      delta: temComp ? kpiDelta(totalFat, antTotalFat, vsRotulo) : undefined,
      serie: serieFat,
      tooltip: "Receita bruta total de produtos no período selecionado.",
    },
    {
      label: "Lucro bruto",
      valor: brlK(totalLucro),
      delta: temComp ? kpiDelta(totalLucro, antTotalLucro, vsRotulo) : undefined,
      tooltip: "Faturamento − CMV. O que sobra antes das despesas fixas.",
    },
    {
      label: "Margem",
      valor: pct(totalMargem),
      delta: temComp ? { value: `${Math.abs(totalMargem - antTotalMargem).toFixed(1)} p.p.`, positive: totalMargem >= antTotalMargem, vs: vsRotulo } : undefined,
      tooltip: "Percentual de lucro sobre o faturamento. Quanto maior, melhor.",
    },
    {
      label: "Itens vendidos",
      valor: num(totalItens),
      delta: temComp ? kpiDelta(totalItens, antTotalItens, vsRotulo) : undefined,
      tooltip: "Quantidade total de unidades vendidas no período.",
    },
  ];

  // Categorias ordenadas por faturamento
  const catsOrdenadas = [...catMap.entries()]
    .map(([id, c]) => {
      const cat = categorias.find((x) => x.id === id)!;
      const lucro = c.faturamento - c.cmv;
      return {
        categoriaId: id,
        nome: cat.nome,
        faturamento: c.faturamento,
        cmv: c.cmv,
        lucro,
        margemPct: divSeguro(lucro, c.faturamento) * 100,
        itens: c.itens,
      };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  // Top linhas de produto (agrega por linha derivada do nome)
  const linhaMap = new Map<string, number>();
  for (const cat of catsOrdenadas) {
    const prods = produtosDaCategoria(cat.categoriaId, `${periodo.inicio}|${divisao ?? ""}`, cat.faturamento, cat.lucro, cat.itens);
    for (const p of prods) {
      const linha = extrairLinha(p.nome);
      linhaMap.set(linha, (linhaMap.get(linha) ?? 0) + p.receita);
    }
  }
  const topLinhas: LinhaProduto[] = [...linhaMap.entries()]
    .map(([nome, faturamento]) => ({ nome, faturamento }))
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 8);

  // Produtos (filtrados por categoria se aplicável)
  const produtosBase: ProdutoLinha[] = [];
  for (const cat of catsOrdenadas) {
    if (categoriaFiltro !== null && cat.categoriaId !== categoriaFiltro) continue;
    const prods = produtosDaCategoria(cat.categoriaId, `${periodo.inicio}|${divisao ?? ""}`, cat.faturamento, cat.lucro, cat.itens);
    for (const p of prods) {
      const cmv = p.receita - p.margem;
      produtosBase.push({
        ...p,
        categoriaNome: cat.nome,
        cmv,
        cmvPct: divSeguro(cmv, p.receita) * 100,
        ticketMedio: divSeguro(p.receita, p.itens > 0 ? Math.round(p.receita / (totalFat / (totalItens || 1))) : 1),
        tmPorItem: divSeguro(p.receita, p.itens),
        tendencia: p.margemPct > 50 ? "up" : p.margemPct < 30 ? "down" : "flat",
      });
    }
  }
  produtosBase.sort((a, b) => b.receita - a.receita);

  return {
    escopo,
    periodo,
    kpis,
    categorias: catsOrdenadas,
    topLinhas,
    categoriaFiltro,
    produtos: produtosBase,
  };
}

/* ================================================================
 * TELA TURNOS — camada de dados (montarTurnosView)
 * ================================================================ */

import { turnos as turnosCadastrados, type Turno } from "./filiais";

export interface TurnoKpi {
  nome: string;
  faturamento: number;
  vendas: number;
  ticketMedio: number;
}

export interface DiaTurnoFat {
  dia: string;
  porTurno: Record<string, number>;
}

export interface HoraIndicador {
  hora: number;
  faturamento: number;
  atendimentos: number;
  ticketMedio: number;
  pctFatDia: number;
  fatAcumulado: number;
  pctFatAcumulado: number;
  deltaVsAnterior: { value: string; positive: boolean } | null;
}

export interface HeatmapCelula {
  dia: string;
  hora: number;
  valor: number;
}

export interface VendedoraPorHora {
  hora: number;
  reais: number;
  metaMinima: number;
}

export interface TurnosView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  turnoFiltro: string | null;
  turnosDisponiveis: { id: string; nome: string }[];
  kpisPorTurno: TurnoKpi[];
  faturamentoPorDiaTurno: DiaTurnoFat[];
  heatmap: HeatmapCelula[];
  indicadoresPorHora: HoraIndicador[] | null;
  vendedorasPorHora: VendedoraPorHora[];
}

/** Filtra horas que pertencem ao turno. Se turnoId=null, inclui todas. */
function horasDoTurno(turno: Turno | null): number[] {
  if (!turno) return Array.from({ length: 24 }, (_, i) => i);
  const horas: number[] = [];
  for (let h = turno.horaInicio; h < turno.horaFim; h++) horas.push(h);
  return horas;
}

export function montarTurnosView(escopo: Escopo, turnoFiltro: string | null = null): TurnosView {
  const periodo = resolverPeriodo(escopo.periodo);
  const fs = filiaisDoEscopo(escopo);
  const divisao = escopo.divisao;

  // Turnos disponíveis nas filiais do escopo
  const turnosEscopo = turnosCadastrados.filter((t) => fs.some((f) => f.id === t.filialId));
  const turnosUnicos = [...new Map(turnosEscopo.map((t) => [t.nome, t])).values()];
  const turnosDisponiveis = turnosUnicos.map((t) => ({ id: t.id, nome: t.nome }));

  const turnoAtivo = turnoFiltro ? turnosCadastrados.find((t) => t.id === turnoFiltro) ?? null : null;
  const horasAtivas = horasDoTurno(turnoAtivo);

  // KPIs por turno (agrega todas as filiais do escopo)
  const kpisPorTurno: TurnoKpi[] = turnosUnicos.map((turno) => {
    let faturamento = 0;
    let vendas = 0;
    for (const f of fs) {
      if (f.id !== turno.filialId && escopo.filialId !== "todas") continue;
      for (const iso of intervaloDias(periodo.inicio, periodo.fim)) {
        const dv = diaVendas(f.id, iso);
        if (!dv) continue;
        for (const h of horasDoTurno(turno)) {
          const ag = dv.porHora[h];
          if (!ag) continue;
          if (divisao) {
            const divAg = dv.porDivisao[divisao];
            const fr = divAg && dv.total.faturamento > 0 ? divAg.faturamento / dv.total.faturamento : 1;
            faturamento += Math.round(ag.faturamento * fr);
            vendas += Math.round(ag.atendimentos * fr);
          } else {
            faturamento += ag.faturamento;
            vendas += ag.atendimentos;
          }
        }
      }
    }
    return {
      nome: turno.nome,
      faturamento,
      vendas,
      ticketMedio: divSeguro(faturamento, vendas),
    };
  });

  // Faturamento por dia × turno
  const dias = intervaloDias(periodo.inicio, periodo.fim);
  const faturamentoPorDiaTurno: DiaTurnoFat[] = dias.map((iso) => {
    const porTurno: Record<string, number> = {};
    for (const turno of turnosUnicos) {
      let fat = 0;
      for (const f of fs) {
        if (f.id !== turno.filialId && escopo.filialId !== "todas") continue;
        const dv = diaVendas(f.id, iso);
        if (!dv) continue;
        for (const h of horasDoTurno(turno)) {
          const ag = dv.porHora[h];
          if (!ag) continue;
          if (divisao) {
            const divAg = dv.porDivisao[divisao];
            const fr = divAg && dv.total.faturamento > 0 ? divAg.faturamento / dv.total.faturamento : 1;
            fat += Math.round(ag.faturamento * fr);
          } else {
            fat += ag.faturamento;
          }
        }
      }
      porTurno[turno.nome] = fat;
    }
    return { dia: iso, porTurno };
  });

  // Heatmap (dia × hora) — valores de faturamento
  const heatmap: HeatmapCelula[] = [];
  for (const iso of dias) {
    for (const h of horasAtivas) {
      let valor = 0;
      for (const f of fs) {
        const dv = diaVendas(f.id, iso);
        if (!dv) continue;
        const ag = dv.porHora[h];
        if (!ag) continue;
        if (divisao) {
          const divAg = dv.porDivisao[divisao];
          const fr = divAg && dv.total.faturamento > 0 ? divAg.faturamento / dv.total.faturamento : 1;
          valor += Math.round(ag.faturamento * fr);
        } else {
          valor += ag.faturamento;
        }
      }
      heatmap.push({ dia: iso, hora: h, valor });
    }
  }

  // Indicadores por hora (só quando período = 1 dia)
  const ehUmDia = periodo.inicio === periodo.fim;
  let indicadoresPorHora: HoraIndicador[] | null = null;
  if (ehUmDia) {
    const diaIso = periodo.inicio;
    const ant = periodoAnterior(periodo);
    let fatTotalDia = 0;
    for (const f of fs) {
      const dv = diaVendas(f.id, diaIso);
      if (!dv) continue;
      for (const h of horasAtivas) {
        const ag = dv.porHora[h];
        if (!ag) continue;
        if (divisao) {
          const divAg = dv.porDivisao[divisao];
          const fr = divAg && dv.total.faturamento > 0 ? divAg.faturamento / dv.total.faturamento : 1;
          fatTotalDia += Math.round(ag.faturamento * fr);
        } else {
          fatTotalDia += ag.faturamento;
        }
      }
    }
    let acumulado = 0;
    indicadoresPorHora = horasAtivas.map((h) => {
      let fat = 0;
      let atd = 0;
      for (const f of fs) {
        const dv = diaVendas(f.id, diaIso);
        if (!dv) continue;
        const ag = dv.porHora[h];
        if (!ag) continue;
        if (divisao) {
          const divAg = dv.porDivisao[divisao];
          const fr = divAg && dv.total.faturamento > 0 ? divAg.faturamento / dv.total.faturamento : 1;
          fat += Math.round(ag.faturamento * fr);
          atd += Math.round(ag.atendimentos * fr);
        } else {
          fat += ag.faturamento;
          atd += ag.atendimentos;
        }
      }
      acumulado += fat;
      // Comparativo com mesmo horário do dia anterior
      let fatAnt = 0;
      for (const f of fs) {
        const dvAnt = diaVendas(f.id, ant.inicio);
        if (!dvAnt) continue;
        const agAnt = dvAnt.porHora[h];
        if (!agAnt) continue;
        if (divisao) {
          const divAg = dvAnt.porDivisao[divisao];
          const fr = divAg && dvAnt.total.faturamento > 0 ? divAg.faturamento / dvAnt.total.faturamento : 1;
          fatAnt += Math.round(agAnt.faturamento * fr);
        } else {
          fatAnt += agAnt.faturamento;
        }
      }
      const delta = fatAnt > 0 ? ((fat - fatAnt) / fatAnt) * 100 : null;
      return {
        hora: h,
        faturamento: fat,
        atendimentos: atd,
        ticketMedio: divSeguro(fat, atd),
        pctFatDia: divSeguro(fat, fatTotalDia) * 100,
        fatAcumulado: acumulado,
        pctFatAcumulado: divSeguro(acumulado, fatTotalDia) * 100,
        deltaVsAnterior: delta !== null ? { value: `${Math.abs(delta).toFixed(0)}%`, positive: delta >= 0 } : null,
      };
    });
  }

  // Vendedoras por hora (staff real vs meta mínima)
  const vendedorasPorHora: VendedoraPorHora[] = horasAtivas.map((h) => {
    let reais = 0;
    for (const f of fs) {
      const dv = diaVendas(f.id, HOJE_ISO);
      if (!dv) continue;
      const ag = dv.porHora[h];
      if (ag && ag.atendimentos > 0) {
        // Estimativa: vendedoras ativas ≈ atendimentos / ticket médio esperado
        const vendedoresCount = Object.keys(dv.porVendedora).length || 1;
        reais += vendedoresCount;
      }
    }
    // Meta mínima: 2 vendedoras por hora como baseline
    const metaMinima = 2;
    return { hora: h, reais, metaMinima };
  });

  return {
    escopo,
    periodo,
    turnoFiltro,
    turnosDisponiveis,
    kpisPorTurno,
    faturamentoPorDiaTurno,
    heatmap,
    indicadoresPorHora,
    vendedorasPorHora,
  };
}

/* ================================================================
 * TELA VISÃO GERAL — camada de dados (montarVisaoGeralView)
 * ================================================================ */

import { metaDaFilial } from "./metas";
import { produtosDaCategoria } from "./produtos";
import { colaboradoresDaFilial } from "./equipe";

export interface VisaoKpi {
  label: string;
  valor: string;
  sub?: string;
  delta?: { value: string; positive: boolean; vs?: string };
  serie?: number[];
  tooltip?: string;
  drillTo?: string;
}

export interface GaugeMeta {
  nome: string;
  pct: number;
  alvo: number;
  realizado: number;
}

export interface CategoriaVsMeta {
  categoria: string;
  meta: number;
  realizado: number;
}

export interface DiaVsMeta {
  dia: string;
  meta: number;
  realizado: number;
}

export interface EvolucaoPonto {
  label: string;
  realizado: number;
  meta: number;
  projecao: number | null;
}

export interface TopItem {
  nome: string;
  valor: number;
}

export interface VisaoGeralView {
  escopo: Escopo;
  periodo: PeriodoResolvido;
  kpis: VisaoKpi[];
  gauges: GaugeMeta[];
  faltamParaMeta: string | null;
  projecaoFechamento: string | null;
  categoriaVsMeta: CategoriaVsMeta[];
  diaVsMeta: DiaVsMeta[];
  evolucao: EvolucaoPonto[];
  formasPagamento: FormaPagamentoFat[];
  topVendedoras: TopItem[];
  topProdutos: TopItem[];
}

export function montarVisaoGeralView(escopo: Escopo): VisaoGeralView {
  const periodo = resolverPeriodo(escopo.periodo);
  const fs = filiaisDoEscopo(escopo);
  const divisao = escopo.divisao;

  // Agregados do período
  const atual = somarAgregados(fs.map((f) => agregadoPeriodo(f, periodo.inicio, periodo.fim, divisao)));
  const custoAtual = custoPeriodo(fs, periodo.inicio, periodo.fim, divisao).cmv;
  const lucroAtual = atual.faturamento - custoAtual;
  const margemAtual = divSeguro(lucroAtual, atual.faturamento) * 100;
  const ticketAtual = divSeguro(atual.faturamento, atual.atendimentos);

  // Período anterior para deltas
  const ant = periodoAnterior(periodo);
  const anterior = somarAgregados(fs.map((f) => agregadoPeriodo(f, ant.inicio, ant.fim, divisao, ant.horaMax)));
  const custoAnterior = custoPeriodo(fs, ant.inicio, ant.fim, divisao).cmv;
  const lucroAnterior = anterior.faturamento - custoAnterior;
  const ticketAnterior = divSeguro(anterior.faturamento, anterior.atendimentos);
  const temComp = anterior.atendimentos > 0;
  const vsRotulo = temComp ? ant.rotulo : undefined;

  // Meta da competência (mês corrente)
  const competencia = periodo.inicio.slice(0, 7);
  let metaTotal = 0;
  for (const f of fs) {
    const m = metaDaFilial(f.id, competencia);
    if (m) metaTotal += m.valorLoja;
  }
  const atingMeta = metaTotal > 0 ? (atual.faturamento / metaTotal) * 100 : 0;
  const faltam = metaTotal > 0 ? Math.max(0, metaTotal - atual.faturamento) : 0;

  // Projeção de fechamento (curva de receita)
  const curva = curvaReceita(fs, competencia);
  let fracaoAcum = 0;
  for (const iso of intervaloDias(`${competencia}-01`, HOJE_ISO)) fracaoAcum += curva.peso(iso);
  const projetado = fracaoAcum > 0 ? atual.faturamento / fracaoAcum : 0;
  const projPct = metaTotal > 0 ? (projetado / metaTotal) * 100 : 0;

  // Série de tendência (7 pontos)
  const serieFat = seriesTendencia(fs, periodo, divisao).faturamento?.slice(-7) ?? [];

  // KPIs com drill-down
  const kpis: VisaoKpi[] = [
    {
      label: "Faturamento",
      valor: brlK(atual.faturamento),
      sub: `${num(atual.atendimentos)} vendas · ${num(atual.itens)} itens`,
      delta: metaTotal > 0
        ? { value: `${Math.abs(atingMeta - 100).toFixed(1)}% ${atingMeta >= 100 ? "acima" : "abaixo"} da meta`, positive: atingMeta >= 100 }
        : temComp ? kpiDelta(atual.faturamento, anterior.faturamento, vsRotulo) : undefined,
      serie: serieFat,
      tooltip: "Receita bruta total. Drill → Financeiro.",
      drillTo: "/dashboard/financeiro",
    },
    {
      label: "CMV (custo)",
      valor: brlK(custoAtual),
      sub: `CMV% ${(divSeguro(custoAtual, atual.faturamento) * 100).toFixed(0)}%`,
      delta: temComp ? kpiDelta(custoAtual, custoAnterior, vsRotulo) : undefined,
      tooltip: "Custo dos produtos vendidos. Drill → Financeiro.",
      drillTo: "/dashboard/financeiro",
    },
    {
      label: "Lucro bruto",
      valor: brlK(lucroAtual),
      sub: `${margemAtual.toFixed(0)}% de margem`,
      delta: temComp ? kpiDelta(lucroAtual, lucroAnterior, vsRotulo) : undefined,
      tooltip: "Faturamento − CMV. Drill → Equipe.",
      drillTo: "/equipe",
    },
    {
      label: "Ticket Médio",
      valor: brl(ticketAtual),
      sub: `PA ${divSeguro(atual.itens, atual.atendimentos).toFixed(2)}`,
      delta: temComp ? kpiDelta(ticketAtual, ticketAnterior, vsRotulo) : undefined,
      tooltip: "Valor médio por atendimento. Drill → Produtos.",
      drillTo: "/dashboard/produtos",
    },
  ];

  // Gauges: Meta / Super Meta / Hiper Meta (degraus da primeira filial com meta)
  const filialComMeta = fs.find((f) => Boolean(metaDaFilial(f.id, competencia)));
  const degraus = filialComMeta ? metaDaFilial(filialComMeta.id, competencia)?.degraus ?? [] : [];
  const gauges: GaugeMeta[] = degraus.slice(0, 3).map((d) => ({
    nome: d.nome,
    pct: Math.min(100, (atual.faturamento / (metaTotal * d.atingimentoMinPct / 100)) * 100),
    alvo: Math.round(metaTotal * d.atingimentoMinPct / 100),
    realizado: atual.faturamento,
  }));
  // Fallback se não houver degraus mas houver meta
  if (gauges.length === 0 && metaTotal > 0) {
    gauges.push({ nome: "Meta", pct: Math.min(100, atingMeta), alvo: metaTotal, realizado: atual.faturamento });
  }

  const faltamParaMeta = faltam > 0 ? `Faltam ${brl(faltam)} pra bater a Meta do mês` : metaTotal > 0 ? "Meta atingida! 🎉" : null;
  const projecaoFechamento = projetado > 0 ? `Projeção: ~${brlK(projetado)} (${projPct.toFixed(0)}% da meta)` : null;

  // Faturamento por Categoria vs Meta
  const catMap = new Map<number, { faturamento: number }>();
  for (const f of fs) {
    for (const d of diasVendas(f.id, periodo.inicio, periodo.fim)) {
      for (const [id, c] of Object.entries(d.porCategoria)) {
        const cat = categorias.find((x) => x.id === Number(id));
        if (!cat || (divisao && cat.divisao !== divisao)) continue;
        const acc = catMap.get(cat.id) ?? { faturamento: 0 };
        acc.faturamento += c.faturamento;
        catMap.set(cat.id, acc);
      }
    }
  }
  const categoriaVsMeta: CategoriaVsMeta[] = [...catMap.entries()]
    .map(([id, c]) => {
      const cat = categorias.find((x) => x.id === id)!;
      // Meta proporcional por categoria (distribuição uniforme como fallback)
      const metaCat = metaTotal > 0 ? metaTotal / catMap.size : 0;
      return { categoria: cat.nome, meta: metaCat, realizado: c.faturamento };
    })
    .sort((a, b) => b.realizado - a.realizado);

  // Faturamento por Dia da Semana vs Meta
  const diasSemanaNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diaAgg: Record<number, { fat: number; count: number }> = {};
  for (const iso of intervaloDias(periodo.inicio, periodo.fim)) {
    const dow = deIso(iso).getDay();
    if (!diaAgg[dow]) diaAgg[dow] = { fat: 0, count: 0 };
    for (const f of fs) {
      const dv = diaVendas(f.id, iso);
      if (!dv) continue;
      if (divisao) {
        const divAg = dv.porDivisao[divisao];
        diaAgg[dow].fat += divAg?.faturamento ?? 0;
      } else {
        diaAgg[dow].fat += dv.total.faturamento;
      }
    }
    diaAgg[dow].count += 1;
  }
  const metaDiaria = metaTotal > 0 ? metaTotal / 7 : 0;
  const diaVsMeta: DiaVsMeta[] = diasSemanaNomes.map((nome, i) => ({
    dia: nome,
    meta: metaDiaria,
    realizado: diaAgg[i] ? diaAgg[i].fat / (diaAgg[i].count || 1) : 0,
  }));

  // Evolução diária (realizado acumulado + meta acumulada + projeção)
  const diasPeriodo = intervaloDias(periodo.inicio, periodo.fim);
  let acumRealizado = 0;
  let acumMeta = 0;
  const metaPorDia = metaTotal > 0 ? metaTotal / diasPeriodo.length : 0;
  const evolucao: EvolucaoPonto[] = diasPeriodo.map((iso) => {
    let fatDia = 0;
    for (const f of fs) {
      const dv = diaVendas(f.id, iso);
      if (!dv) continue;
      if (divisao) {
        fatDia += dv.porDivisao[divisao]?.faturamento ?? 0;
      } else {
        fatDia += dv.total.faturamento;
      }
    }
    acumRealizado += fatDia;
    acumMeta += metaPorDia;
    const proj = iso <= HOJE_ISO && fracaoAcum > 0 ? acumRealizado / fracaoAcum * (fracaoAcum + (diasPeriodo.length - diasPeriodo.indexOf(iso) - 1) * (fracaoAcum / (diasPeriodo.indexOf(HOJE_ISO) + 1 || 1))) : null;
    return {
      label: iso.slice(5), // MM-DD
      realizado: acumRealizado,
      meta: acumMeta,
      projecao: proj,
    };
  });

  // Formas de pagamento (reusa lógica do Financeiro)
  const totaisForma: Record<string, number> = {};
  for (const f of fs) {
    for (const iso of diasPeriodo) {
      const dv = diaVendas(f.id, iso);
      if (!dv) continue;
      for (const [meio, val] of Object.entries(dv.porMeio)) {
        totaisForma[meio] = (totaisForma[meio] ?? 0) + val;
      }
    }
  }
  const totalFormas = Object.values(totaisForma).reduce((s, v) => s + v, 0) || 1;
  const CORES_FORMAS: Record<string, string> = {
    Pix: "var(--ok)",
    "Cartão de crédito": "var(--acc)",
    "Cartão de débito": "var(--info)",
    Dinheiro: "var(--warn)",
  };
  const formasPagamento: FormaPagamentoFat[] = Object.entries(totaisForma)
    .sort((a, b) => b[1] - a[1])
    .map(([forma, valor]) => ({
      forma,
      valor,
      pct: (valor / totalFormas) * 100,
      cor: CORES_FORMAS[forma] ?? "var(--t2)",
    }));

  // Top 3 Vendedoras
  const vendMap = new Map<string, { nome: string; fat: number }>();
  for (const f of fs) {
    const cols = colaboradoresDaFilial(f.id);
    for (const iso of diasPeriodo) {
      const dv = diaVendas(f.id, iso);
      if (!dv) continue;
      for (const [colId, ag] of Object.entries(dv.porVendedora)) {
        const col = cols.find((c) => c.id === colId);
        if (!col) continue;
        const acc = vendMap.get(colId) ?? { nome: col.nome, fat: 0 };
        acc.fat += ag.faturamento;
        vendMap.set(colId, acc);
      }
    }
  }
  const topVendedoras: TopItem[] = [...vendMap.values()]
    .sort((a, b) => b.fat - a.fat)
    .slice(0, 3)
    .map((v) => ({ nome: v.nome, valor: v.fat }));

  // Top 3 Produtos
  const prodMap = new Map<string, { nome: string; fat: number }>();
  for (const cat of [...catMap.entries()].map(([id, c]) => ({ id, ...c }))) {
    const prods = produtosDaCategoria(cat.id, `${periodo.inicio}|${divisao ?? ""}`, cat.faturamento, 0, 0);
    for (const p of prods) {
      const acc = prodMap.get(p.codProduto) ?? { nome: p.nome, fat: 0 };
      acc.fat += p.receita;
      prodMap.set(p.codProduto, acc);
    }
  }
  const topProdutos: TopItem[] = [...prodMap.values()]
    .sort((a, b) => b.fat - a.fat)
    .slice(0, 3)
    .map((p) => ({ nome: p.nome, valor: p.fat }));

  return {
    escopo,
    periodo,
    kpis,
    gauges,
    faltamParaMeta,
    projecaoFechamento,
    categoriaVsMeta,
    diaVsMeta,
    evolucao,
    formasPagamento,
    topVendedoras,
    topProdutos,
  };
}
