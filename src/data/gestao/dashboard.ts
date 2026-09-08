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
  filialId: string | "todas";
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
  return escopo.filialId === "todas" ? filiais : [filialPorId(escopo.filialId)];
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
  const todas = escopo.filialId === "todas";
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
