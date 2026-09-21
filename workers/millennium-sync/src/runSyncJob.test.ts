import { describe, expect, it, vi } from "vitest";
import { runSyncJob, type SyncJob, type SyncJobDeps, type SyncStore } from "./runSyncJob";

const stores: SyncStore[] = [
  {
    id: "s1",
    millenniumStoreId: 1,
    timezone: "America/Campo_Grande",
  },
  {
    id: "s2",
    millenniumStoreId: 2,
    timezone: "America/Campo_Grande",
  },
];

function baseJob(partial: Partial<SyncJob> = {}): SyncJob {
  return {
    id: "job-1",
    tenantId: "t1",
    credentialId: "c1",
    kind: "LIGHT",
    status: "QUEUED",
    ...partial,
  };
}

function makeDeps(overrides: Partial<SyncJobDeps> = {}): SyncJobDeps & {
  calls: { logout: number; login: number; fetch: string[] };
} {
  const calls = { logout: 0, login: 0, fetch: [] as string[] };
  const deps: SyncJobDeps & { calls: typeof calls } = {
    calls,
    hasRunningForCredential: vi.fn().mockResolvedValue(false),
    markJobRunning: vi.fn().mockResolvedValue(undefined),
    markJobFinished: vi.fn().mockResolvedValue(undefined),
    loadCredential: vi.fn().mockResolvedValue({
      id: "c1",
      tenantId: "t1",
      username: "u",
      password: "p",
      status: "VALID",
    }),
    listStores: vi.fn().mockResolvedValue(stores),
    login: vi.fn().mockImplementation(async () => {
      calls.login += 1;
      return { ok: true as const, session: "sess-1" };
    }),
    logout: vi.fn().mockImplementation(async () => {
      calls.logout += 1;
    }),
    fetchSalesLista: vi.fn().mockImplementation(async (p: { storeId: string }) => {
      calls.fetch.push(p.storeId);
      return [];
    }),
    upsertDayAggs: vi.fn().mockResolvedValue(undefined),
    upsertHourAggs: vi.fn().mockResolvedValue(undefined),
    insertSyncRun: vi.fn().mockResolvedValue(undefined),
    updateCredential: vi.fn().mockResolvedValue(undefined),
    now: () => new Date("2026-09-19T15:00:00.000Z"),
    ...overrides,
  };
  return deps;
}

describe("runSyncJob", () => {
  it("refuses to start when another RUNNING job holds the credential", async () => {
    const deps = makeDeps({
      hasRunningForCredential: vi.fn().mockResolvedValue(true),
    });
    const result = await runSyncJob(baseJob(), deps);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("locked");
    expect(deps.calls.login).toBe(0);
    expect(deps.markJobRunning).not.toHaveBeenCalled();
  });

  it("marks job failed on busy login and does not leave a session", async () => {
    const deps = makeDeps({
      login: vi.fn().mockResolvedValue({ ok: false, reason: "busy", raw: "max sessions" }),
    });
    const result = await runSyncJob(baseJob(), deps);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("busy");
    expect(deps.markJobFinished).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILED" }),
    );
    expect(deps.calls.logout).toBe(0);
    expect(deps.insertSyncRun).toHaveBeenCalledWith(
      expect.objectContaining({ ok: false }),
    );
  });

  it("sets credential INVALID on password failure", async () => {
    const deps = makeDeps({
      login: vi.fn().mockResolvedValue({ ok: false, reason: "password", raw: "senha inválida" }),
    });
    const result = await runSyncJob(baseJob(), deps);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("password");
    expect(deps.updateCredential).toHaveBeenCalledWith(
      expect.objectContaining({ status: "INVALID" }),
    );
  });

  it("always logout in finally after a successful login even if upsert throws", async () => {
    const deps = makeDeps({
      upsertDayAggs: vi.fn().mockRejectedValue(new Error("db down")),
    });
    const result = await runSyncJob(baseJob(), deps);
    expect(result.ok).toBe(false);
    expect(deps.calls.logout).toBe(1);
    expect(deps.markJobFinished).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILED" }),
    );
  });

  it("processes stores sequentially and updates watermark on light success", async () => {
    const deps = makeDeps();
    const result = await runSyncJob(baseJob({ kind: "LIGHT" }), deps);
    expect(result.ok).toBe(true);
    expect(deps.calls.fetch).toEqual(["s1", "s2"]);
    expect(deps.calls.logout).toBe(1);
    expect(deps.updateCredential).toHaveBeenCalledWith(
      expect.objectContaining({ lastLightSyncAt: expect.any(Date) }),
    );
    expect(deps.markJobFinished).toHaveBeenCalledWith(
      expect.objectContaining({ status: "SUCCEEDED" }),
    );
  });
});
