/**
 * Gerador determinístico de vendas mockadas, dia a dia e hora a hora, por
 * filial. Faz o papel do sync do ERP: as telas nunca leem daqui diretamente,
 * só através da camada de visões (loja.ts), que devolve números prontos.
 */
import { categorias, filiais, meiosPagamento, type Divisao, type Filial, type MeioPagamento } from "./filiais";
import { colaboradoresDaFilial } from "./equipe";
import { HOJE_ISO, HORA_ATUAL } from "./relogio";
import { deIso, intervaloDias } from "@/lib/formato";

export interface Agregado {
  faturamento: number;
  atendimentos: number;
  itens: number;
}

export interface DiaVendas {
  data: string;
  filialId: string;
  total: Agregado;
  porHora: Record<number, Agregado>;
  porVendedora: Record<string, Agregado>;
  porCategoria: Record<number, { faturamento: number; itens: number; cmv: number }>;
  porMeio: Record<MeioPagamento, number>;
  porDivisao: Record<Divisao, Agregado>;
}

interface ParametrosFilial {
  baseDia: number;
  ticket: number;
  pa: number;
  /** Peso por dia da semana, índice 0 = domingo. */
  pesosSemana: number[];
  /** Peso por hora de funcionamento, índice 0 = hora de abertura. */
  pesosHora: number[];
  /** Fator por mês (chave "AAAA-MM"). */
  tendencia: Record<string, number>;
  /** Participação de cada categoria no faturamento. */
  categorias: Record<number, number>;
  meios: Record<MeioPagamento, number>;
}

const PARAMETROS: Record<string, ParametrosFilial> = {
  f1: {
    baseDia: 6100,
    ticket: 186,
    pa: 2.35,
    pesosSemana: [0.95, 0.72, 0.8, 0.86, 0.92, 1.18, 1.5],
    pesosHora: [0.03, 0.05, 0.09, 0.11, 0.08, 0.07, 0.07, 0.08, 0.1, 0.12, 0.11, 0.09],
    tendencia: { "2026-06": 0.93, "2026-07": 0.96, "2026-08": 1.0, "2026-09": 0.985 },
    categorias: { 1: 0.38, 2: 0.22, 3: 0.13, 4: 0.08, 5: 0.07, 6: 0.05, 7: 0.07 },
    meios: { Pix: 0.34, "Cartão de crédito": 0.41, "Cartão de débito": 0.19, Dinheiro: 0.06 },
  },
  f2: {
    baseDia: 3450,
    ticket: 158,
    pa: 2.2,
    pesosSemana: [0, 0.85, 0.9, 0.95, 1.0, 1.2, 1.35],
    pesosHora: [0.05, 0.09, 0.11, 0.12, 0.1, 0.07, 0.08, 0.11, 0.13, 0.14],
    tendencia: { "2026-06": 0.95, "2026-07": 0.98, "2026-08": 1.0, "2026-09": 0.9 },
    categorias: { 1: 0.33, 2: 0.2, 3: 0.11, 4: 0.07, 5: 0.05, 6: 0.03, 7: 0.05, 8: 0.16 },
    meios: { Pix: 0.4, "Cartão de crédito": 0.35, "Cartão de débito": 0.17, Dinheiro: 0.08 },
  },
};

/** Índice de preço relativo por categoria, para derivar itens do faturamento. */
const INDICE_PRECO: Record<number, number> = { 1: 1.6, 2: 0.7, 3: 0.8, 4: 0.9, 5: 1.1, 6: 0.75, 7: 1.9, 8: 1.2 };

/** PRNG determinístico (mulberry32). */
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

/** Ruído multiplicativo em torno de 1, amplitude ±amp. */
function ruido(r: () => number, amp: number): number {
  return 1 + (r() * 2 - 1) * amp;
}

export function pesoDia(filial: Filial, iso: string): number {
  return PARAMETROS[filial.id].pesosSemana[deIso(iso).getDay()];
}

export function lojaAberta(filial: Filial, iso: string): boolean {
  return !filial.diasFechados.includes(deIso(iso).getDay());
}

function gerarDia(filial: Filial, iso: string): DiaVendas {
  const p = PARAMETROS[filial.id];
  const r = prng(hash(`${filial.id}|${iso}`));
  const vazio: DiaVendas = {
    data: iso,
    filialId: filial.id,
    total: { faturamento: 0, atendimentos: 0, itens: 0 },
    porHora: {},
    porVendedora: {},
    porCategoria: {},
    porMeio: { Pix: 0, "Cartão de crédito": 0, "Cartão de débito": 0, Dinheiro: 0 },
    porDivisao: { WEPINK: { faturamento: 0, atendimentos: 0, itens: 0 }, WPINK: { faturamento: 0, atendimentos: 0, itens: 0 } },
  };
  if (!lojaAberta(filial, iso)) return vazio;

  const mes = iso.slice(0, 7);
  const tendencia = p.tendencia[mes] ?? 1;
  const totalDiaCheio = p.baseDia * pesoDia(filial, iso) * tendencia * ruido(r, 0.14);
  const ticketDia = p.ticket * ruido(r, 0.06);
  const paDia = p.pa * ruido(r, 0.05);

  // Distribui por hora e trunca o dia de hoje na hora atual.
  const horas = intervaloHoras(filial);
  const somaPesos = p.pesosHora.reduce((s, x) => s + x, 0);
  const porHora: Record<number, Agregado> = {};
  let faturamento = 0;
  let atendimentos = 0;
  let itens = 0;
  horas.forEach((h, i) => {
    if (iso === HOJE_ISO && h > HORA_ATUAL) return;
    let fracao = (p.pesosHora[i] / somaPesos) * ruido(r, 0.25);
    if (iso === HOJE_ISO && h === HORA_ATUAL) fracao *= 0.55;
    const fat = Math.round(totalDiaCheio * fracao);
    const atend = Math.max(fat > 0 ? 1 : 0, Math.round(fat / (ticketDia * ruido(r, 0.1))));
    const it = Math.max(atend, Math.round(atend * paDia * ruido(r, 0.08)));
    porHora[h] = { faturamento: fat, atendimentos: atend, itens: it };
    faturamento += fat;
    atendimentos += atend;
    itens += it;
  });
  const total: Agregado = { faturamento, atendimentos, itens };

  // Categorias: faturamento por participação, itens pelo índice de preço, CMV pela categoria.
  const porCategoria: Record<number, { faturamento: number; itens: number; cmv: number }> = {};
  const entradas = Object.entries(p.categorias).map(([id, share]) => ({ id: Number(id), share: share * ruido(r, 0.12) }));
  const somaShare = entradas.reduce((s, e) => s + e.share, 0);
  const pesosItens = entradas.map((e) => e.share / INDICE_PRECO[e.id]);
  const somaPesosItens = pesosItens.reduce((s, x) => s + x, 0);
  entradas.forEach((e, i) => {
    const cat = categorias.find((c) => c.id === e.id)!;
    const fat = Math.round((faturamento * e.share) / somaShare);
    porCategoria[e.id] = {
      faturamento: fat,
      itens: Math.round((itens * pesosItens[i]) / somaPesosItens),
      cmv: Math.round(fat * cat.cmvPct * ruido(r, 0.03)),
    };
  });

  // Divisão: WPINK = categorias da divisão WPINK; o resto é WEPINK.
  const porDivisao: Record<Divisao, Agregado> = {
    WEPINK: { faturamento: 0, atendimentos: 0, itens: 0 },
    WPINK: { faturamento: 0, atendimentos: 0, itens: 0 },
  };
  for (const cat of categorias) {
    const c = porCategoria[cat.id];
    if (!c) continue;
    porDivisao[cat.divisao].faturamento += c.faturamento;
    porDivisao[cat.divisao].itens += c.itens;
  }
  for (const d of ["WEPINK", "WPINK"] as Divisao[]) {
    const fr = faturamento > 0 ? porDivisao[d].faturamento / faturamento : 0;
    porDivisao[d].atendimentos = Math.round(atendimentos * fr);
  }

  // Meios de pagamento.
  const porMeio = { ...vazio.porMeio };
  const meiosRuido = meiosPagamento.map((m) => p.meios[m] * ruido(r, 0.15));
  const somaMeios = meiosRuido.reduce((s, x) => s + x, 0);
  meiosPagamento.forEach((m, i) => {
    porMeio[m] = Math.round((faturamento * meiosRuido[i]) / somaMeios);
  });

  // Vendedoras: peso relativo, respeitando admissão e inatividade.
  const porVendedora: Record<string, Agregado> = {};
  const equipe = colaboradoresDaFilial(filial.id).filter((c) => {
    if (c.dataAdmissao > iso) return false;
    if (c.dataInatividade && c.dataInatividade <= iso) return false;
    return true;
  });
  const pesos = equipe.map((c) => c.pesoVenda * ruido(r, 0.2));
  const somaPesosV = pesos.reduce((s, x) => s + x, 0);
  equipe.forEach((c, i) => {
    const fr = pesos[i] / somaPesosV;
    porVendedora[c.id] = {
      faturamento: Math.round(faturamento * fr),
      atendimentos: Math.round(atendimentos * fr),
      itens: Math.round(itens * fr),
    };
  });

  return { data: iso, filialId: filial.id, total, porHora, porVendedora, porCategoria, porMeio, porDivisao };
}

export function intervaloHoras(filial: Filial): number[] {
  const out: number[] = [];
  for (let h = filial.abertura; h < filial.fechamento; h++) out.push(h);
  return out;
}

const INICIO_HISTORICO = "2026-06-01";

/** Índice puro de vendas por filial+data, parametrizável para testes isolados. */
export class DiaVendasStore {
  private readonly indice: Map<string, DiaVendas>;
  readonly inicio: string;
  readonly fim: string;

  /** Popula do histórico deterministicamente gerado. */
  constructor(inicio: string = INICIO_HISTORICO, fim: string = HOJE_ISO) {
    this.inicio = inicio;
    this.fim = fim;
    this.indice = new Map<string, DiaVendas>();
    for (const f of filiais) {
      for (const iso of intervaloDias(inicio, fim)) {
        this.indice.set(`${f.id}|${iso}`, gerarDia(f, iso));
      }
    }
  }

  dia(filialId: string, iso: string): DiaVendas | undefined {
    return this.indice.get(`${filialId}|${iso}`);
  }

  dias(filialId: string, inicio: string, fim: string): DiaVendas[] {
    return intervaloDias(inicio, fim)
      .map((iso) => this.indice.get(`${filialId}|${iso}`))
      .filter((d): d is DiaVendas => Boolean(d));
  }
}

/** Instância padrão usada pela aplicação. */
export const store = new DiaVendasStore();

export function diaVendas(filialId: string, iso: string): DiaVendas | undefined {
  return store.dia(filialId, iso);
}

export function diasVendas(filialId: string, inicio: string, fim: string): DiaVendas[] {
  return store.dias(filialId, inicio, fim);
}

/** Agregado de um dia, opcionalmente recortado por divisão e por faixa de horas. */
export function agregadoDoDia(dia: DiaVendas, divisao: Divisao | null, horaMax?: number): Agregado {
  if (horaMax !== undefined) {
    const out: Agregado = { faturamento: 0, atendimentos: 0, itens: 0 };
    for (const [h, a] of Object.entries(dia.porHora)) {
      if (Number(h) > horaMax) continue;
      out.faturamento += a.faturamento;
      out.atendimentos += a.atendimentos;
      out.itens += a.itens;
    }
    if (divisao) {
      const r = dia.total.faturamento > 0 ? dia.porDivisao[divisao].faturamento / dia.total.faturamento : 0;
      return { faturamento: Math.round(out.faturamento * r), atendimentos: Math.round(out.atendimentos * r), itens: Math.round(out.itens * r) };
    }
    return out;
  }
  if (divisao) return { ...dia.porDivisao[divisao] };
  return { ...dia.total };
}

export function somarAgregados(lista: Agregado[]): Agregado {
  return lista.reduce(
    (acc, a) => ({ faturamento: acc.faturamento + a.faturamento, atendimentos: acc.atendimentos + a.atendimentos, itens: acc.itens + a.itens }),
    { faturamento: 0, atendimentos: 0, itens: 0 },
  );
}
