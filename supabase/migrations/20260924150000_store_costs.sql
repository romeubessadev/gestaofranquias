-- Custos da operação por loja (Configurações > Lojas > Custos).
-- % sobre o faturamento da marca; aluguel fixo em centavos/mês.
-- null = não configurado (Financeiro usa o padrão e a UI avisa "Custos pendentes").

alter table public.store
  add column if not exists royalties_wepink_pct numeric(5, 2),
  add column if not exists royalties_wpink_pct numeric(5, 2),
  add column if not exists marketing_wepink_pct numeric(5, 2),
  add column if not exists marketing_wpink_pct numeric(5, 2),
  add column if not exists rent_wepink_pct numeric(5, 2),
  add column if not exists rent_wpink_pct numeric(5, 2),
  add column if not exists rent_fixed_cents bigint;

alter table public.store
  drop constraint if exists store_cost_pct_range;
alter table public.store
  add constraint store_cost_pct_range check (
    coalesce(royalties_wepink_pct, 0) between 0 and 100
    and coalesce(royalties_wpink_pct, 0) between 0 and 100
    and coalesce(marketing_wepink_pct, 0) between 0 and 100
    and coalesce(marketing_wpink_pct, 0) between 0 and 100
    and coalesce(rent_wepink_pct, 0) between 0 and 100
    and coalesce(rent_wpink_pct, 0) between 0 and 100
    and coalesce(rent_fixed_cents, 0) >= 0
  );

comment on column public.store.royalties_wepink_pct is '% royalties sobre o faturamento WEPINK.';
comment on column public.store.royalties_wpink_pct is '% royalties sobre o faturamento WPINK.';
comment on column public.store.marketing_wepink_pct is '% taxa de marketing sobre o faturamento WEPINK.';
comment on column public.store.marketing_wpink_pct is '% taxa de marketing sobre o faturamento WPINK.';
comment on column public.store.rent_wepink_pct is '% aluguel variável sobre o faturamento WEPINK.';
comment on column public.store.rent_wpink_pct is '% aluguel variável sobre o faturamento WPINK.';
comment on column public.store.rent_fixed_cents is 'Aluguel fixo mensal (centavos).';

-- Policy store_update_own (OWNER/MANAGER/ADMIN_GLOBAL) já existe; só libera as colunas.
grant update (
  royalties_wepink_pct,
  royalties_wpink_pct,
  marketing_wepink_pct,
  marketing_wpink_pct,
  rent_wepink_pct,
  rent_wpink_pct,
  rent_fixed_cents
) on public.store to authenticated;
