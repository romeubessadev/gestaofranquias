/**
 * Camada de visão — Ao vivo (competência do mês + pulso do dia).
 */
import { brl, brlK, fimDoMes, intervaloDias, num, pct, rotuloDias } from "@/lib/format";
import { type Scope } from "./dashboard";
import { collaborators, eligibleSeller, type Collaborator } from "./team";
import { challengesInScope, challengeIsIndex, individualProgress, type Challenge } from "./challenges";
import { stores, grupos, type Store } from "./stores";
import { goalOfStore, defaultTiers } from "./goals";
import { TODAY_ISO, CURRENT_HOUR } from "./clock";
import { salesDay, type Aggregate, dayAggregate, sumAggregates } from "./sales";

function storesInScope(escopo: Scope): Store[] {
  return escopo.filialIds.length === 0 ? stores : stores.filter((f) => escopo.filialIds.includes(f.id));
}

export interface LiveKpi {
  label: string;
  valor: string;
  sub?: string;
}

export interface LiveKpiToday {
  label: string;
  valor: string;
  sub?: string;
  tint: "acc" | "ok" | "warn" | "info";
}

export interface RankingRow {
  posicao: number;
  colaboradorId: string;
  nome: string;
  vendas: number;
  faturamento: number;
}

export interface StoreRankingRow {
  id: string;
  nome: string;
  valor: number;
  pctMeta?: number;
}

export interface ChallengeTop {
  colaboradorId: string;
  nome: string;
  valor: number;
  pct: number;
}

export interface LiveChallenge {
  id: string;
  nome: string;
  objetivo: string;
  prazoRotulo: string;
  premio: number;
  acumuladoRotulo: string;
  progressoPct: number;
  top3: ChallengeTop[];
}

export interface GoalLevel {
  nome: string;
  atingimentoMinPct: number;
}

export interface PersonGoalRow {
  posicao: number;
  id: string;
  nome: string;
  faturamento: number;
  pct: number;
  nivelNome: string | null;
}

export interface GroupGoalRow {
  id: string;
  nome: string;
  faturamento: number;
  meta: number;
  pct: number;
  vendedores: number;
  top3: { nome: string; faturamento: number; pct: number }[];
}

export interface LiveGoal {
  competencia: string;
  competenciaRotulo: string;
  realizado: number;
  alvo: number;
  pct: number;
  niveis: GoalLevel[];
  porVendedor: PersonGoalRow[];
  porGrupo: GroupGoalRow[];
}

export interface LiveView {
  competencia: string;
  kpis: LiveKpi[];
  /** Pulso do dia — strip compacto abaixo dos KPIs mensais. */
  kpisHoje: LiveKpiToday[];
  ranking: RankingRow[];
  rankingLojas: StoreRankingRow[];
  challenges: LiveChallenge[];
  /** Meta do escopo: somada na rede, ou da loja filtrada. */
  meta: LiveGoal | null;
}

function competenciaAtual(): string {
  return TODAY_ISO.slice(0, 7);
}

function agregadoFiliais(fs: { id: string }[], inicio: string, fim: string): Aggregate {
  return sumAggregates(
    fs.flatMap((f) =>
      intervaloDias(inicio, fim).map((iso) => {
        const dia = salesDay(f.id, iso);
        if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
        return dayAggregate(dia, null, iso === TODAY_ISO ? CURRENT_HOUR : undefined);
      }),
    ),
  );
}

function vendedoresNoEscopo(filialIds: string[]): Collaborator[] {
  return collaborators.filter(
    (c) =>
      (filialIds.length === 0 || filialIds.includes(c.filialId)) &&
      eligibleSeller(c) &&
      !c.excluirDeRanking,
  );
}

function fatVendedorNoPeriodo(c: Collaborator, inicio: string, fim: string): Aggregate {
  return sumAggregates(
    intervaloDias(inicio, fim).map((iso) => {
      const dia = salesDay(c.filialId, iso);
      if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
      const raw = dia.porVendedora[c.id];
      if (!raw) return { faturamento: 0, atendimentos: 0, itens: 0 };
      if (iso === TODAY_ISO) {
        // Aproxima truncamento horário pela fração do dia decorrido.
        const diaFull = dia.total.atendimentos || 1;
        const ateAgora = Object.entries(dia.porHora)
          .filter(([h]) => Number(h) <= CURRENT_HOUR)
          .reduce((s, [, a]) => s + a.atendimentos, 0);
        const fr = Math.min(1, ateAgora / diaFull);
        return {
          faturamento: Math.round(raw.faturamento * fr),
          atendimentos: Math.round(raw.atendimentos * fr),
          itens: Math.round(raw.itens * fr),
        };
      }
      return raw;
    }),
  );
}

function desafioAtivoAgora(d: Challenge): boolean {
  return TODAY_ISO >= d.inicio && TODAY_ISO <= d.fim;
}

function diasRestantesRotulo(d: Challenge): string {
  if (TODAY_ISO > d.fim) return "Encerrado";
  if (TODAY_ISO < d.inicio) {
    const n = intervaloDias(TODAY_ISO, d.inicio).length - 1;
    return n <= 0 ? "Hoje" : `Em ${rotuloDias(n)}`;
  }
  const n = intervaloDias(TODAY_ISO, d.fim).length;
  return rotuloDias(n);
}

function nivelPorPct(pctVal: number): string | null {
  let atual: string | null = null;
  for (const d of defaultTiers) {
    if (pctVal >= d.atingimentoMinPct) atual = d.nome;
  }
  return atual;
}

/** Re-export helper used by tests when Escopo type needs filiais list. */
export { storesInScope };

export function buildLiveView(escopo: Scope): LiveView {
  const competencia = competenciaAtual();
  const fs = storesInScope(escopo);
  const filialIds = fs.map((f) => f.id);
  const mesInicio = `${competencia}-01`;
  const mesFim = TODAY_ISO < fimDoMes(mesInicio) ? TODAY_ISO : fimDoMes(mesInicio);

  const mes = agregadoFiliais(fs, mesInicio, mesFim);
  const hoje = agregadoFiliais(fs, TODAY_ISO, TODAY_ISO);

  const metaAlvo =
    filialIds.length === 1
      ? goalOfStore(filialIds[0], competencia)?.valorLoja ?? 0
      : filialIds.reduce((s, id) => s + (goalOfStore(id, competencia)?.valorLoja ?? 0), 0);

  const atingimentoPct = metaAlvo > 0 ? (mes.faturamento / metaAlvo) * 100 : 0;
  const ticketHoje = hoje.atendimentos > 0 ? hoje.faturamento / hoje.atendimentos : 0;

  const kpis: LiveKpi[] = [
    {
      label: "Faturamento",
      valor: brlK(mes.faturamento),
      sub: competenciaRotulo(competencia),
    },
    {
      label: "Nº de vendas",
      valor: num(mes.atendimentos),
      sub: competenciaRotulo(competencia),
    },
    {
      label: "Meta mensal",
      valor: metaAlvo > 0 ? brlK(metaAlvo) : "—",
      sub: competenciaRotulo(competencia),
    },
    {
      label: "Atingimento",
      valor: metaAlvo > 0 ? pct(atingimentoPct, 1) : "—",
      sub: metaAlvo > 0 ? `${brlK(mes.faturamento)} de ${brlK(metaAlvo)}` : "Sem meta para este mês",
    },
  ];

  const kpisHoje: LiveKpiToday[] = [
    {
      label: "Faturamento hoje",
      valor: brlK(hoje.faturamento),
      tint: "acc",
    },
    {
      label: "Nº de vendas hoje",
      valor: num(hoje.atendimentos),
      tint: "warn",
    },
    {
      label: "Ticket médio hoje",
      valor: ticketHoje > 0 ? brl(ticketHoje) : "—",
      tint: "ok",
    },
    {
      label: "Itens vendidos hoje",
      valor: num(hoje.itens),
      tint: "info",
    },
  ];

  const vendedores = vendedoresNoEscopo(filialIds.length ? filialIds : fs.map((f) => f.id));
  const rankingRaw = vendedores
    .map((c) => {
      const ag = fatVendedorNoPeriodo(c, mesInicio, mesFim);
      return { c, ag };
    })
    .filter((x) => x.ag.faturamento > 0 || x.ag.atendimentos > 0)
    .sort((a, b) => b.ag.faturamento - a.ag.faturamento);

  const ranking: RankingRow[] = rankingRaw.map((x, i) => ({
    posicao: i + 1,
    colaboradorId: x.c.id,
    nome: x.c.nome,
    vendas: x.ag.atendimentos,
    faturamento: x.ag.faturamento,
  }));

  const rankingLojas: StoreRankingRow[] = fs
    .map((f) => {
      const fat = agregadoFiliais([f], mesInicio, mesFim).faturamento;
      const metaFilial = goalOfStore(f.id, competencia);
      const pctMeta = metaFilial && metaFilial.valorLoja > 0 ? (fat / metaFilial.valorLoja) * 100 : undefined;
      return { id: f.id, nome: f.fantasia, valor: fat, pctMeta };
    })
    .sort((a, b) => b.valor - a.valor);

  const escopoFiliais = filialIds.length ? filialIds : stores.map((f) => f.id);
  const desafiosSrc = challengesInScope(competencia, escopoFiliais).filter(desafioAtivoAgora);
  const challenges: LiveChallenge[] = desafiosSrc.map((d) => {
    const parts = d.participantes
      .map((id) => {
        const c = collaborators.find((x) => x.id === id);
        if (!c) return null;
        if (filialIds.length && !filialIds.includes(c.filialId)) return null;
        const valor = individualProgress(d, id);
        const alvo = d.alvoIndividual || 1;
        const p = d.unidade === "un" || d.unidade === "R$" ? (valor / alvo) * 100 : (valor / alvo) * 100;
        return { colaboradorId: id, nome: c.nome, valor, pct: Math.min(100, p) };
      })
      .filter((x): x is ChallengeTop => x != null)
      .sort((a, b) => b.valor - a.valor);

    const top3 = parts.slice(0, 3);
    const soma = parts.reduce((s, p) => s + p.valor, 0);
    const media = parts.length ? soma / parts.length : 0;
    const usaMedia = challengeIsIndex(d);
    const realizado = usaMedia ? media : soma;
    const alvoAgg = usaMedia ? d.alvoIndividual : d.alvoIndividual * Math.max(1, parts.length);
    return {
      id: d.id,
      nome: d.nome,
      objetivo: d.objetivo,
      prazoRotulo: diasRestantesRotulo(d),
      premio: d.premio,
      acumuladoRotulo:
        d.unidade === "R$"
          ? `${brl(realizado)} / ${brl(alvoAgg)}`
          : d.unidade === "x"
            ? `${realizado.toFixed(2)} / ${alvoAgg.toFixed(2)}`
            : `${num(realizado)} / ${num(alvoAgg)} ${d.unidade}`,
      progressoPct: alvoAgg > 0 ? Math.min(100, (realizado / alvoAgg) * 100) : 0,
      top3,
    };
  });

  let meta: LiveGoal | null = null;
  if (metaAlvo > 0) {
    const porVendedor: PersonGoalRow[] = rankingRaw.map((x, i) => {
      const metaInd =
        filialIds.length === 1
          ? (goalOfStore(x.c.filialId, competencia)?.valorLoja ?? metaAlvo) / Math.max(1, rankingRaw.length)
          : metaAlvo / Math.max(1, rankingRaw.length);
      const p = metaInd > 0 ? (x.ag.faturamento / metaInd) * 100 : 0;
      return {
        posicao: i + 1,
        id: x.c.id,
        nome: x.c.nome,
        faturamento: x.ag.faturamento,
        pct: p,
        nivelNome: nivelPorPct(p),
      };
    });

    const gruposEscopo = grupos.filter((g) => !filialIds.length || filialIds.includes(g.filialId));
    const porGrupo: GroupGoalRow[] = gruposEscopo.map((g) => {
      const membros = vendedores.filter((c) => c.grupoId === g.id);
      const fat = membros.reduce((s, c) => s + fatVendedorNoPeriodo(c, mesInicio, mesFim).faturamento, 0);
      const peso = membros.length / Math.max(1, vendedores.length);
      const metaG = Math.round(metaAlvo * peso);
      const p = metaG > 0 ? (fat / metaG) * 100 : 0;
      const top3 = membros
        .map((c) => {
          const f = fatVendedorNoPeriodo(c, mesInicio, mesFim).faturamento;
          const mi = metaG / Math.max(1, membros.length);
          return { nome: c.nome, faturamento: f, pct: mi > 0 ? (f / mi) * 100 : 0 };
        })
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 3);
      return {
        id: g.id,
        nome: g.nome,
        faturamento: fat,
        meta: metaG,
        pct: p,
        vendedores: membros.length,
        top3,
      };
    });

    meta = {
      competencia,
      competenciaRotulo: competenciaRotulo(competencia),
      realizado: mes.faturamento,
      alvo: metaAlvo,
      pct: atingimentoPct,
      niveis: defaultTiers.map((d) => ({ nome: d.nome, atingimentoMinPct: d.atingimentoMinPct })),
      porVendedor,
      porGrupo,
    };
  }

  return {
    competencia,
    kpis,
    kpisHoje,
    ranking,
    rankingLojas,
    challenges,
    meta,
  };
}

function competenciaRotulo(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const nomes = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${nomes[m - 1]} de ${y}`;
}

/** Test helper — empty ranking when forcing a future empty window is not needed; use Escopo with period. */
export function __testOnly_aggregateStores(fs: { id: string }[], inicio: string, fim: string) {
  return agregadoFiliais(fs, inicio, fim);
}
