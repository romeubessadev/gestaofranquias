-- Receita por forma de pagamento (CONDICAO da VENDAS.Lista) por dia.
-- brand = ALL (Lista não traz marca; split WEPINK/WPINK não aplica aqui).
create table if not exists public.sales_payment_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  payment_method text not null,
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  sales_count int not null default 0,
  primary key (tenant_id, store_id, day, payment_method)
);

create index if not exists sales_payment_day_agg_scope_idx
  on public.sales_payment_day_agg (tenant_id, day);

comment on table public.sales_payment_day_agg is
  'Receita diária por CONDICAO (VENDAS.Lista). brand=ALL.';

alter table public.sales_payment_day_agg enable row level security;

grant select on public.sales_payment_day_agg to authenticated;
grant select, insert, update, delete on public.sales_payment_day_agg to service_role;

create policy sales_payment_day_agg_select_own
  on public.sales_payment_day_agg for select
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
