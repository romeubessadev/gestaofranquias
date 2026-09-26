/**
 * Carga do histórico em período: Lista, relatório de cupom e margem vêm 1× por loja no período
 * (em vez de 1× por dia), em blocos de mês calendário, só com dias que já fecharam.
 * Margem do dia = itens do dia (relatório de cupom + detalhe das vendas sem vendedora)
 * × custo unitário do período — o custo não muda dentro do mês (validado ago/26 nas 3 lojas).
 */
import type { MargemLine } from "./millenniumMargem.ts";

export type ClosedMonthItem = { code: string; qty: number; revenueCents: number };

/** `day` já fechou em relação a `today` (ambos no fuso da loja). */
export function isHistoryRangeDay(day: string, today: string): boolean {
  return day < today;
}

/** Período da carga que termina em `day`: do dia 1 do mês (ou `until`, se for depois) até `day`. */
export function closedMonthRange(day: string, until: string): { from: string; to: string } {
  const first = `${day.slice(0, 7)}-01`;
  return { from: first > until ? first : until, to: day };
}

/** COD_PRODUTO → custo unitário (reais) da margem do período. */
export function unitCostsFromMargem(lines: MargemLine[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const line of lines) {
    const code = line.codProduto.trim();
    if (!code) continue;
    const unit = line.custoFranquias > 0 || line.qty === 0 ? line.custoFranquias : line.custoTotal / line.qty;
    out.set(code, unit);
  }
  return out;
}

/** Margem de 1 dia a partir dos itens vendidos. null = algum produto sem custo no mês. */
export function margemLinesFromItems(items: ClosedMonthItem[], unitCost: Map<string, number>): MargemLine[] | null {
  const byCode = new Map<string, { qty: number; revenueCents: number }>();
  for (const item of items) {
    const code = item.code.trim();
    if (!code) return null;
    const acc = byCode.get(code) ?? { qty: 0, revenueCents: 0 };
    acc.qty += item.qty;
    acc.revenueCents += item.revenueCents;
    byCode.set(code, acc);
  }
  const out: MargemLine[] = [];
  for (const [code, { qty, revenueCents }] of byCode) {
    const unit = unitCost.get(code);
    if (unit == null) return null;
    out.push({
      codProduto: code,
      qty,
      custoFranquias: unit,
      custoTotal: unit * qty,
      totalVenda: revenueCents / 100,
    });
  }
  return out;
}
