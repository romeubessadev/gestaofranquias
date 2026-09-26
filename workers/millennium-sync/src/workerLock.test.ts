import { describe, expect, it, afterEach } from "vitest";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import {
  WORKER_LOCK_PATH,
  acquireWorkerLock,
  releaseWorkerLock,
  describeWorkerLock,
} from "./workerLock.ts";

afterEach(() => {
  releaseWorkerLock();
  if (existsSync(WORKER_LOCK_PATH)) {
    try {
      unlinkSync(WORKER_LOCK_PATH);
    } catch {
      /* ignore */
    }
  }
});

describe("workerLock", () => {
  it("adquire e libera o lock", () => {
    acquireWorkerLock();
    expect(existsSync(WORKER_LOCK_PATH)).toBe(true);
    expect(describeWorkerLock()).toMatch(/ocupado pelo pid/);
    releaseWorkerLock();
    expect(existsSync(WORKER_LOCK_PATH)).toBe(false);
  });

  it("bloqueia segundo acquire enquanto outro pid está vivo", () => {
    const holder = process.ppid;
    writeFileSync(
      WORKER_LOCK_PATH,
      `pid=${holder}\nstarted_at=${new Date().toISOString()}\n`,
      "utf8",
    );
    expect(() => acquireWorkerLock()).toThrow(/Já existe um worker/);
  });

  it("herda lock órfão (pid morto)", () => {
    writeFileSync(WORKER_LOCK_PATH, "pid=99999999\nstarted_at=2000-01-01T00:00:00.000Z\n", "utf8");
    expect(describeWorkerLock()).toMatch(/órfão/);
    acquireWorkerLock();
    expect(describeWorkerLock()).toMatch(new RegExp(`pid ${process.pid}`));
  });
});
