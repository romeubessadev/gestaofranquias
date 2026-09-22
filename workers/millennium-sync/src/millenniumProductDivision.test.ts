import { describe, expect, it } from "vitest";
import {
  mergeProductBrandMaps,
  parseProductDivisionRawData,
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
