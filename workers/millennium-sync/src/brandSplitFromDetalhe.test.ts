import { describe, expect, it } from "vitest";
import {
  saleRowsFromDetLines,
  splitLinesByBrand,
  uniqueBrandSplitHeaders,
} from "./brandSplitFromDetalhe";
import type { SaleRowWithFilial } from "./millenniumSales";

describe("splitLinesByBrand", () => {
  it("splits mixed cart by product map", () => {
    const map = new Map<number, "WEPINK" | "WPINK">([
      [148, "WEPINK"],
      [475, "WPINK"],
    ]);
    const by = splitLinesByBrand(
      [
        { productId: 148, revenueCents: 5290, qty: 1, descProduto: "a" },
        { productId: 475, revenueCents: 8990, qty: 2, descProduto: "b" },
        { productId: 999, revenueCents: 100, qty: 1, descProduto: "unknown" },
      ],
      map,
    );
    expect(by.get("WEPINK")).toEqual({ revenueCents: 5290, itemCount: 1 });
    expect(by.get("WPINK")).toEqual({ revenueCents: 8990, itemCount: 2 });
    expect(by.has("ALL" as never)).toBe(false);
  });
});

describe("uniqueBrandSplitHeaders", () => {
  it("dedupes COD_OPERACAO+NF and drops rows without NF", () => {
    const at = new Date("2026-09-21T15:00:00.000Z");
    const rows: SaleRowWithFilial[] = [
      {
        operationCode: "13199979",
        occurredAt: at,
        revenueCents: 5290,
        itemQty: 1,
        storeId: "s1",
        brand: "ALL",
        millenniumFilial: 40261,
        millenniumOpCode: 13199979,
        nf: "14286",
        tipoOperacao: "S",
      },
      {
        operationCode: "13199979",
        occurredAt: at,
        revenueCents: 5290,
        itemQty: 1,
        storeId: "s1",
        brand: "ALL",
        millenniumFilial: 40261,
        millenniumOpCode: 13199979,
        nf: "14286",
        tipoOperacao: "S",
      },
      {
        operationCode: "anon-1",
        occurredAt: at,
        revenueCents: 100,
        itemQty: 1,
        storeId: "s1",
        brand: "ALL",
        millenniumFilial: 40261,
        millenniumOpCode: null,
        nf: null,
        tipoOperacao: null,
      },
    ];
    const headers = uniqueBrandSplitHeaders(rows);
    expect(headers).toHaveLength(1);
    expect(headers[0].millenniumOpCode).toBe(13199979);
    expect(headers[0].nf).toBe("14286");
  });
});

describe("saleRowsFromDetLines", () => {
  it("emits one SaleRow per brand present", () => {
    const map = new Map<number, "WEPINK" | "WPINK">([
      [148, "WEPINK"],
      [475, "WPINK"],
    ]);
    const at = new Date("2026-09-21T15:00:00.000Z");
    const rows = saleRowsFromDetLines(
      {
        operationCode: "13222872",
        millenniumOpCode: 13222872,
        nf: "14330",
        tipoOperacao: "S",
        occurredAt: at,
        storeId: "s1",
      },
      [
        { productId: 148, revenueCents: 10000, qty: 1, descProduto: "wepink" },
        { productId: 475, revenueCents: 5000, qty: 1, descProduto: "wpink" },
      ],
      map,
    );
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.brand === "WEPINK")?.revenueCents).toBe(10000);
    expect(rows.find((r) => r.brand === "WPINK")?.revenueCents).toBe(5000);
  });
});
