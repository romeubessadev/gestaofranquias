-- Recarga única de produtos: catálogo (tipos + produtos) + tabelas de custo + preços de todas as tabelas
-- na mesma operação, com o lease/controle do catálogo (product_catalog_sync). Sem recarga por relógio:
-- só catálogo vazio, produto desconhecido, produto com custo 0 sem preço na tabela da loja ou botão
-- Atualizar em Configurações > Produtos.

drop function if exists public.claim_product_cost_table_refresh(text, int, int);
drop function if exists public.release_product_cost_table_refresh(text, boolean, text);
drop table if exists public.product_cost_table_sync;

-- Produto vendido com custo 0 na margem que não veio na tabela da loja depois de uma recarga:
-- não força outra recarga por 24h.
create table if not exists public.product_cost_miss (
  table_id bigint not null references public.product_cost_table (table_id) on delete cascade,
  product_code text not null,
  checked_at timestamptz not null default now(),
  primary key (table_id, product_code)
);

comment on table public.product_cost_miss is
  'Produto com custo 0 na margem sem preço na tabela de custo após a última recarga (evita recarga em loop).';

alter table public.product_cost_miss enable row level security;
grant select, insert, update, delete on public.product_cost_miss to service_role;

-- "Atualizado em" da tela Configurações > Produtos.
grant select (id, refreshed_at) on public.product_catalog_sync to authenticated;

drop policy if exists product_catalog_sync_select_all on public.product_catalog_sync;
create policy product_catalog_sync_select_all
  on public.product_catalog_sync for select
  to authenticated
  using (true);
