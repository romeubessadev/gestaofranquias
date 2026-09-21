import { aggregateSales } from "../../../src/data/wedash/salesAggregate.ts";
import type { SalesDayAgg, SalesHourAgg } from "../../../src/data/wedash/salesTypes.ts";
import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";
import type { FetchSalesListaParams } from "./millenniumSales.ts";

export type SyncJobKind = "BACKFILL" | "LIGHT" | "FORCE_LIGHT";

export type SyncJob = {
  id: string;
  tenantId: string;
  credentialId: string;
  kind: SyncJobKind;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
};

export type SyncCredential = {
  id: string;
  tenantId: string;
  username: string;
  password: string;
  status: "VALID" | "INVALID" | "NOT_CONFIGURED";
};

export type SyncStore = {
  id: string;
  millenniumStoreId: number;
  timezone: string;
};

export type LoginResult =
  | { ok: true; session: string }
  | { ok: false; reason: "busy" | "password" | "other"; raw: string };

export type SyncJobDeps = {
  hasRunningForCredential: (credentialId: string) => Promise<boolean>;
  markJobRunning: (jobId: string) => Promise<void>;
  markJobFinished: (args: {
    jobId: string;
    status: "SUCCEEDED" | "FAILED";
    error?: string;
  }) => Promise<void>;
  loadCredential: (credentialId: string) => Promise<SyncCredential>;
  listStores: (tenantId: string) => Promise<SyncStore[]>;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: (session: string) => Promise<void>;
  fetchSalesLista: (params: FetchSalesListaParams) => Promise<SaleRow[]>;
  upsertDayAggs: (rows: SalesDayAgg[]) => Promise<void>;
  upsertHourAggs: (rows: SalesHourAgg[]) => Promise<void>;
  insertSyncRun: (args: {
    tenantId: string;
    credentialId: string;
    kind: SyncJobKind;
    ok: boolean;
    storesDone: number;
    error?: string;
    startedAt: Date;
    finishedAt: Date;
  }) => Promise<void>;
  updateCredential: (args: {
    credentialId: string;
    status?: SyncCredential["status"];
    lastError?: string;
    lastErrorAt?: Date;
    lastSuccessAt?: Date;
    lastLightSyncAt?: Date;
  }) => Promise<void>;
  now: () => Date;
};

export type RunSyncResult =
  | { ok: true; storesDone: number }
  | { ok: false; reason: "locked" | "busy" | "password" | "other"; error?: string };

function ymdInTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDaysIso(isoDay: string, delta: number): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return utc.toISOString().slice(0, 10);
}

function windowFor(kind: SyncJobKind, now: Date, timeZone: string): { from: string; to: string } {
  const today = ymdInTz(now, timeZone);
  if (kind === "BACKFILL") {
    return { from: addDaysIso(today, -90), to: addDaysIso(today, -1) };
  }
  return { from: today, to: today };
}

/**
 * Claim already happened; runner enforces one RUNNING per credential,
 * sequential stores, always logout after login, busy/password classification.
 */
export async function runSyncJob(job: SyncJob, deps: SyncJobDeps): Promise<RunSyncResult> {
  if (await deps.hasRunningForCredential(job.credentialId)) {
    return { ok: false, reason: "locked" };
  }

  await deps.markJobRunning(job.id);
  const startedAt = deps.now();
  let session: string | null = null;
  let storesDone = 0;

  try {
    const cred = await deps.loadCredential(job.credentialId);
    const login = await deps.login(cred.username, cred.password);
    if (!login.ok) {
      const reason = login.reason;
      if (reason === "password") {
        await deps.updateCredential({
          credentialId: cred.id,
          status: "INVALID",
          lastError: login.raw,
          lastErrorAt: deps.now(),
        });
      } else {
        await deps.updateCredential({
          credentialId: cred.id,
          lastError: login.raw,
          lastErrorAt: deps.now(),
        });
      }
      await deps.markJobFinished({
        jobId: job.id,
        status: "FAILED",
        error: login.raw,
      });
      await deps.insertSyncRun({
        tenantId: job.tenantId,
        credentialId: job.credentialId,
        kind: job.kind,
        ok: false,
        storesDone: 0,
        error: login.raw,
        startedAt,
        finishedAt: deps.now(),
      });
      return { ok: false, reason: reason === "other" ? "other" : reason };
    }

    session = login.session;
    const storeList = await deps.listStores(job.tenantId);
    const now = deps.now();

    for (const store of storeList) {
      const { from, to } = windowFor(job.kind, now, store.timezone);
      const rows = await deps.fetchSalesLista({
        session,
        storeId: store.id,
        millenniumStoreId: store.millenniumStoreId,
        from,
        to,
      });
      const agg = aggregateSales(rows, {
        tenantId: job.tenantId,
        timeZone: store.timezone,
        now,
      });
      await deps.upsertDayAggs(agg.days);
      await deps.upsertHourAggs(agg.hours);
      storesDone += 1;
    }

    const finishedAt = deps.now();
    const lightKind = job.kind === "LIGHT" || job.kind === "FORCE_LIGHT";
    await deps.updateCredential({
      credentialId: job.credentialId,
      lastSuccessAt: finishedAt,
      ...(lightKind ? { lastLightSyncAt: finishedAt } : {}),
    });
    await deps.markJobFinished({ jobId: job.id, status: "SUCCEEDED" });
    await deps.insertSyncRun({
      tenantId: job.tenantId,
      credentialId: job.credentialId,
      kind: job.kind,
      ok: true,
      storesDone,
      startedAt,
      finishedAt,
    });
    return { ok: true, storesDone };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await deps.updateCredential({
      credentialId: job.credentialId,
      lastError: msg,
      lastErrorAt: deps.now(),
    });
    await deps.markJobFinished({ jobId: job.id, status: "FAILED", error: msg });
    await deps.insertSyncRun({
      tenantId: job.tenantId,
      credentialId: job.credentialId,
      kind: job.kind,
      ok: false,
      storesDone,
      error: msg,
      startedAt,
      finishedAt: deps.now(),
    });
    return { ok: false, reason: "other", error: msg };
  } finally {
    if (session) {
      await deps.logout(session);
    }
  }
}
