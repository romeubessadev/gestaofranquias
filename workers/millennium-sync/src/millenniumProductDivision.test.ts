import { describe, expect, it } from "vitest";
import {
  mergeProductBrandMaps,
  parseListarVendasSaldoCodes,
  parseProductCodeToIdLookup,
  parseProductDivisionRawData,
  resolveBrandCodesToIds,
} from "./millenniumProductDivision";

describe("parseProductDivisionRawData", () => {
  it("extracts PRODUTO ids from RAW_DATA", () => {
    const ids = parseProductDivisionRawData({
      RAW_DATA: [
        {
          PRODUTO_PRODUTO_COD_PRODUTO: "WP024",
          PRODUTO_PRODUTO_PRODUTO: 475,
        },
        {
          PRODUTO_PRODUTO_COD_PRODUTO: "WP002",
          PRODUTO_PRODUTO_PRODUTO: 452,
        },
        {
          PRODUTO_PRODUTO_COD_PRODUTO: "WP024",
          PRODUTO_PRODUTO_PRODUTO: 475,
        },
      ],
    });
    expect(ids).toEqual([475, 452]);
  });
});

describe("mergeProductBrandMaps", () => {
  it("maps product ids to WEPINK / WPINK", () => {
    const map = mergeProductBrandMaps([
      { brand: "WPINK", productIds: [475, 452] },
      { brand: "WEPINK", productIds: [148, 200] },
    ]);
    expect(map.get(475)).toBe("WPINK");
    expect(map.get(148)).toBe("WEPINK");
    expect(map.get(999)).toBeUndefined();
  });
});

describe("LISTARVENDASSALDO + lookup", () => {
  it("parses COD_PRODUTO list", () => {
    expect(
      parseListarVendasSaldoCodes({
        value: [
          { COD_PRODUTO: "WP002", SALDO: 74 },
          { COD_PRODUTO: "WP002", SALDO: 1 },
          { COD_PRODUTO: "WP070", SALDO: null },
          { COD_PRODUTO: "  ", SALDO: 0 },
        ],
      }),
    ).toEqual(["WP002", "WP070"]);
  });

  it("parses COD → id lookup", () => {
    const map = parseProductCodeToIdLookup({
      value: [
        { PRODUTO_PRODUTO_PRODUTO: 452, PRODUTO_PRODUTO_COD_PRODUTO: "WP002" },
        { PRODUTO_PRODUTO_PRODUTO: 507, PRODUTO_PRODUTO_COD_PRODUTO: "904" },
      ],
    });
    expect(map.get("WP002")).toBe(452);
    expect(map.get("904")).toBe(507);
  });

  it("resolves codes via lookup", () => {
    const codeToId = new Map([
      ["WP002", 452],
      ["WP070", 60669],
    ]);
    expect(resolveBrandCodesToIds(["WP002", "MISSING", "WP070", "WP002"], codeToId)).toEqual([
      452, 60669,
    ]);
  });
});
