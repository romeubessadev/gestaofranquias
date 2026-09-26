-- Custo (CMV) por produto e dia — FRANQUIAS > RELATORIOS > RELATORIOMARGEM.
-- Mesma chamada que já alimenta cmv_cents / marca em sales_day_agg (nenhuma ida extra ao ERP).
-- Join com sales_product_day_agg pelo product_code (COD_PRODUTO).
create table if not exists public.sales_product_cost_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  product_code text not null,
  item_count numeric not null default 0,
  revenue_cents bigint not null default 0,
  cmv_cents bigint not null default 0,
  primary key (tenant_id, store_id, day, product_code)
);

create index if not exists sales_product_cost_day_agg_scope_idx
  on public.sales_product_cost_day_agg (tenant_id, day);

comment on table public.sales_product_cost_day_agg is
  'CMV diário por COD_PRODUTO (RELATORIOMARGEM: CUSTO_TOTAL, TOTALVENDA, QTDE_VENDIDA). Join com sales_product_day_agg.product_code.';

alter table public.sales_product_cost_day_agg enable row level security;

grant select on public.sales_product_cost_day_agg to authenticated;
grant select, insert, update, delete on public.sales_product_cost_day_agg to service_role;

create policy sales_product_cost_day_agg_select_own
  on public.sales_product_cost_day_agg for select
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
