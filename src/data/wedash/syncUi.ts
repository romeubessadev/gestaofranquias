/** Pure helpers for Overview sync watermark / force UI (testable without React). */

export const FORCE_COOLDOWN_MS = 5 * 60 * 1000;

export function formatSyncWatermarkLabel(
  watermark: Date | null,
  opts: { loading?: boolean; now?: Date } = {},
): string {
  const now = opts.now ?? new Date();
  if (watermark == null) {
    return opts.loading ? "Sincronizando dados…" : "Aguardando primeiro sync";
  }
  const minutosAtras = Math.floor((now.getTime() - watermark.getTime()) / 60000);
  if (minutosAtras < 1) return "Atualizado agora";
  return `Atualizado há ${minutosAtras} min`;
}

export function canForceSyncRefresh(role: string): boolean {
  return role === "OWNER" || role === "MANAGER";
}

/** Client-side mirror of Edge 5-min FORCE window. */
export function forceRefreshRetryAfterSec(
  lastForceAt: Date | null,
  now: Date = new Date(),
  windowMs = FORCE_COOLDOWN_MS,
): number | null {
  if (!lastForceAt) return null;
  const elapsed = now.getTime() - lastForceAt.getTime();
  if (elapsed >= windowMs) return null;
  return Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
}

/** Infer last FORCE time from Edge retryAfterSec (for hydrating UI after 429). */
export function lastForceAtFromRetryAfter(
  retryAfterSec: number,
  now: Date = new Date(),
  windowMs = FORCE_COOLDOWN_MS,
): Date {
  const clamped = Math.max(0, Math.min(windowMs / 1000, retryAfterSec));
  return new Date(now.getTime() - (windowMs - clamped * 1000));
}

export function formatForceCooldownLabel(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function forceLastAtStorageKey(tenantId: string): string {
  return `wedash.forceAt.${tenantId}`;
}

export function readForceLastAt(tenantId: string): Date | null {
  try {
    const raw = localStorage.getItem(forceLastAtStorageKey(tenantId));
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function writeForceLastAt(tenantId: string, at: Date = new Date()): void {
  try {
    localStorage.setItem(forceLastAtStorageKey(tenantId), at.toISOString());
  } catch {
    /* private mode / quota */
  }
}
