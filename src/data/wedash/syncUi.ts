/** Pure helpers for Overview sync watermark / force UI (testable without React). */

export const FORCE_COOLDOWN_MS = 5 * 60 * 1000;

/** Sentinel key: FORCE em "Todas as lojas" (rede). */
export const FORCE_ALL_KEY = "__all__";

export type ForceAtMap = Record<string, string>;

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

/** Client-side mirror of Edge 5-min FORCE window for one timestamp. */
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

/**
 * Cooldown do botão Atualizar conforme loja(s) do StorePicker.
 * - 1 loja: bloqueia se essa loja OU um FORCE "Todas" recente.
 * - Todas ([]): bloqueia se QUALQUER FORCE recente (loja ou rede) — opção A.
 */
export function forceCooldownForScopeSec(
  map: ForceAtMap,
  storeIds: string[],
  now: Date = new Date(),
  windowMs = FORCE_COOLDOWN_MS,
): number | null {
  const parse = (iso: string | undefined): Date | null => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  let worst: number | null = null;
  const consider = (at: Date | null) => {
    const sec = forceRefreshRetryAfterSec(at, now, windowMs);
    if (sec == null) return;
    if (worst == null || sec > worst) worst = sec;
  };

  if (storeIds.length === 0) {
    // Opção A: qualquer FORCE recente bloqueia "Todas".
    for (const iso of Object.values(map)) consider(parse(iso));
    return worst;
  }

  consider(parse(map[FORCE_ALL_KEY]));
  for (const id of storeIds) consider(parse(map[id]));
  return worst;
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

export function forceAtMapStorageKey(tenantId: string): string {
  return `wedash.forceMap.${tenantId}`;
}

/** @deprecated legacy single-key — migrado em readForceAtMap */
export function forceLastAtStorageKey(tenantId: string): string {
  return `wedash.forceAt.${tenantId}`;
}

export function readForceAtMap(tenantId: string): ForceAtMap {
  try {
    const raw = localStorage.getItem(forceAtMapStorageKey(tenantId));
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const out: ForceAtMap = {};
        for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof v === "string") out[k] = v;
        }
        return out;
      }
    }
    // Migra chave legada (cooldown tenant-wide) → __all__
    const legacy = localStorage.getItem(forceLastAtStorageKey(tenantId));
    if (legacy) {
      const d = new Date(legacy);
      if (!Number.isNaN(d.getTime())) {
        const map = { [FORCE_ALL_KEY]: d.toISOString() };
        writeForceAtMap(tenantId, map);
        return map;
      }
    }
  } catch {
    /* private mode / quota */
  }
  return {};
}

export function writeForceAtMap(tenantId: string, map: ForceAtMap): void {
  try {
    localStorage.setItem(forceAtMapStorageKey(tenantId), JSON.stringify(map));
  } catch {
    /* private mode / quota */
  }
}

/** Registra FORCE bem-sucedido no mapa local (por loja ou rede). */
export function recordForceAt(
  tenantId: string,
  storeIds: string[],
  at: Date = new Date(),
): ForceAtMap {
  const map = { ...readForceAtMap(tenantId) };
  const iso = at.toISOString();
  if (storeIds.length === 0) {
    map[FORCE_ALL_KEY] = iso;
  } else {
    for (const id of storeIds) map[id] = iso;
  }
  writeForceAtMap(tenantId, map);
  return map;
}

/** Compat: último FORCE "global" (só __all__ / legado). */
export function readForceLastAt(tenantId: string): Date | null {
  const map = readForceAtMap(tenantId);
  const raw = map[FORCE_ALL_KEY];
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function writeForceLastAt(tenantId: string, at: Date = new Date()): void {
  recordForceAt(tenantId, [], at);
}
