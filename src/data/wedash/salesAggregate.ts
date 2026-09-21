import type {
  AggregateSalesResult,
  SaleRow,
  SalesBrand,
  SalesDayAgg,
  SalesHourAgg,
} from "./salesTypes";

export type AggregateSalesOptions = {
  tenantId: string;
  timeZone: string;
  /** Clock for “today” hour filtering (injectable in tests). */
  now?: Date;
};

type DayKey = string;
type HourKey = string;

type DayBucket = {
  storeId: string;
  day: string;
  brand: SalesBrand;
  revenueCents: number;
  itemCount: number;
  ops: Set<string>;
};

type HourBucket = DayBucket & { hour: number };

function localDayHour(date: Date, timeZone: string): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;

  return { day: `${year}-${month}-${day}`, hour };
}

function dayKey(storeId: string, day: string, brand: SalesBrand): DayKey {
  return `${storeId}|${day}|${brand}`;
}

function hourKey(storeId: string, day: string, hour: number, brand: SalesBrand): HourKey {
  return `${storeId}|${day}|${hour}|${brand}`;
}

/**
 * Pure aggregator: SaleRow[] → day/hour aggs.
 * Buckets by store-local DATA_H (occurredAt); sales_count = distinct operationCode.
 * Hour buckets only for the current local calendar day.
 */
export function aggregateSales(
  rows: SaleRow[],
  opts: AggregateSalesOptions,
): AggregateSalesResult {
  const now = opts.now ?? new Date();
  const todayLocal = localDayHour(now, opts.timeZone).day;

  const daysMap = new Map<DayKey, DayBucket>();
  const hoursMap = new Map<HourKey, HourBucket>();

  for (const row of rows) {
    const brand: SalesBrand = row.brand ?? "ALL";
    const { day, hour } = localDayHour(row.occurredAt, opts.timeZone);

    const dk = dayKey(row.storeId, day, brand);
    let dayBucket = daysMap.get(dk);
    if (!dayBucket) {
      dayBucket = {
        storeId: row.storeId,
        day,
        brand,
        revenueCents: 0,
        itemCount: 0,
        ops: new Set(),
      };
      daysMap.set(dk, dayBucket);
    }
    dayBucket.revenueCents += row.revenueCents;
    dayBucket.itemCount += row.itemQty;
    dayBucket.ops.add(row.operationCode);

    if (day === todayLocal) {
      const hk = hourKey(row.storeId, day, hour, brand);
      let hourBucket = hoursMap.get(hk);
      if (!hourBucket) {
        hourBucket = {
          storeId: row.storeId,
          day,
          hour,
          brand,
          revenueCents: 0,
          itemCount: 0,
          ops: new Set(),
        };
        hoursMap.set(hk, hourBucket);
      }
      hourBucket.revenueCents += row.revenueCents;
      hourBucket.itemCount += row.itemQty;
      hourBucket.ops.add(row.operationCode);
    }
  }

  const days: SalesDayAgg[] = [...daysMap.values()]
    .map((b) => ({
      tenantId: opts.tenantId,
      storeId: b.storeId,
      day: b.day,
      brand: b.brand,
      revenueCents: b.revenueCents,
      salesCount: b.ops.size,
      itemCount: b.itemCount,
    }))
    .sort((a, b) => a.day.localeCompare(b.day) || a.storeId.localeCompare(b.storeId));

  const hours: SalesHourAgg[] = [...hoursMap.values()]
    .map((b) => ({
      tenantId: opts.tenantId,
      storeId: b.storeId,
      day: b.day,
      hour: b.hour,
      brand: b.brand,
      revenueCents: b.revenueCents,
      salesCount: b.ops.size,
      itemCount: b.itemCount,
    }))
    .sort(
      (a, b) =>
        a.day.localeCompare(b.day) ||
        a.hour - b.hour ||
        a.storeId.localeCompare(b.storeId),
    );

  return { days, hours };
}
