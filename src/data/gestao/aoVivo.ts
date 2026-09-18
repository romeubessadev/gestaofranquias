/**
 * Camada de visão — Ao vivo (competência do mês + pulso do dia).
 */
import { brl, brlK, fimDoMes, intervaloDias, num, pct } from "@/lib/formato";
import { type Escopo } from "./dashboard";
import { colaboradores, vendedorElegivel, type Colaborador } from "./equipe";
import { desafiosAtivos, progressoIndividual, type Desafio } from "./desafios";
import { filiais, grupos, type Filial } from "./filiais";
import { metaDaFilial, degrausPadrao } from "./metas";
import { HOJE_ISO, HORA_ATUAL } from "./relogio";
import { diaVendas, type Agregado, agregadoDoDia, somarAgregados } from "./vendas";

function filiaisDoEscopo(escopo: Escopo): Filial[] {
  return escopo.filialIds.length === 0 ? filiais : filiais.filter((f) => escopo.filialIds.includes(f.id));
}

export interface AoVivoKpi {
  label: string;
  valor: string;
  sub?: string;
}

export interface RankingLinha {
  posicao: number;
  colaboradorId: string;
  nome: string;
  vendas: number;
  faturamento: number;
}

export interface DesafioTop {
  colaboradorId: string;
  nome: string;
  valor: number;
  pct: number;
}

export interface DesafioAoVivo {
  id: string;
  nome: string;
  objetivo: string;
  prazoRotulo: string;
  premio: number;
  acumuladoRotulo: string;
  progressoPct: number;
  top3: DesafioTop[];
}

export interface MetaNivel {
  nome: string;
  atingimentoMinPct: number;
}

export interface MetaPessoaLinha {
  posicao: number;
  id: string;
  nome: string;
  faturamento: number;
  pct: number;
  nivelNome: string | null;
}

export interface MetaGrupoLinha {
  id: string;
  nome: string;
  faturamento: number;
  meta: number;
  pct: number;
  vendedores: number;
  top3: { nome: string; faturamento: number; pct: number }[];
}

export interface MetaAoVivo {
  id: string;
  nome: string;
  filialId: string;
  lojaNome: string;
  competencia: string;
  competenciaRotulo: string;
  realizado: number;
  alvo: number;
  pct: number;
  niveis: MetaNivel[];
  porVendedor: MetaPessoaLinha[];
  porGrupo: MetaGrupoLinha[];
}

export interface EvolucaoLinha {
  colaboradorId: string;
  nome: string;
  valores: (number | null)[];
}

export interface AoVivoView {
  competencia: string;
  kpis: AoVivoKpi[];
  ranking: RankingLinha[];
  desafios: DesafioAoVivo[];
  /** Metas da competência no escopo (1+ lojas → 1+ cards). */
  metas: MetaAoVivo[];
  evolucaoMeses: string[];
  evolucao: EvolucaoLinha[];
  insightMock: string;
}

function competenciaAtual(): string {
  return HOJE_ISO.slice(0, 7);
}

function agregadoFiliais(fs: { id: string }[], inicio: string, fim: string): Agregado {
  return somarAgregados(
    fs.flatMap((f) =>
      intervaloDias(inicio, fim).map((iso) => {
        const dia = diaVendas(f.id, iso);
        if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
        return agregadoDoDia(dia, null, iso === HOJE_ISO ? HORA_ATUAL : undefined);
      }),
    ),
  );
}

function vendedoresNoEscopo(filialIds: string[]): Colaborador[] {
  return colaboradores.filter(
    (c) =>
      (filialIds.length === 0 || filialIds.includes(c.filialId)) &&
      vendedorElegivel(c) &&
      !c.excluirDeRanking,
  );
}

function fatVendedorNoPeriodo(c: Colaborador, inicio: string, fim: string): Agregado {
  return somarAgregados(
    intervaloDias(inicio, fim).map((iso) => {
      const dia = diaVendas(c.filialId, iso);
      if (!dia) return { faturamento: 0, atendimentos: 0, itens: 0 };
      const raw = dia.porVendedora[c.id];
      if (!raw) return { faturamento: 0, atendimentos: 0, itens: 0 };
      if (iso === HOJE_ISO) {
        // Aproxima truncamento horário pela fração do dia decorrido.
        const diaFull = dia.total.atendimentos || 1;
        const ateAgora = Object.entries(dia.porHora)
          .filter(([h]) => Number(h) <= HORA_ATUAL)
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

function desafioAtivoAgora(d: Desafio): boolean {
  return HOJE_ISO >= d.inicio && HOJE_ISO <= d.fim;
}

function diasRestantesRotulo(d: Desafio): string {
  if (HOJE_ISO > d.fim) return "Encerrado";
  if (HOJE_ISO < d.inicio) return "A começar";
  const n = intervaloDias(HOJE_ISO, d.fim).length;
  return n === 1 ? "1d" : `${n}d`;
}

function nivelPorPct(pctVal: number): string | null {
  let atual: string | null = null;
  for (const d of degrausPadrao) {
    if (pctVal >= d.atingimentoMinPct) atual = d.nome;
  }
  return atual;
}

function mesRotulo(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[m - 1]}/${String(y).slice(2)}`;
}

function ultimosMeses(n: number, ateYm: string): string[] {
  const [y0, m0] = ateYm.split("-").map(Number);
  const out: string[] = [];
  let y = y0;
  let m = m0;
  for (let i = 0; i < n; i++) {
    out.unshift(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

/** Re-export helper used by tests when Escopo type needs filiais list. */
export { filiaisDoEscopo };

export function montarAoVivoView(escopo: Escopo): AoVivoView {
  const competencia = competenciaAtual();
  const fs = filiaisDoEscopo(escopo);
  const filialIds = fs.map((f) => f.id);
  const mesInicio = `${competencia}-01`;
  const mesFim = HOJE_ISO < fimDoMes(mesInicio) ? HOJE_ISO : fimDoMes(mesInicio);

  const mes = agregadoFiliais(fs, mesInicio, mesFim);
  const hoje = agregadoFiliais(fs, HOJE_ISO, HOJE_ISO);

  const metaAlvo =
    filialIds.length === 1
      ? metaDaFilial(filialIds[0], competencia)?.valorLoja ?? 0
      : filialIds.reduce((s, id) => s + (metaDaFilial(id, competencia)?.valorLoja ?? 0), 0);

  const atingimentoPct = metaAlvo > 0 ? (mes.faturamento / metaAlvo) * 100 : 0;

  const kpis: AoVivoKpi[] = [
    {
      label: "Total de Vendas",
      valor: num(mes.atendimentos),
      sub: `Hoje ${num(hoje.atendimentos)}`,
    },
    {
      label: "Faturamento",
      valor: brlK(mes.faturamento),
      sub: `Hoje ${brlK(hoje.faturamento)}`,
    },
    {
      label: "Meta Mensal",
      valor: metaAlvo > 0 ? brlK(metaAlvo) : "—",
      sub: competenciaRotulo(competencia),
    },
    {
      label: "Atingimento",
      valor: metaAlvo > 0 ? pct(atingimentoPct, 1) : "—",
      sub: metaAlvo > 0 ? `${brlK(mes.faturamento)} / ${brlK(metaAlvo)}` : "Sem meta na competência",
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

  const ranking: RankingLinha[] = rankingRaw.map((x, i) => ({
    posicao: i + 1,
    colaboradorId: x.c.id,
    nome: x.c.nome,
    vendas: x.ag.atendimentos,
    faturamento: x.ag.faturamento,
  }));

  const desafiosSrc = desafiosAtivos(competencia).filter(desafioAtivoAgora);
  const desafios: DesafioAoVivo[] = desafiosSrc.map((d) => {
    const parts = d.participantes
      .map((id) => {
        const c = colaboradores.find((x) => x.id === id);
        if (!c) return null;
        if (filialIds.length && !filialIds.includes(c.filialId)) return null;
        const valor = progressoIndividual(d, id);
        const alvo = d.alvoIndividual || 1;
        const p = d.unidade === "un" || d.unidade === "R$" ? (valor / alvo) * 100 : (valor / alvo) * 100;
        return { colaboradorId: id, nome: c.nome, valor, pct: Math.min(100, p) };
      })
      .filter((x): x is DesafioTop => x != null)
      .sort((a, b) => b.valor - a.valor);

    const top3 = parts.slice(0, 3);
    const soma = parts.reduce((s, p) => s + p.valor, 0);
    const alvoAgg = d.alvoIndividual * Math.max(1, parts.length);
    return {
      id: d.id,
      nome: d.nome,
      objetivo: d.objetivo,
      prazoRotulo: diasRestantesRotulo(d),
      premio: d.premio,
      acumuladoRotulo:
        d.unidade === "R$"
          ? `${brl(soma)} / ${brl(alvoAgg)}`
          : d.unidade === "x"
            ? `${soma.toFixed(2)} / ${alvoAgg.toFixed(2)}`
            : `${num(soma)} / ${num(alvoAgg)} ${d.unidade}`,
      progressoPct: alvoAgg > 0 ? Math.min(100, (soma / alvoAgg) * 100) : 0,
      top3,
    };
  });

  const metas: MetaAoVivo[] = fs
    .map((f) => {
      const cadastro = metaDaFilial(f.id, competencia);
      if (!cadastro) return null;
      const vendedoresFilial = vendedores.filter((c) => c.filialId === f.id);
      const rankingFilial = rankingRaw.filter((x) => x.c.filialId === f.id);
      const realizado = agregadoFiliais([f], mesInicio, mesFim).faturamento;
      const alvo = cadastro.valorLoja;
      const pctVal = alvo > 0 ? (realizado / alvo) * 100 : 0;

      const porVendedor: MetaPessoaLinha[] = rankingFilial.map((x, i) => {
        const metaInd = alvo / Math.max(1, rankingFilial.length);
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

      const gruposFilial = grupos.filter((g) => g.filialId === f.id);
      const porGrupo: MetaGrupoLinha[] = gruposFilial.map((g) => {
        const membros = vendedoresFilial.filter((c) => c.grupoId === g.id);
        const fat = membros.reduce((s, c) => s + fatVendedorNoPeriodo(c, mesInicio, mesFim).faturamento, 0);
        const peso = membros.length / Math.max(1, vendedoresFilial.length);
        const metaG = Math.round(alvo * peso);
        const p = metaG > 0 ? (fat / metaG) * 100 : 0;
        const top3 = membros
          .map((c) => {
            const ff = fatVendedorNoPeriodo(c, mesInicio, mesFim).faturamento;
            const mi = metaG / Math.max(1, membros.length);
            return { nome: c.nome, faturamento: ff, pct: mi > 0 ? (ff / mi) * 100 : 0 };
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

      return {
        id: cadastro.id,
        nome: cadastro.nome,
        filialId: f.id,
        lojaNome: f.fantasia,
        competencia,
        competenciaRotulo: competenciaRotulo(competencia),
        realizado,
        alvo,
        pct: pctVal,
        niveis: cadastro.degraus.map((d) => ({ nome: d.nome, atingimentoMinPct: d.atingimentoMinPct })),
        porVendedor,
        porGrupo,
      } satisfies MetaAoVivo;
    })
    .filter((m): m is MetaAoVivo => m != null);

  const evolucaoMeses = ultimosMeses(6, competencia);
  const topEvolucao = rankingRaw.slice(0, 4).map((x) => x.c);
  const evolucao: EvolucaoLinha[] = topEvolucao.map((c) => ({
    colaboradorId: c.id,
    nome: c.nome,
    valores: evolucaoMeses.map((ym) => {
      const ini = `${ym}-01`;
      const fim = ym === competencia ? mesFim : fimDoMes(ini);
      if (fim < c.dataAdmissao) return null;
      const fat = fatVendedorNoPeriodo(c, ini, fim).faturamento;
      return fat > 0 ? fat : null;
    }),
  }));

  const insightMock =
    ranking.length === 0
      ? "Ainda não há vendas na competência. Acompanhe o lançamento no caixa para ver o ranking ao vivo."
      : `${ranking[0].nome} lidera o mês com ${brlK(ranking[0].faturamento)}. Atingimento da meta em ${pct(atingimentoPct, 1)}. Hoje: ${num(hoje.atendimentos)} vendas · ${brlK(hoje.faturamento)}.`;

  return {
    competencia,
    kpis,
    ranking,
    desafios,
    metas,
    evolucaoMeses: evolucaoMeses.map(mesRotulo),
    evolucao,
    insightMock,
  };
}

function competenciaRotulo(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const nomes = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${nomes[m - 1]} de ${y}`;
}

/** Test helper — empty ranking when forcing a future empty window is not needed; use Escopo with period. */
export function __testOnly_agregadoFiliais(fs: { id: string }[], inicio: string, fim: string) {
  return agregadoFiliais(fs, inicio, fim);
}
