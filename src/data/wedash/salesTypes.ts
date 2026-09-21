/** Shared sales row / aggregate types (EN). Money = integer cents. */

export type SalesBrand = "WEPINK" | "WPINK" | "ALL";

/** One VENDAS.Lista line (or collapsed operation) after Millennium map. */
export type SaleRow = {
  operationCode: string;
  /** Instant from DATA_H (never ERP DATA). */
  occurredAt: Date;
  /** VALOR_FINAL in cents. */
  revenueCents: number;
  /** QUANTIDADE (items). */
  itemQty: number;
  storeId: string;
  brand?: SalesBrand;
};

/** Daily bucket — matches sales_day_agg natural key. */
export type SalesDayAgg = {
  tenantId: string;
  storeId: string;
  /** Local calendar day YYYY-MM-DD in store timezone. */
  day: string;
  brand: SalesBrand;
  revenueCents: number;
  /** Distinct COD_OPERACAO count. */
  salesCount: number;
  itemCount: number;
};

/** Hourly bucket — matches sales_hour_agg (current local day). */
export type SalesHourAgg = {
  tenantId: string;
  storeId: string;
  day: string;
  hour: number;
  brand: SalesBrand;
  revenueCents: number;
  salesCount: number;
  itemCount: number;
};

export type AggregateSalesResult = {
  days: SalesDayAgg[];
  hours: SalesHourAgg[];
};
