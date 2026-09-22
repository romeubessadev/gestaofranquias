import { describe, expect, it } from "vitest";
import { isIntegrationActive } from "./deps.ts";

describe("isIntegrationActive", () => {
  it("allows claim when sync is not paused (presence not required)", () => {
    expect(isIntegrationActive({ sync_paused: false })).toBe(true);
    expect(isIntegrationActive({})).toBe(true);
    expect(isIntegrationActive(null)).toBe(true);
    expect(isIntegrationActive(undefined)).toBe(true);
  });

  it("blocks claim when sync_paused is true", () => {
    expect(isIntegrationActive({ sync_paused: true })).toBe(false);
  });
});
