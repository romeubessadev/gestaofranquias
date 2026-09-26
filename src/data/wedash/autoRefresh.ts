/**
 * Atualização automática: regras puras (worker + front).
 * - Rodadas a cada 30 min só nas lojas abertas (horário + fuso da loja; sem horário = 10h–22h).
 * - Última rodada = fechamento + 30 min → fecha o dia (`store.last_closed_day`).
 * - Toda rodada ok fecha antes os dias pendentes (até o dia 1 do mês anterior).
 */

/** Intervalo fixo entre rodadas (sem opção na UI). */
export const AUTO_REFRESH_MIN = 30;
/** Minutos depois do fechamento da última rodada (notas processadas com atraso). */
export const CLOSE_GRACE_MIN = 30;
/** Rodada de fechamento que falhou tenta de novo a cada X min até a meia-noite. */
export const CLOSE_RETRY_MIN = 10;
/** Dias pendentes fechados por rodada (o resto fica para as próximas / madrugada). */
export const RECOVERY_DAYS_PER_ROUND = 3;
/** Marca no `sync_job.error` da rodada pulada por sessão caída → a próxima pode fazer login. */
export const AUTO_SESSION_MARK = "[auto-sessao]";
export type DayHours = { open: string; close: string } | null;
export type WeekHours = Record<number, DayHours>;

const DEFAULT_DAY = { open: "10:00", close: "22:00" };

/**
 * `store.hours` → semana; ausente/inválido = 10h–22h todos os dias. Dia null = fechado.
 * Todos os dias fechados = horário não configurado (padrão da loja nova): nunca "aberta" →
 * sem atualização automática (só o botão Atualizar); o D-1 fecha no job da madrugada (CLOSE).
 */
export function parseStoreHours(raw: unknown): WeekHours {
  const out: WeekHours = {};
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  for (let d = 0; d <= 6; d++) {
    const key = String(d);
    if (!o || !(key in o)) {
      out[d] = { ...DEFAULT_DAY };
      continue;
    }
    const v = o[key];
    if (v == null) {
      out[d] = null;
      continue;
    }
    const row = v as Record<string, unknown>;
    const open = typeof row.open === "string" ? row.open : null;
    const close = typeof row.close === "string" ? row.close : null;
    out[d] = open && close ? { open, close } : { ...DEFAULT_DAY };
  }
  return out;
}

function hhmmToMin(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Dia (YYYY-MM-DD), dia da semana (0=dom) e minuto do dia no fuso. */
export function localClock(date: Date, timeZone: string): { day: string; dow: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    dow: Math.max(0, dows.indexOf(get("weekday"))),
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

/** Expediente do dia em minutos; fechamento ≤ abertura (ex.: 00:00) = até a meia-noite. */
function dayWindow(day: DayHours): { openMin: number; closeMin: number } | null {
  if (!day) return null;
  const openMin = hhmmToMin(day.open);
  let closeMin = hhmmToMin(day.close);
  if (closeMin <= openMin) closeMin = 24 * 60;
  return { openMin, closeMin };
}

/**
 * Fase da loja agora:
 * - `open`: dentro do expediente (rodadas no intervalo);
 * - `wrapup`: fechou há menos de 30 min (espera a rodada de fechamento);
 * - `closeDue`: fechou há 30 min ou mais (rodada de fechamento, se o dia ainda não fechou);
 * - `before`: ainda não abriu; `closed`: não abre hoje.
 */
export type StorePhase = "open" | "wrapup" | "closeDue" | "before" | "closed";

export function storePhase(hours: WeekHours, now: Date, timeZone: string): StorePhase {
  const clock = localClock(now, timeZone);
  const w = dayWindow(hours[clock.dow] ?? null);
  if (!w) return "closed";
  if (clock.minutes < w.openMin) return "before";
  if (clock.minutes < w.closeMin) return "open";
  if (clock.minutes < w.closeMin + CLOSE_GRACE_MIN) return "wrapup";
  return "closeDue";
}

/** Minutos até a loja abrir hoje (fase `before`); null nas outras fases. */
export function minutesUntilOpen(hours: WeekHours, now: Date, timeZone: string): number | null {
  const clock = localClock(now, timeZone);
  const w = dayWindow(hours[clock.dow] ?? null);
  if (!w || clock.minutes >= w.openMin) return null;
  return w.openMin - clock.minutes;
}

export function addDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Chão da recuperação de dias: dia 1 do mês anterior. */
export function recoveryFloor(todayIso: string): string {
  const [y, m] = todayIso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 2, 1)).toISOString().slice(0, 10);
}

/**
 * Dias pendentes da loja (depois do último fechado, antes de hoje), do mais antigo ao mais novo.
 * Sem último dia fechado ainda = nada pendente (a carga do histórico / madrugada cria a base).
 */
export function pendingDays(
  lastClosedDay: string | null | undefined,
  todayIso: string,
  max = RECOVERY_DAYS_PER_ROUND,
): string[] {
  if (!lastClosedDay) return [];
  const floor = recoveryFloor(todayIso);
  let day = addDays(lastClosedDay, 1);
  if (day < floor) day = floor;
  const out: string[] = [];
  while (day < todayIso && out.length < max) {
    out.push(day);
    day = addDays(day, 1);
  }
  return out;
}

export type AutoStore = {
  id: string;
  timezone: string;
  hours: WeekHours;
  lastClosedDay: string | null;
};

export type AutoRoundPlan = {
  storeIds: string[];
  closeStoreIds: string[];
};

/**
 * Rodada automática devida agora? Todas as lojas abertas, `intervalMin` depois da última rodada
 * automática (Atualizar manual não conta). Rodada perdida (integração desconectada, worker parado)
 * = última rodada ficou para trás → roda assim que voltar. Lojas no fechamento + 30 min que ainda
 * não fecharam o dia entram assim que der (nova tentativa a cada 10 min se falhar).
 */
export function planAutoRound(args: {
  stores: AutoStore[];
  now: Date;
  intervalMin: number;
  lastAutoAt: Date | null;
}): AutoRoundPlan | null {
  const { stores, now, intervalMin } = args;
  const sinceMin = (d: Date | null) => (d ? (now.getTime() - d.getTime()) / 60_000 : Infinity);
  const openIds: string[] = [];
  const closeIds: string[] = [];
  for (const s of stores) {
    const phase = storePhase(s.hours, now, s.timezone);
    if (phase === "open") openIds.push(s.id);
    else if (phase === "closeDue") {
      const today = localClock(now, s.timezone).day;
      if (!s.lastClosedDay || s.lastClosedDay < today) closeIds.push(s.id);
    }
  }
  const openDue = openIds.length > 0 && sinceMin(args.lastAutoAt) >= intervalMin;
  const closeDue = closeIds.length > 0 && sinceMin(args.lastAutoAt) >= CLOSE_RETRY_MIN;
  if (!openDue && !closeDue) return null;
  return {
    storeIds: [...(openDue ? openIds : []), ...closeIds],
    closeStoreIds: closeIds,
  };
}

/** Instante de hoje (fuso da loja) no minuto `minutes` do dia. */
function todayAtMinute(now: Date, timeZone: string, minutes: number): Date {
  return new Date(now.getTime() + (minutes - localClock(now, timeZone).minutes) * 60_000);
}

function todayWindow(s: Pick<AutoStore, "hours" | "timezone">, now: Date) {
  return dayWindow(s.hours[localClock(now, s.timezone).dow] ?? null);
}

/**
 * Próxima rodada automática para as lojas do escopo (tooltip do Atualizar). Loja aberta → última
 * rodada automática + intervalo (ou a rodada de fechamento, se cair depois do fechamento); fechou
 * há < 30 min → rodada de fechamento. Nenhuma loja nesses casos = null.
 */
export function nextAutoRefreshAt(args: {
  stores: Array<Pick<AutoStore, "hours" | "timezone">>;
  now: Date;
  intervalMin: number;
  lastAutoAt: Date | null;
}): Date | null {
  const { stores, now } = args;
  const due = args.lastAutoAt ? new Date(args.lastAutoAt.getTime() + args.intervalMin * 60_000) : now;
  const next = due < now ? now : due;
  const candidates: Date[] = [];
  for (const s of stores) {
    const w = todayWindow(s, now);
    if (!w) continue;
    const phase = storePhase(s.hours, now, s.timezone);
    const closeAt = todayAtMinute(now, s.timezone, w.closeMin);
    const closeRound = new Date(closeAt.getTime() + CLOSE_GRACE_MIN * 60_000);
    if (phase === "open") {
      candidates.push(next >= closeAt ? closeRound : next);
    } else if (phase === "wrapup") {
      candidates.push(closeRound);
    }
  }
  return candidates.length > 0 ? candidates.reduce((a, b) => (b < a ? b : a)) : null;
}
