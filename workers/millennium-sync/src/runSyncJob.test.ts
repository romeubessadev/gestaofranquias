import { describe, expect, it, vi } from "vitest";
import {
  chunkByCalendarMonths,
  collapseDaysToWindows,
  daysNeedingHeavySync,
  historyFloor,
  isContentionError,
  missingDays,
  nextFallbackMaxDays,
  nextHistoryWindow,
  runSyncJob,
  seedWindow,
  splitFailedWindow,
  storeFetchConcurrency,
  type SyncJob,
  type SyncJobDeps,
  type SyncStore,
} from "./runSyncJob";

const stores: SyncStore[] = [
  {
    id: "s1",
    millenniumStoreId: 1,
    code: "00010",
    timezone: "America/Campo_Grande",
  },
  {
    id: "s2",
    millenniumStoreId: 2,
    code: "00114",
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
    payload: {},
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
    listExistingDays: vi.fn().mockResolvedValue([]),
    listDaysWithCmv: vi.fn().mockResolvedValue([]),
    listDaysWithCategory: vi.fn().mockResolvedValue([]),
    listDaysPaymentComplete: vi.fn().mockResolvedValue([]),
    earliestSalesDay: vi.fn().mockResolvedValue(null),
    login: vi.fn().mockImplementation(async () => {
      calls.login += 1;
      return { ok: true as const, session: "sess-1" };
    }),
    logout: vi.fn().mockImplementation(async () => {
      calls.logout += 1;
    }),
    resolveEventoIds: vi.fn().mockResolvedValue([17, 24, 22, 107]),
    fetchSalesLista: vi.fn().mockImplementation(async (p: { storeId: string; eventoIds: number[]; millenniumStoreId?: number | null }) => {
      calls.fetch.push(
        p.millenniumStoreId == null ? `ALL:${p.storeId || "-"}` : p.storeId,
      );
      expect(p.eventoIds.length).toBeGreaterThan(0);
      return [];
    }),
    fetchFilialGeradorMap: vi.fn().mockResolvedValue(new Map([["00010", 126], ["00114", 41562]])),
    fetchProductBrandMap: vi.fn().mockResolvedValue({
      map: new Map(),
      geradorIdsWithWpink: new Set(),
    }),
    fetchBrandRevenueReport: vi.fn().mockResolvedValue([]),
    fetchConsultaDetMov: vi.fn().mockResolvedValue([]),
    fetchRelatorioMargem: vi.fn().mockResolvedValue([]),
    fetchProductTipos: vi.fn().mockResolvedValue([]),
    fetchCategorySalesReport: vi.fn().mockResolvedValue([]),
    upsertDayAggs: vi.fn().mockResolvedValue(undefined),
    patchDayCmv: vi.fn().mockResolvedValue(undefined),
    upsertCategoryDayAggs: vi.fn().mockResolvedValue(undefined),
    replacePaymentDayAggs: vi.fn().mockResolvedValue(undefined),
    upsertHourAggs: vi.fn().mockResolvedValue(undefined),
    setStoresHasWpink: vi.fn().mockResolvedValue(undefined),
    insertSyncRun: vi.fn().mockResolvedValue(undefined),
    updateCredential: vi.fn().mockResolvedValue(undefined),
    getStoredSession: vi.fn().mockResolvedValue(null),
    setStoredSession: vi.fn().mockResolvedValue(undefined),
    enqueueHistoryFollowUp: vi.fn().mockResolvedValue(false),
    now: () => new Date("2026-09-19T15:00:00.000Z"),
    ...overrides,
  };
  return deps;
}

describe("seedWindow / missingDays / history", () => {
  it("SEED window is previous month start → today", () => {
    expect(seedWindow("2026-09-19")).toEqual({ from: "2026-08-01", to: "2026-09-19" });
    expect(seedWindow("2026-01-05")).toEqual({ from: "2025-12-01", to: "2026-01-05" });
  });

  it("splitFailedWindow ladder: >15 → 15d, >7 → 7d, else 1d", () => {
    expect(nextFallbackMaxDays("2026-08-01", "2026-08-31")).toBe(15);
    expect(splitFailedWindow("2026-08-01", "2026-08-31")).toEqual([
      { from: "2026-08-01", to: "2026-08-15" },
      { from: "2026-08-16", to: "2026-08-30" },
      { from: "2026-08-31", to: "2026-08-31" },
    ]);
    expect(nextFallbackMaxDays("2026-08-01", "2026-08-15")).toBe(7);
    expect(splitFailedWindow("2026-08-01", "2026-08-07")).toEqual([
      { from: "2026-08-01", to: "2026-08-01" },
      { from: "2026-08-02", to: "2026-08-02" },
      { from: "2026-08-03", to: "2026-08-03" },
      { from: "2026-08-04", to: "2026-08-04" },
      { from: "2026-08-05", to: "2026-08-05" },
      { from: "2026-08-06", to: "2026-08-06" },
      { from: "2026-08-07", to: "2026-08-07" },
    ]);
    expect(nextFallbackMaxDays("2026-08-01", "2026-08-01")).toBeNull();
    expect(splitFailedWindow("2026-08-01", "2026-08-01")).toEqual([]);
  });

  it("historyFloor is max(opened_at, today−24m)", () => {
    expect(historyFloor("2026-09-21", null)).toBe("2024-09-21");
    expect(historyFloor("2026-09-21", "2025-03-01")).toBe("2025-03-01");
    expect(historyFloor("2026-09-21", "2020-01-01")).toBe("2024-09-21");
  });

  it("nextHistoryWindow walks one calendar month back, clamped to floor", () => {
    expect(
      nextHistoryWindow({
        today: "2026-09-21",
        openedAt: null,
        earliestExisting: "2026-08-01",
        seedFrom: "2026-08-01",
      }),
    ).toEqual({ from: "2026-07-01", to: "2026-07-31" });

    expect(
      nextHistoryWindow({
        today: "2026-09-21",
        openedAt: "2026-07-15",
        earliestExisting: "2026-08-01",
        seedFrom: "2026-08-01",
      }),
    ).toEqual({ from: "2026-07-15", to: "2026-07-31" });

    expect(
      nextHistoryWindow({
        today: "2026-09-21",
        openedAt: "2026-08-01",
        earliestExisting: "2026-08-01",
        seedFrom: "2026-08-01",
      }),
    ).toBeNull();
  });

  it("chunkByCalendarMonths splits Aug→Sep mid-month", () => {
    expect(chunkByCalendarMonths("2026-08-01", "2026-09-19")).toEqual([
      { from: "2026-08-01", to: "2026-08-31" },
      { from: "2026-09-01", to: "2026-09-19" },
    ]);
  });

  it("FORCE always includes today even when already present", () => {
    const days = missingDays("2026-09-01", "2026-09-10", ["2026-09-01", "2026-09-19"], {
      today: "2026-09-19",
      alwaysToday: true,
    });
    expect(days).toContain("2026-09-19");
    expect(days).toContain("2026-09-02");
    expect(days).not.toContain("2026-09-01");
  });

  it("FORCE CMV = buracos + hoje; categorias = só buracos (sem alwaysToday)", async () => {
    const deps = {
      listDaysWithCmv: vi.fn().mockResolvedValue(["2026-09-01", "2026-09-02", "2026-09-03"]),
      listDaysWithCategory: vi.fn().mockResolvedValue(["2026-09-01", "2026-09-02"]),
    };
    const cmv = await daysNeedingHeavySync(deps, {
      kind: "FORCE",
      tenantId: "t1",
      storeId: "s1",
      from: "2026-09-01",
      to: "2026-09-05",
      today: "2026-09-19",
      which: "cmv",
    });
    expect(cmv).toEqual(["2026-09-04", "2026-09-05", "2026-09-19"]);
    const cat = await daysNeedingHeavySync(deps, {
      kind: "FORCE",
      tenantId: "t1",
      storeId: "s1",
      from: "2026-09-01",
      to: "2026-09-05",
      today: "2026-09-19",
      which: "category",
    });
    // Sem alwaysToday: não inclui 09-19 se já não é buraco do range.
    expect(cat).toEqual(["2026-09-03", "2026-09-04", "2026-09-05"]);
  });

  it("RANGE only returns gaps", () => {
    const days = missingDays("2026-09-01", "2026-09-05", ["2026-09-02", "2026-09-03"], {
      today: "2026-09-19",
      alwaysToday: false,
    });
    expect(days).toEqual(["2026-09-01", "2026-09-04", "2026-09-05"]);
  });

  it("collapseDaysToWindows merges contiguous days", () => {
    expect(collapseDaysToWindows(["2026-09-01", "2026-09-02", "2026-09-05"])).toEqual([
      { from: "2026-09-01", to: "2026-09-02" },
      { from: "2026-09-05", to: "2026-09-05" },
    ]);
  });
});

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
    // Contenção ≠ falha: job permanece QUEUED (processOneJob para o burst).
    expect(deps.markJobFinished).not.toHaveBeenCalled();
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

  it("keeps tenant session after job (no logout) even if upsert throws", async () => {
    const deps = makeDeps({
      upsertDayAggs: vi.fn().mockRejectedValue(new Error("db down")),
    });
    const result = await runSyncJob(baseJob(), deps);
    expect(result.ok).toBe(false);
    expect(deps.calls.logout).toBe(0);
    expect(deps.setStoredSession).toHaveBeenCalledWith("c1", "sess-1");
    expect(deps.markJobFinished).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILED" }),
    );
  });

  it("LIGHT fetches all stores in one Lista call (FILIAL null)", async () => {
    const deps = makeDeps();
    const result = await runSyncJob(baseJob({ kind: "LIGHT" }), deps);
    expect(result.ok).toBe(true);
    expect(deps.calls.fetch).toEqual(["ALL:-"]);
    expect(deps.calls.logout).toBe(0);
    expect(deps.setStoredSession).toHaveBeenCalledWith("c1", "sess-1");
    expect(deps.updateCredential).toHaveBeenCalledWith(
      expect.objectContaining({ lastLightSyncAt: expect.any(Date) }),
    );
    expect(deps.markJobFinished).toHaveBeenCalledWith(
      expect.objectContaining({ status: "SUCCEEDED" }),
    );
    expect(deps.upsertDayAggs).toHaveBeenCalled();
  });

  it("reuses stored tenant session without new login", async () => {
    const deps = makeDeps({
      getStoredSession: vi.fn().mockResolvedValue("sess-saved"),
    });
    const result = await runSyncJob(baseJob({ kind: "LIGHT" }), deps);
    expect(result.ok).toBe(true);
    expect(deps.calls.login).toBe(0);
    expect(deps.calls.logout).toBe(0);
  });

  it("SEED uses calendar months (not day-by-day)", async () => {
    const windows: Array<{ from: string; to: string; storeId: string }> = [];
    const deps = makeDeps({
      fetchSalesLista: vi.fn().mockImplementation(async (p: { storeId: string; from: string; to: string }) => {
        windows.push({ storeId: p.storeId, from: p.from, to: p.to });
        // Devolve 1 linha pra não cair no fallback dia a dia.
        return [
          {
            storeId: p.storeId,
            occurredAt: new Date(`${p.from}T15:00:00.000Z`),
            operationCode: "op1",
            revenueCents: 100,
            itemCount: 1,
            brand: "ALL" as const,
          },
        ];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(baseJob({ kind: "SEED" }), deps);
    expect(result.ok).toBe(true);
    const s1 = windows.filter((w) => w.storeId === "s1");
    expect(s1).toEqual([
      { storeId: "s1", from: "2026-08-01", to: "2026-08-31" },
      { storeId: "s1", from: "2026-09-01", to: "2026-09-19" },
    ]);
    expect(deps.enqueueHistoryFollowUp).toHaveBeenCalled();
  });

  it("SEED falls back month → 15d when month range returns empty", async () => {
    const windows: Array<{ from: string; to: string }> = [];
    const deps = makeDeps({
      listStores: vi.fn().mockResolvedValue([stores[0]]),
      fetchSalesLista: vi.fn().mockImplementation(async (p: { from: string; to: string }) => {
        windows.push({ from: p.from, to: p.to });
        return [];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(baseJob({ kind: "SEED" }), deps);
    expect(result.ok).toBe(true);
    expect(windows[0]).toEqual({ from: "2026-08-01", to: "2026-08-31" });
    // Próximo degrau: 15 dias (unshift — processa o 1º pedaço antes dos outros).
    expect(windows[1]).toEqual({ from: "2026-08-01", to: "2026-08-15" });
    expect(windows.some((w) => w.from === "2026-08-16" && w.to === "2026-08-30")).toBe(true);
    expect(windows.some((w) => w.from === "2026-08-01" && w.to === "2026-08-07")).toBe(true);
  });

  it("HISTORY fetches previous calendar month then re-enqueues", async () => {
    const windows: Array<{ from: string; to: string }> = [];
    const deps = makeDeps({
      earliestSalesDay: vi.fn().mockResolvedValue("2026-08-01"),
      enqueueHistoryFollowUp: vi.fn().mockResolvedValue(true),
      fetchSalesLista: vi.fn().mockImplementation(async (p: { from: string; to: string }) => {
        windows.push({ from: p.from, to: p.to });
        return [
          {
            storeId: "s1",
            occurredAt: new Date(`${p.from}T15:00:00.000Z`),
            operationCode: "op1",
            revenueCents: 100,
            itemCount: 1,
            brand: "ALL" as const,
          },
        ];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(baseJob({ kind: "HISTORY" }), deps);
    expect(result.ok).toBe(true);
    expect(windows.some((w) => w.from === "2026-07-01" && w.to === "2026-07-31")).toBe(true);
    expect(deps.enqueueHistoryFollowUp).toHaveBeenCalled();
  });

  it("FORCE fetches gaps in period + always today", async () => {
    const windows: Array<{ from: string; to: string }> = [];
    const deps = makeDeps({
      listExistingDays: vi.fn().mockResolvedValue(["2026-09-01", "2026-09-02"]),
      // Formas já syncadas nesses dias — não rebusca 01/02.
      listDaysPaymentComplete: vi.fn().mockResolvedValue(["2026-09-01", "2026-09-02"]),
      fetchSalesLista: vi.fn().mockImplementation(async (p: { from: string; to: string }) => {
        windows.push({ from: p.from, to: p.to });
        return [];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(
      baseJob({ kind: "FORCE", payload: { from: "2026-09-01", to: "2026-09-05" } }),
      deps,
    );
    expect(result.ok).toBe(true);
    // gaps 03,04,05 + today 19 — agora 1 dia por janela
    expect(windows.some((w) => w.from === "2026-09-03" && w.to === "2026-09-03")).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-05" && w.to === "2026-09-05")).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-19" && w.to === "2026-09-19")).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-01")).toBe(false);
    expect(deps.updateCredential).toHaveBeenCalledWith(
      expect.objectContaining({ lastLightSyncAt: expect.any(Date) }),
    );
  });

  it("FORCE rebusca dia com venda mas sem forma de pagamento", async () => {
    const windows: Array<{ from: string; to: string }> = [];
    const deps = makeDeps({
      listExistingDays: vi.fn().mockResolvedValue(["2026-09-01", "2026-09-02", "2026-09-03"]),
      // Só 02 tem CONDICAO — 01 e 03 são buracos de forma.
      listDaysPaymentComplete: vi.fn().mockResolvedValue(["2026-09-02"]),
      fetchSalesLista: vi.fn().mockImplementation(async (p: { from: string; to: string }) => {
        windows.push({ from: p.from, to: p.to });
        return [];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(
      baseJob({ kind: "FORCE", payload: { from: "2026-09-01", to: "2026-09-03" } }),
      deps,
    );
    expect(result.ok).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-01" && w.to === "2026-09-01")).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-03" && w.to === "2026-09-03")).toBe(true);
    expect(windows.some((w) => w.from === "2026-09-02")).toBe(false);
    expect(windows.some((w) => w.from === "2026-09-19")).toBe(true);
  });

  it("FORCE_LIGHT without payload stays today-only (compat)", async () => {
    const windows: Array<{ from: string; to: string }> = [];
    const deps = makeDeps({
      fetchSalesLista: vi.fn().mockImplementation(async (p: { from: string; to: string }) => {
        windows.push({ from: p.from, to: p.to });
        return [];
      }),
      now: () => new Date("2026-09-19T15:00:00.000Z"),
    });
    const result = await runSyncJob(baseJob({ kind: "FORCE_LIGHT" }), deps);
    expect(result.ok).toBe(true);
    expect(windows[0]).toEqual({ from: "2026-09-19", to: "2026-09-19" });
  });
});

describe("storeFetchConcurrency", () => {
  it("defaults to all stores when STORE_CONCURRENCY unset", () => {
    const prev = process.env.STORE_CONCURRENCY;
    delete process.env.STORE_CONCURRENCY;
    expect(storeFetchConcurrency(3)).toBe(3);
    expect(storeFetchConcurrency(1)).toBe(1);
    if (prev === undefined) delete process.env.STORE_CONCURRENCY;
    else process.env.STORE_CONCURRENCY = prev;
  });

  it("honors positive STORE_CONCURRENCY capped by store count", () => {
    const prev = process.env.STORE_CONCURRENCY;
    process.env.STORE_CONCURRENCY = "2";
    expect(storeFetchConcurrency(3)).toBe(2);
    expect(storeFetchConcurrency(1)).toBe(1);
    if (prev === undefined) delete process.env.STORE_CONCURRENCY;
    else process.env.STORE_CONCURRENCY = prev;
  });

  it("treats 0 / invalid as all stores", () => {
    const prev = process.env.STORE_CONCURRENCY;
    process.env.STORE_CONCURRENCY = "0";
    expect(storeFetchConcurrency(3)).toBe(3);
    process.env.STORE_CONCURRENCY = "abc";
    expect(storeFetchConcurrency(2)).toBe(2);
    if (prev === undefined) delete process.env.STORE_CONCURRENCY;
    else process.env.STORE_CONCURRENCY = prev;
  });
});

describe("isContentionError", () => {
  it("detects busy / timeout / rate limit", () => {
    expect(isContentionError("Millennium busy")).toBe(true);
    expect(isContentionError("ETIMEDOUT")).toBe(true);
    expect(isContentionError("429 Too Many Requests")).toBe(true);
    expect(isContentionError("invalid password")).toBe(false);
  });
});
