import { describe, expect, it } from "vitest";
import { parseConsultaDetMovPayload } from "./millenniumDetMov";

describe("parseConsultaDetMovPayload", () => {
  it("maps PRODUTO / PRECO_TOTAL / QUANTIDADE", () => {
    const lines = parseConsultaDetMovPayload([
      {
        PRODUTO: 148,
        DESC_PRODUTO: "BSIF-ATH-001-BODY SPLASH - WEPINK",
        PRECO_TOTAL: 52.9,
        QUANTIDADE: 1,
      },
      {
        PRODUTO: 475,
        DESC_PRODUTO: "WP024-POWER PINK",
        PRECO_TOTAL: 89.9,
        QUANTIDADE: 2,
      },
    ]);
    expect(lines).toEqual([
      {
        productId: 148,
        revenueCents: 5290,
        qty: 1,
        descProduto: "BSIF-ATH-001-BODY SPLASH - WEPINK",
      },
      {
        productId: 475,
        revenueCents: 8990,
        qty: 2,
        descProduto: "WP024-POWER PINK",
      },
    ]);
  });

  it("skips rows without PRODUTO", () => {
    expect(parseConsultaDetMovPayload([{ PRECO_TOTAL: 10, QUANTIDADE: 1 }])).toEqual([]);
  });
});
