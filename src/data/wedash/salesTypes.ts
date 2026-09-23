/** Shared sales row / aggregate types (EN). Money = integer cents. */

export type SalesBrand = "WEPINK" | "WPINK" | "ALL";

/** One VENDAS.Lista line (or collapsed operation) after Millennium map. */
export type SaleRow = {
  operationCode: string;
  /** Instant used for day/hour buckets (DATA calendar + DATA_H clock). */
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
  /**
   * CMV em centavos (RELATORIOMARGEM Σ CUSTO_TOTAL). brand=ALL na v1.
   * TODO(Configurações>Custos): × (1 + imposto_sobre_custo_pct).
   */
  cmvCents?: number;
};

/** Daily revenue by product tipo (C5BBF0E2) — sales_category_day_agg. */
export type SalesCategoryDayAgg = {
  tenantId: string;
  storeId: string;
  day: string;
  /** Millennium PRODUTO_TIPO_TIPO. */
  categoryId: number;
  categoryName: string;
  brand: SalesBrand;
  revenueCents: number;
  itemCount: number;
};

/** Distinct PRODUTO_TIPO already seen for the store (histórico sync). */
export type SalesCategoryRef = {
  categoryId: number;
  categoryName: string;
  brand: SalesBrand;
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
