-- Tabelas de custo do Millennium (lookup tabela_custo.TABELA) + custo unitário por produto
-- (wtsreports {9701602B} com TABELA_DE_CUSTO, sem filial). Globais: mesma franqueadora, mesmo ERP.
-- Uso: produto vendido que veio com custo 0 no RELATORIOMARGEM → quantidade × custo da tabela da loja
-- (calculado na leitura; corrige o histórico sem nova chamada ao ERP).

create table if not exists public.product_cost_table (
  table_id bigint primary key,
  code text not null default '',
  description text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.product_cost_table is
  'Tabelas de custo do Millennium (TABELA_CUSTO_TABELA). Global (sem tenant); só o worker grava.';

create table if not exists public.product_cost_table_price (
  table_id bigint not null references public.product_cost_table (table_id) on delete cascade,
  product_code text not null,
  unit_cost_cents int not null check (unit_cost_cents > 0),
  updated_at timestamptz not null default now(),
  primary key (table_id, product_code)
);

comment on table public.product_cost_table_price is
  'Custo unitário (centavos) por COD_PRODUTO em cada tabela de custo. Só custo > 0 (0 = sem preço na tabela).';

-- Linha única de controle da recarga (lease + última recarga), igual ao catálogo de produtos.
create table if not exists public.product_cost_table_sync (
  id int primary key default 1 check (id = 1),
  refreshed_at timestamptz,
  lease_owner text,
  lease_until timestamptz,
  last_error text
);

insert into public.product_cost_table_sync (id) values (1) on conflict (id) do nothing;

alter table public.store
  add column if not exists cost_table_id bigint references public.product_cost_table (table_id) on delete set null,
  add column if not exists cost_table_set_at timestamptz;

comment on column public.store.cost_table_id is
  'Tabela de custo da loja (Configurações > Lojas). Completa o custo quando a margem traz produto com custo 0.';
comment on column public.store.cost_table_set_at is
  'Quando a tabela foi definida (automático pelo worker ou pelo gestor). null = ainda não escolhida → worker detecta.';

grant update (cost_table_id, cost_table_set_at) on public.store to authenticated;

alter table public.product_cost_table enable row level security;
alter table public.product_cost_table_price enable row level security;
alter table public.product_cost_table_sync enable row level security;

grant select on public.product_cost_table to authenticated;
grant select on public.product_cost_table_price to authenticated;
grant select, insert, update, delete on public.product_cost_table to service_role;
grant select, insert, update, delete on public.product_cost_table_price to service_role;
grant select, insert, update, delete on public.product_cost_table_sync to service_role;

drop policy if exists product_cost_table_select_all on public.product_cost_table;
create policy product_cost_table_select_all
  on public.product_cost_table for select
  to authenticated
  using (true);

drop policy if exists product_cost_table_price_select_all on public.product_cost_table_price;
create policy product_cost_table_price_select_all
  on public.product_cost_table_price for select
  to authenticated
  using (true);

create or replace function public.claim_product_cost_table_refresh(
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
  update public.product_cost_table_sync
     set lease_owner = p_owner,
         lease_until = now() + make_interval(secs => p_lease_seconds)
   where id = 1
     and (lease_until is null or lease_until < now())
     and (refreshed_at is null or refreshed_at < now() - make_interval(secs => p_min_interval_seconds));
  get diagnostics got = row_count;
  return got > 0;
end;
$$;

create or replace function public.release_product_cost_table_refresh(
  p_owner text,
  p_ok boolean,
  p_error text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_cost_table_sync
     set lease_owner = null,
         lease_until = null,
         refreshed_at = case when p_ok then now() else refreshed_at end,
         last_error = case when p_ok then null else p_error end
   where id = 1
     and lease_owner = p_owner;
end;
$$;

revoke all on function public.claim_product_cost_table_refresh(text, int, int) from public, anon, authenticated;
revoke all on function public.release_product_cost_table_refresh(text, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_product_cost_table_refresh(text, int, int) to service_role;
grant execute on function public.release_product_cost_table_refresh(text, boolean, text) to service_role;
