-- Cache do detalhe do movimento (ConsultaDetMov) por cupom: WEPINK × WPINK.
-- ConsultaDetMov = 1 chamada por cupom; Atualizar / fechamento noturno só buscam cupons
-- que ainda não estão aqui. Cupom cancelado sai da soma porque a Lista é a referência.
create table if not exists public.sales_coupon_brand (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  -- COD_OPERACAO|NF|TIPO_OPERACAO
  coupon_key text not null,
  day date not null,
  occurred_at timestamptz not null,
  wepink_cents bigint not null default 0,
  wepink_items int not null default 0,
  wpink_cents bigint not null default 0,
  wpink_items int not null default 0,
  fetched_at timestamptz not null default now(),
  primary key (tenant_id, store_id, coupon_key)
);

create index if not exists sales_coupon_brand_day_idx
  on public.sales_coupon_brand (tenant_id, store_id, day);

comment on table public.sales_coupon_brand is
  'Resumo WEPINK/WPINK por cupom (ConsultaDetMov). Só o worker lê/escreve; evita re-buscar cupons já detalhados.';

alter table public.sales_coupon_brand enable row level security;

grant select, insert, update, delete on public.sales_coupon_brand to service_role;
