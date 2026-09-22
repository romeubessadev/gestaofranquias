/**
 * Classifica itens do ConsultaDetMov → SaleRow WEPINK/WPINK (pra aggregateSales).
 */
import type { SaleRow, SalesBrand } from "../../../src/data/wedash/salesTypes.ts";
import type { DetMovLine } from "./millenniumDetMov.ts";
import type { ProductBrandMap } from "./millenniumProductDivision.ts";
import type { SaleRowWithFilial } from "./millenniumSales.ts";

export type BrandSplitHeader = {
  operationCode: string;
  millenniumOpCode: number;
  nf: string;
  tipoOperacao: string;
  occurredAt: Date;
  storeId: string;
};

/** Soma linhas por marca (ignora produto fora do mapa). */
export function splitLinesByBrand(
  lines: DetMovLine[],
  productMap: ProductBrandMap,
): Map<SalesBrand, { revenueCents: number; itemCount: number }> {
  const out = new Map<SalesBrand, { revenueCents: number; itemCount: number }>();
  for (const line of lines) {
    const brand = productMap.get(line.productId);
    if (!brand || brand === "ALL") continue;
    const prev = out.get(brand) ?? { revenueCents: 0, itemCount: 0 };
    prev.revenueCents += line.revenueCents;
    prev.itemCount += line.qty;
    out.set(brand, prev);
  }
  return out;
}

/** Headers únicos com NF + COD_OPERACAO numérico (1 DetMov por cupom). */
export function uniqueBrandSplitHeaders(rows: SaleRowWithFilial[]): BrandSplitHeader[] {
  const seen = new Set<string>();
  const out: BrandSplitHeader[] = [];
  for (const row of rows) {
    if (row.millenniumOpCode == null || !row.nf) continue;
    const tipo = (row.tipoOperacao ?? "S").trim() || "S";
    const key = `${row.millenniumOpCode}|${row.nf}|${tipo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      operationCode: row.operationCode,
      millenniumOpCode: row.millenniumOpCode,
      nf: row.nf,
      tipoOperacao: tipo,
      occurredAt: row.occurredAt,
      storeId: row.storeId,
    });
  }
  return out;
}

/** Uma venda (detalhe) → 0..2 SaleRows (WEPINK e/ou WPINK). */
export function saleRowsFromDetLines(
  header: BrandSplitHeader,
  lines: DetMovLine[],
  productMap: ProductBrandMap,
): SaleRow[] {
  const byBrand = splitLinesByBrand(lines, productMap);
  const out: SaleRow[] = [];
  for (const [brand, part] of byBrand) {
    if (part.revenueCents === 0 && part.itemCount === 0) continue;
    out.push({
      operationCode: header.operationCode,
      occurredAt: header.occurredAt,
      revenueCents: part.revenueCents,
      itemQty: part.itemCount,
      storeId: header.storeId,
      brand,
    });
  }
  return out;
}
