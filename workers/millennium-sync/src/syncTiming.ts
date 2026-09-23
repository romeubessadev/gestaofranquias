/** Timing helpers for sync progress logs. */

export function nowMs(): number {
  return Date.now();
}

/** Ex.: 240ms · 1.4s · 23s */
export function formatElapsed(startedMs: number, endedMs = Date.now()): string {
  const ms = Math.max(0, Math.round(endedMs - startedMs));
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) {
    const s = ms / 1000;
    return s < 10 ? `${s.toFixed(1)}s` : `${Math.round(s)}s`;
  }
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m${String(s).padStart(2, "0")}s`;
}
