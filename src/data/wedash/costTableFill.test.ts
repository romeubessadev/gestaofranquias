import { describe, expect, it } from "vitest";
import { applyFillToDayAggs, applyFillToProductCosts, buildTableCostFill } from "./costTableFill";
import type { SalesDayAgg, SalesProductCostDayAgg } from "./salesTypes";

const prod = (over: Partial<SalesProductCostDayAgg>): SalesProductCostDayAgg => ({
  tenantId: "t1",
  storeId: "s1",
  day: "2026-09-12",
  productCode: "420",
  itemCount: 2,
  revenueCents: 200_00,
  cmvCents: 0,
  ...over,
});

const day = (brand: SalesDayAgg["brand"], cmvCents: number): SalesDayAgg => ({
  tenantId: "t1",
  storeId: "s1",
  day: "2026-09-12",
  brand,
  revenueCents: 1000_00,
  salesCount: 10,
  itemCount: 12,
  cmvCents,
});

const prices = new Map([
  ["20104|420", 54_47],
  ["20104|WP014", 28_80],
]);

describe("custo pela tabela da loja", () => {
  it("só completa custo 0 de loja com tabela e produto com preço", () => {
    const rows = [
      prod({}),
      prod({ productCode: "WP014", itemCount: 3 }),
      prod({ productCode: "504" }),
      prod({ productCode: "259", cmvCents: 107_62 }),
      prod({ storeId: "s2" }),
    ];
    const fill = buildTableCostFill(rows, new Map([["s1", 20104]]), prices);
    expect([...fill]).toEqual([
      ["s1|2026-09-12|420", 108_94],
      ["s1|2026-09-12|WP014", 86_40],
    ]);
    const out = applyFillToProductCosts(rows, fill);
    expect(out.map((r) => r.cmvCents)).toEqual([108_94, 86_40, 0, 107_62, 0]);
  });

  it("soma no ALL e na marca do produto (WP* = WPINK)", () => {
    const fill = buildTableCostFill(
      [prod({}), prod({ productCode: "WP014", itemCount: 3 })],
      new Map([["s1", 20104]]),
      prices,
    );
    const out = applyFillToDayAggs([day("ALL", 400_00), day("WEPINK", 350_00), day("WPINK", 50_00)], fill);
    expect(out.map((d) => d.cmvCents)).toEqual([400_00 + 108_94 + 86_40, 350_00 + 108_94, 50_00 + 86_40]);
  });
});
