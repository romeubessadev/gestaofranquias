import { describe, expect, it } from "vitest";
import {
  canForceSyncRefresh,
  forceRefreshRetryAfterSec,
  formatSyncWatermarkLabel,
} from "./syncUi";

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
});
