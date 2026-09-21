/** Pure helpers for Overview sync watermark / force UI (testable without React). */

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

/** Client-side mirror of Edge 5-min FORCE_LIGHT window. */
export function forceRefreshRetryAfterSec(
  lastForceAt: Date | null,
  now: Date = new Date(),
  windowMs = 5 * 60 * 1000,
): number | null {
  if (!lastForceAt) return null;
  const elapsed = now.getTime() - lastForceAt.getTime();
  if (elapsed >= windowMs) return null;
  return Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
}
