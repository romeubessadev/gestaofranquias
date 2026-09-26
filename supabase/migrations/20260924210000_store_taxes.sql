-- Impostos por loja (Configurações > Lojas > Custos da operação).
-- ICMS % sobre o faturamento; ICMS ST % sobre o custo dos produtos vendidos (CMV).
-- Um % por loja (vale para WEPINK e WPINK). null = não configurado (Financeiro usa 0).
-- Entram antes do Lucro bruto: Faturamento − CMV − ICMS − ICMS ST.

alter table public.store
  add column if not exists icms_pct numeric(5, 2),
  add column if not exists icms_st_pct numeric(5, 2);

alter table public.store
  drop constraint if exists store_tax_pct_range;
alter table public.store
  add constraint store_tax_pct_range check (
    coalesce(icms_pct, 0) between 0 and 100
    and coalesce(icms_st_pct, 0) between 0 and 100
  );

comment on column public.store.icms_pct is '% ICMS sobre o faturamento da loja.';
comment on column public.store.icms_st_pct is '% ICMS ST sobre o custo dos produtos vendidos (CMV).';

-- Policy store_update_own (OWNER/MANAGER/ADMIN_GLOBAL) já existe; só libera as colunas.
grant update (icms_pct, icms_st_pct) on public.store to authenticated;
