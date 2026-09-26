-- Catálogo de produtos compartilhado por toda a rede (mesmo Millennium da franqueadora).
-- Fonte: lookups PRODUTO.tipo.tipo (tipos) + produto.produto.produto filtrado por tipo (PARAM_9).
-- Categoria do mix = sales_product_day_agg × catálogo, calculada na leitura (sales_category_day_view).

create table if not exists public.product_type (
  type_id bigint primary key,
  description text not null,
  updated_at timestamptz not null default now()
);

comment on table public.product_type is
  'Tipos de produto do Millennium (PRODUTO_TIPO_TIPO). 16 e -2000000000 = INDEFINIDO. Global (sem tenant).';

create table if not exists public.product_catalog (
  product_code text primary key,
  erp_product_id int not null unique,
  description text not null default '',
  type_id bigint references public.product_type (type_id),
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_catalog is
  'Produtos do Millennium (COD_PRODUTO) com o tipo. Global (sem tenant); só o worker grava.';

-- Produto que não apareceu no catálogo depois de uma recarga: não força outra por 24h.
create table if not exists public.product_catalog_miss (
  erp_product_id int primary key,
  product_code text not null default '',
  checked_at timestamptz not null default now()
);

comment on table public.product_catalog_miss is
  'Produtos vistos em vendas que não vieram na última recarga do catálogo (evita recarga em loop).';

-- Linha única de controle: quem está recarregando (lease) e quando foi a última recarga.
create table if not exists public.product_catalog_sync (
  id int primary key default 1 check (id = 1),
  refreshed_at timestamptz,
  lease_owner text,
  lease_until timestamptz,
  last_error text
);

insert into public.product_catalog_sync (id) values (1) on conflict (id) do nothing;

alter table public.product_type enable row level security;
alter table public.product_catalog enable row level security;
alter table public.product_catalog_miss enable row level security;
alter table public.product_catalog_sync enable row level security;

grant select on public.product_type to authenticated;
grant select on public.product_catalog to authenticated;
grant select, insert, update, delete on public.product_type to service_role;
grant select, insert, update, delete on public.product_catalog to service_role;
grant select, insert, update, delete on public.product_catalog_miss to service_role;
grant select, insert, update, delete on public.product_catalog_sync to service_role;

drop policy if exists product_type_select_all on public.product_type;
create policy product_type_select_all
  on public.product_type for select
  to authenticated
  using (true);

drop policy if exists product_catalog_select_all on public.product_catalog;
create policy product_catalog_select_all
  on public.product_catalog for select
  to authenticated
  using (true);

-- Pega a vez de recarregar o catálogo. true = este worker recarrega agora.
-- Nega se outro está recarregando (lease válido) ou se recarregou há menos de p_min_interval_seconds
-- (p_min_interval_seconds = 0 quando o catálogo está vazio).
create or replace function public.claim_product_catalog_refresh(
  p_owner text,
  p_lease_seconds int,
  p_min_interval_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  got int;
begin
  update public.product_catalog_sync
     set lease_owner = p_owner,
         lease_until = now() + make_interval(secs => p_lease_seconds)
   where id = 1
     and (lease_until is null or lease_until < now())
     and (refreshed_at is null or refreshed_at < now() - make_interval(secs => p_min_interval_seconds));
  get diagnostics got = row_count;
  return got > 0;
end;
$$;

-- Libera a vez; ok = recarga completa (grava refreshed_at).
create or replace function public.release_product_catalog_refresh(
  p_owner text,
  p_ok boolean,
  p_error text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_catalog_sync
     set lease_owner = null,
         lease_until = null,
         refreshed_at = case when p_ok then now() else refreshed_at end,
         last_error = case when p_ok then null else p_error end
   where id = 1
     and lease_owner = p_owner;
end;
$$;

revoke all on function public.claim_product_catalog_refresh(text, int, int) from public, anon, authenticated;
revoke all on function public.release_product_catalog_refresh(text, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_product_catalog_refresh(text, int, int) to service_role;
grant execute on function public.release_product_catalog_refresh(text, boolean, text) to service_role;

-- Itens do detalhe da movimentação no cache de cupons: venda sem vendedora (fora do relatório de cupom)
-- entra no top produtos / categoria sem repetir a chamada a cada Atualizar.
alter table public.sales_coupon_brand add column if not exists items jsonb;

comment on column public.sales_coupon_brand.items is
  'Itens do ConsultaDetMov [{productId, revenueCents, qty, descProduto}]. null = cache antigo, sem itens.';

-- Faturamento por categoria (loja × dia × tipo) = itens vendidos × catálogo.
-- Produto fora do catálogo cai em INDEFINIDO. RLS vem de sales_product_day_agg (security_invoker).
create or replace view public.sales_category_day_view
with (security_invoker = true) as
select
  p.tenant_id,
  p.store_id,
  p.day,
  coalesce(c.type_id, -2000000000)::bigint as category_id,
  coalesce(t.description, 'INDEFINIDO') as category_name,
  'ALL'::text as brand,
  sum(p.revenue_cents)::bigint as revenue_cents,
  sum(p.item_count)::int as item_count
from public.sales_product_day_agg p
left join public.product_catalog c on c.erp_product_id = p.product_id
left join public.product_type t on t.type_id = c.type_id
group by p.tenant_id, p.store_id, p.day, coalesce(c.type_id, -2000000000), coalesce(t.description, 'INDEFINIDO');

comment on view public.sales_category_day_view is
  'Faturamento diário por tipo de produto: sales_product_day_agg × product_catalog (substitui o {2C46ADF5}).';

grant select on public.sales_category_day_view to authenticated, service_role;
