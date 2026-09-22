import { describe, expect, it } from "vitest";
import {
  canForceSyncRefresh,
  FORCE_COOLDOWN_MS,
  forceRefreshRetryAfterSec,
  formatForceCooldownLabel,
  formatSyncWatermarkLabel,
  lastForceAtFromRetryAfter,
} from "./syncUi";
import { fetchSalesDayAggs, type SalesQueryClient } from "./salesRepo";

describe("syncUi watermark label (SYNC-10)", () => {
  it("shows pending when never synced", () => {
    expect(formatSyncWatermarkLabel(null)).toBe("Aguardando primeiro sync");
    expect(formatSyncWatermarkLabel(null, { loading: true })).toBe("Sincronizando dados…");
  });

  it("shows relative age from last_light_sync_at", () => {
    const now = new Date("2026-09-19T12:10:00.000Z");
    const wm = new Date("2026-09-19T12:00:00.000Z");
    expect(formatSyncWatermarkLabel(wm, { now })).toBe("Atualizado há 10 min");
    expect(formatSyncWatermarkLabel(wm, { now: new Date("2026-09-19T12:00:30.000Z") })).toBe(
      "Atualizado agora",
    );
  });
});

describe("force refresh role + rate limit (SYNC-11)", () => {
  it("allows OWNER/MANAGER only", () => {
    expect(canForceSyncRefresh("OWNER")).toBe(true);
    expect(canForceSyncRefresh("MANAGER")).toBe(true);
    expect(canForceSyncRefresh("SELLER")).toBe(false);
    expect(canForceSyncRefresh("ADMIN_GLOBAL")).toBe(false);
  });

  it("rejects second force within 5 minutes", () => {
    const last = new Date("2026-09-19T12:00:00.000Z");
    expect(forceRefreshRetryAfterSec(last, new Date("2026-09-19T12:02:00.000Z"))).toBe(180);
    expect(forceRefreshRetryAfterSec(last, new Date("2026-09-19T12:05:00.000Z"))).toBeNull();
    expect(forceRefreshRetryAfterSec(null, new Date())).toBeNull();
  });

  it("formats cooldown mm:ss", () => {
    expect(formatForceCooldownLabel(65)).toBe("1:05");
    expect(formatForceCooldownLabel(9)).toBe("9s");
    expect(formatForceCooldownLabel(300)).toBe("5:00");
  });

  it("hydrates lastForceAt from retryAfterSec", () => {
    const now = new Date("2026-09-19T12:05:00.000Z");
    const last = lastForceAtFromRetryAfter(120, now);
    expect(forceRefreshRetryAfterSec(last, now)).toBe(120);
    expect(now.getTime() - last.getTime()).toBe(FORCE_COOLDOWN_MS - 120_000);
  });
});

describe("dashboard read path never hits Millennium (SYNC-05)", () => {
  it("salesRepo reads only Postgres table names, never VENDAS/Millennium URLs", async () => {
    const tables: string[] = [];
    const client: SalesQueryClient = {
      from(table: string) {
        tables.push(table);
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          gte() {
            return builder;
          },
          lte() {
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          then(resolve: (v: { data: unknown[]; error: null }) => void) {
            resolve({ data: [], error: null });
          },
        };
        return builder;
      },
    };
    await fetchSalesDayAggs(
      { tenantId: "t1", storeIds: [], from: "2026-09-01", to: "2026-09-30" },
      client,
    );
    expect(tables).toEqual(["sales_day_agg"]);
    expect(tables.join(",")).not.toMatch(/VENDAS|millennium|MILLENNIUM/i);
  });
});
