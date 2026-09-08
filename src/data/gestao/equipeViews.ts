/**
 * Camada de visões da aba Equipe (EQUIP-01..07): elegibilidade por data,
 * meta individual derivada e agregados por vendedora. Fica separada do
 * cadastro (equipe.ts) porque vendas.ts consome o cadastro no boot —
 * importar o cadastro daqui evita ciclo de módulos.
 */
import { vendedorElegivel, colaboradoresDaFilial, type Colaborador } from "./equipe";
import { metaDaFilial, type Meta } from "./metas";
import { HOJE_ISO, HORA_ATUAL } from "./relogio";
import { agregadoDoDia, diaVendas, lojaAberta } from "./vendas";
import { filialPorId, type Filial } from "./filiais";
import { fimDoMes, intervaloDias, somarDias } from "@/lib/formato";

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
 * elegíveis. Período parcial (admissão/inatividade no meio do mês): o peso da
 * vendedora fica proporcional aos dias elegíveis dela, e a meta da loja é
 * redistribuída entre todas — a soma das individuais fecha com a meta da
 * loja em qualquer composição de equipe.
 */
export function metaIndividual(c: Colaborador, filialId: string, competencia: string): MetaIndividual | null {
  const meta = metaDaFilial(filialId, competencia);
  if (!meta) return null;
  const filial = filialPorId(filialId);
  const primeiroMes = `${competencia}-01`;
  const ultimoMes = fimDoMes(primeiroMes);
  const elegiveisMes = colaboradoresDaFilial(filialId).filter((x) => presenteNoDia(x, primeiroMes) || presenteNoDia(x, HOJE_ISO));
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
  const proporcional = dias.length < diasAbertosMes;
  return { valor, proporcional, diasElegiveis: dias.length, diasAbertosMes };
}

export interface AgregadoVendedora {
  colaboradorId: string;
  faturamento: number;
  atendimentos: number;
  itens: number;
  diasTrabalhados: number;
}

/** Agregado da vendedora no período (respeitando a fração do dia de hoje). */
export function agregadoVendedoraPeriodo(c: Colaborador, filialId: string, inicio: string, fim: string): AgregadoVendedora {
  const filial = filialPorId(filialId);
  const out = { colaboradorId: c.id, faturamento: 0, atendimentos: 0, itens: 0, diasTrabalhados: 0 };
  for (const iso of intervaloDias(inicio, fim)) {
    if (!presenteNoDia(c, iso)) continue;
    const dia = diaVendas(filialId, iso);
    if (!dia) continue;
    const horaMax = iso === HOJE_ISO ? HORA_ATUAL : undefined;
    const doDia = dia.porVendedora[c.id];
    if (!doDia) continue;
    const totalDia = agregadoDoDia(dia, null, horaMax);
    // Fração do dia (quando hoje incompleto) aplicada à fatia da vendedora.
    const fr = totalDia.faturamento > 0 ? doDia.faturamento / dia.total.faturamento : 0;
    const faturamento = Math.round(totalDia.faturamento * fr);
    const atendimentos = Math.round(totalDia.atendimentos * fr);
    const itens = Math.round(totalDia.itens * fr);
    if (faturamento > 0 || atendimentos > 0) out.diasTrabalhados += 1;
    out.faturamento += faturamento;
    out.atendimentos += atendimentos;
    out.itens += itens;
  }
  return out;
}

/** Vendedoras elegíveis presentes na loja no mês (base de listas e somas). */
export function vendedorasDaLoja(filialId: string, competencia: string): Colaborador[] {
  const primeiroMes = `${competencia}-01`;
  return colaboradoresDaFilial(filialId).filter((c) => presenteNoDia(c, primeiroMes) || presenteNoDia(c, HOJE_ISO));
}