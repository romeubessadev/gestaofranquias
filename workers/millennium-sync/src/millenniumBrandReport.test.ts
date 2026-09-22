import { describe, expect, it } from "vitest";
import {
  applyAllCountsToWepinkDays,
  applyBrandDayCounts,
  brandReportToDayAggs,
  normalizeBrandLabel,
  parseBrandReportRawData,
  parseQuotedArray,
  reportInstantToDay,
} from "./millenniumBrandReport";

describe("parseQuotedArray", () => {
  it("parses Millennium array strings", () => {
    expect(parseQuotedArray('"22396.27" "0" ')).toEqual(["22396.27", "0"]);
    expect(parseQuotedArray('"WEPINK" "WPINK SUPLEMENTOS" ')).toEqual([
      "WEPINK",
      "WPINK SUPLEMENTOS",
    ]);
  });
});

describe("normalizeBrandLabel", () => {
  it("maps WEPINK and WPINK variants", () => {
    expect(normalizeBrandLabel("WEPINK")).toBe("WEPINK");
    expect(normalizeBrandLabel("WPINK SUPLEMENTOS")).toBe("WPINK");
    expect(normalizeBrandLabel("wpink")).toBe("WPINK");
    expect(normalizeBrandLabel("OUTRA")).toBeNull();
  });
});

describe("reportInstantToDay", () => {
  it("keeps civil day for SP/MS midnight instants", () => {
    expect(reportInstantToDay("2026-09-01T03:00:00.000Z")).toBe("2026-09-01");
    expect(reportInstantToDay("2026-09-01T04:00:00.000Z")).toBe("2026-09-01");
  });
});

describe("parseBrandReportRawData + brandReportToDayAggs", () => {
  it("splits revenue by brand per day", () => {
    const parsed = parseBrandReportRawData({
      RAW_DATA: [
        {
          DATA_DATA_DATA: "2026-09-02T04:00:00.000Z",
          F_366619977: 26198.1402,
          ARRAY_F_366619977: '"25992.3402" "205.8" ',
          ARRAY_PRODUTO_MARCA_DESCRICAO: '"WEPINK" "WPINK SUPLEMENTOS" ',
        },
      ],
    });
    expect(parsed).toHaveLength(1);
    expect(parsed[0].day).toBe("2026-09-02");
    expect(parsed[0].byBrand).toEqual([
      { label: "WEPINK", revenueReais: 25992.3402 },
      { label: "WPINK SUPLEMENTOS", revenueReais: 205.8 },
    ]);

    const aggs = brandReportToDayAggs(parsed, { tenantId: "t1", storeId: "s1" });
    expect(aggs).toEqual([
      {
        tenantId: "t1",
        storeId: "s1",
        day: "2026-09-02",
        brand: "WEPINK",
        revenueCents: 2_599_234,
        salesCount: 0,
        itemCount: 0,
      },
      {
        tenantId: "t1",
        storeId: "s1",
        day: "2026-09-02",
        brand: "WPINK",
        revenueCents: 20_580,
        salesCount: 0,
        itemCount: 0,
      },
    ]);
  });
});

describe("applyBrandDayCounts / applyAllCountsToWepinkDays", () => {
  const report = [
    {
      tenantId: "t1",
      storeId: "s1",
      day: "2026-09-02",
      brand: "WEPINK" as const,
      revenueCents: 8000,
      salesCount: 0,
      itemCount: 0,
    },
    {
      tenantId: "t1",
      storeId: "s1",
      day: "2026-09-02",
      brand: "WPINK" as const,
      revenueCents: 2000,
      salesCount: 0,
      itemCount: 0,
    },
  ];

  it("overlays DetMov counts without changing report revenue", () => {
    const merged = applyBrandDayCounts(report, [
      { ...report[0], revenueCents: 999, salesCount: 7, itemCount: 14 },
      { ...report[1], revenueCents: 111, salesCount: 3, itemCount: 6 },
    ]);
    expect(merged[0]).toMatchObject({ revenueCents: 8000, salesCount: 7, itemCount: 14 });
    expect(merged[1]).toMatchObject({ revenueCents: 2000, salesCount: 3, itemCount: 6 });
  });

  it("copies ALL counts onto WEPINK for cosmetics-only stores", () => {
    const merged = applyAllCountsToWepinkDays(report, [
      {
        tenantId: "t1",
        storeId: "s1",
        day: "2026-09-02",
        brand: "ALL",
        revenueCents: 10000,
        salesCount: 10,
        itemCount: 20,
      },
    ]);
    expect(merged.find((d) => d.brand === "WEPINK")).toMatchObject({
      revenueCents: 8000,
      salesCount: 10,
      itemCount: 20,
    });
    expect(merged.find((d) => d.brand === "WPINK")).toMatchObject({
      salesCount: 0,
      itemCount: 0,
    });
  });
});
