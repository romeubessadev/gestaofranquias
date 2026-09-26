-- Receita por produto (wtsreports WEPINK - VENDAS DE PRODUTOS POR FILIAL {E7A5C5C7}).
-- brand = ALL (Overview total; marca por COD WP* fica para fase futura).
create table if not exists public.sales_product_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  product_id int not null,
  product_code text not null default '',
  product_name text not null,
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  item_count int not null default 0,
  primary key (tenant_id, store_id, day, product_id)
);

create index if not exists sales_product_day_agg_scope_idx
  on public.sales_product_day_agg (tenant_id, day);

comment on table public.sales_product_day_agg is
  'Receita diária por SKU ({E7A5C5C7} VENDAS DE PRODUTOS POR FILIAL). brand=ALL. Soft-fail se personalizado faltar.';

alter table public.sales_product_day_agg enable row level security;

grant select on public.sales_product_day_agg to authenticated;
grant select, insert, update, delete on public.sales_product_day_agg to service_role;

create policy sales_product_day_agg_select_own
  on public.sales_product_day_agg for select
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
