-- Receita por categoria (tipo de produto ERP) por dia.
-- Fonte: wtsreports C5BBF0E2 (Produtos vendidos por vendedor).
-- category_id = PRODUTO_TIPO_TIPO do Millennium.
create table if not exists public.sales_category_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  category_id bigint not null,
  category_name text not null,
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  item_count int not null default 0,
  primary key (tenant_id, store_id, day, category_id)
);

create index if not exists sales_category_day_agg_scope_idx
  on public.sales_category_day_agg (tenant_id, day);

comment on table public.sales_category_day_agg is
  'Receita diária por PRODUTO_TIPO (C5BBF0E2). Mapa produto→tipo via report filtrado.';

alter table public.sales_category_day_agg enable row level security;

grant select on public.sales_category_day_agg to authenticated;
grant select, insert, update, delete on public.sales_category_day_agg to service_role;

create policy sales_category_day_agg_select_own
  on public.sales_category_day_agg for select
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
