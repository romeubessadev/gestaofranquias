import { describe, expect, it } from "vitest";
import { aggregateSales } from "./salesAggregate";
import type { SaleRow } from "./salesTypes";

/** America/Campo_Grande = UTC−4 year-round (MS). */
const TZ = "America/Campo_Grande";
const TENANT = "tenant-1";
const STORE = "store-1";

function row(partial: Partial<SaleRow> & Pick<SaleRow, "operationCode" | "occurredAt">): SaleRow {
  return {
    revenueCents: 10_00,
    itemQty: 1,
    storeId: STORE,
    brand: "ALL",
    ...partial,
  };
}

describe("aggregateSales", () => {
  it("returns empty day and hour arrays for zero rows", () => {
    const result = aggregateSales([], { tenantId: TENANT, timeZone: TZ, now: new Date("2026-09-19T12:00:00Z") });
    expect(result.days).toEqual([]);
    expect(result.hours).toEqual([]);
  });

  it("counts sales_count as distinct operationCode (duplicate lines do not double sales)", () => {
    const rows: SaleRow[] = [
      row({
        operationCode: "OP-1001",
        occurredAt: new Date("2026-09-18T15:30:00.000Z"),
        revenueCents: 189_90,
        itemQty: 2,
      }),
      row({
        operationCode: "OP-1001",
        occurredAt: new Date("2026-09-18T15:30:00.000Z"),
        revenueCents: 89_90,
        itemQty: 1,
      }),
      row({
        operationCode: "OP-1002",
        occurredAt: new Date("2026-09-18T18:05:00.000Z"),
        revenueCents: 249_00,
        itemQty: 3,
      }),
    ];
    const { days } = aggregateSales(rows, {
      tenantId: TENANT,
      timeZone: TZ,
      now: new Date("2026-09-20T12:00:00Z"),
    });
    expect(days).toHaveLength(1);
    expect(days[0].day).toBe("2026-09-18");
    expect(days[0].salesCount).toBe(2);
    expect(days[0].revenueCents).toBe(189_90 + 89_90 + 249_00);
    expect(days[0].itemCount).toBe(6);
  });

  it("buckets by local DATA_H date across multiple calendar days", () => {
    const rows: SaleRow[] = [
      row({
        operationCode: "A",
        occurredAt: new Date("2026-09-18T15:00:00.000Z"),
        revenueCents: 100_00,
      }),
      row({
        operationCode: "B",
        occurredAt: new Date("2026-09-19T15:00:00.000Z"),
        revenueCents: 200_00,
      }),
    ];
    const { days } = aggregateSales(rows, {
      tenantId: TENANT,
      timeZone: TZ,
      now: new Date("2026-09-20T12:00:00Z"),
    });
    const byDay = Object.fromEntries(days.map((d) => [d.day, d]));
    expect(Object.keys(byDay).sort()).toEqual(["2026-09-18", "2026-09-19"]);
    expect(byDay["2026-09-18"].revenueCents).toBe(100_00);
    expect(byDay["2026-09-19"].revenueCents).toBe(200_00);
  });

  it("uses local DATA_H day — UTC midnight trap (Campo_Grande UTC−4)", () => {
    // 2026-09-19T03:30:00Z = 2026-09-18 23:30 local — must NOT land on 19th
    const rows: SaleRow[] = [
      row({
        operationCode: "TRAP",
        occurredAt: new Date("2026-09-19T03:30:00.000Z"),
        revenueCents: 59_90,
      }),
    ];
    const { days, hours } = aggregateSales(rows, {
      tenantId: TENANT,
      timeZone: TZ,
      now: new Date("2026-09-20T12:00:00Z"),
    });
    expect(days).toHaveLength(1);
    expect(days[0].day).toBe("2026-09-18");
    expect(hours).toEqual([]);
  });

  it("emits hour buckets only for the current local calendar day", () => {
    const now = new Date("2026-09-19T20:00:00.000Z"); // local 16:00 on 19th
    const rows: SaleRow[] = [
      row({
        operationCode: "YEST",
        occurredAt: new Date("2026-09-18T15:00:00.000Z"),
        revenueCents: 50_00,
      }),
      row({
        operationCode: "TODAY-AM",
        occurredAt: new Date("2026-09-19T14:00:00.000Z"), // local 10:00
        revenueCents: 80_00,
      }),
      row({
        operationCode: "TODAY-PM",
        occurredAt: new Date("2026-09-19T18:00:00.000Z"), // local 14:00
        revenueCents: 120_00,
      }),
    ];
    const { days, hours } = aggregateSales(rows, { tenantId: TENANT, timeZone: TZ, now });
    expect(days.map((d) => d.day).sort()).toEqual(["2026-09-18", "2026-09-19"]);
    expect(hours.every((h) => h.day === "2026-09-19")).toBe(true);
    expect(hours).toHaveLength(2);
    const byHour = Object.fromEntries(hours.map((h) => [h.hour, h]));
    expect(byHour[10].salesCount).toBe(1);
    expect(byHour[10].revenueCents).toBe(80_00);
    expect(byHour[14].revenueCents).toBe(120_00);
  });
});
