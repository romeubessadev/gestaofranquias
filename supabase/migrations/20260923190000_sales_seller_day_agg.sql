-- Receita por vendedora (VENDEDOR_MILLENNIUM da VENDAS.Lista) por dia.
-- brand = ALL (Lista não traz marca; split WEPINK/WPINK não aplica aqui).
-- seller_key = nome normalizado (sem acento, upper); seller_name = rótulo de UI.
create table if not exists public.sales_seller_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  seller_key text not null,
  seller_name text not null,
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  sales_count int not null default 0,
  primary key (tenant_id, store_id, day, seller_key)
);

create index if not exists sales_seller_day_agg_scope_idx
  on public.sales_seller_day_agg (tenant_id, day);

comment on table public.sales_seller_day_agg is
  'Receita diária por VENDEDOR_MILLENNIUM (VENDAS.Lista). brand=ALL. Sem nome → fora do ranking.';

alter table public.sales_seller_day_agg enable row level security;

grant select on public.sales_seller_day_agg to authenticated;
grant select, insert, update, delete on public.sales_seller_day_agg to service_role;

create policy sales_seller_day_agg_select_own
  on public.sales_seller_day_agg for select
  to authenticated
  using (
    tenant_id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.status = 'ACTIVE'
    )
  );
