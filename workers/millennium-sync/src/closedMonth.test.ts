import { describe, expect, it } from "vitest";
import { closedMonthRange, isHistoryRangeDay, margemLinesFromItems, unitCostsFromMargem } from "./closedMonth.ts";

describe("isHistoryRangeDay", () => {
  it("todo dia antes de hoje (inclui o mês atual); hoje não", () => {
    expect(isHistoryRangeDay("2026-08-31", "2026-09-25")).toBe(true);
    expect(isHistoryRangeDay("2026-09-24", "2026-09-25")).toBe(true);
    expect(isHistoryRangeDay("2026-09-25", "2026-09-25")).toBe(false);
  });
});

describe("closedMonthRange (mês atual)", () => {
  it("de ontem até o dia 1 do mês atual", () => {
    expect(closedMonthRange("2026-09-24", "2026-08-01")).toEqual({ from: "2026-09-01", to: "2026-09-24" });
  });
});

describe("closedMonthRange", () => {
  it("do dia 1 do mês até o dia", () => {
    expect(closedMonthRange("2026-08-31", "2026-07-01")).toEqual({ from: "2026-08-01", to: "2026-08-31" });
  });
  it("respeita o limite da carga dentro do mês", () => {
    expect(closedMonthRange("2026-08-31", "2026-08-10")).toEqual({ from: "2026-08-10", to: "2026-08-31" });
  });
});

describe("margemLinesFromItems", () => {
  const unit = unitCostsFromMargem([
    { codProduto: "271", qty: 10, custoFranquias: 20.5, custoTotal: 205, totalVenda: 549 },
    { codProduto: "WP10", qty: 2, custoFranquias: 0, custoTotal: 30, totalVenda: 99.8 },
  ]);

  it("itens do dia × custo unitário do mês", () => {
    const lines = margemLinesFromItems(
      [
        { code: "271", qty: 1, revenueCents: 5490 },
        { code: "271", qty: 2, revenueCents: 10980 },
        { code: "WP10", qty: 1, revenueCents: 4990 },
      ],
      unit,
    );
    expect(lines).toEqual([
      { codProduto: "271", qty: 3, custoFranquias: 20.5, custoTotal: 61.5, totalVenda: 164.7 },
      { codProduto: "WP10", qty: 1, custoFranquias: 15, custoTotal: 15, totalVenda: 49.9 },
    ]);
  });

  it("brinde (R$ 0) entra com custo", () => {
    const lines = margemLinesFromItems([{ code: "271", qty: 1, revenueCents: 0 }], unit);
    expect(lines?.[0]).toMatchObject({ qty: 1, custoTotal: 20.5, totalVenda: 0 });
  });

  it("produto sem custo no mês ou sem código → null", () => {
    expect(margemLinesFromItems([{ code: "999", qty: 1, revenueCents: 100 }], unit)).toBeNull();
    expect(margemLinesFromItems([{ code: "", qty: 1, revenueCents: 100 }], unit)).toBeNull();
  });
});
