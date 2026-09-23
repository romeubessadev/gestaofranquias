-- CMV diário (RELATORIOMARGEM → CUSTO_TOTAL). Imposto% entra depois em Configurações > Custos.
alter table public.sales_day_agg
  add column if not exists cmv_cents bigint not null default 0;

comment on column public.sales_day_agg.cmv_cents is
  'CMV em centavos (Σ CUSTO_TOTAL do RELATORIOMARGEM). imposto_sobre_custo_pct = TODO Configurações.';
