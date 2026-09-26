-- Vendas por vendedora ligadas ao código da funcionária no Millennium (FUNCIONARIO).
-- VENDAS.Lista só traz o nome → o worker resolve nome → código na gravação.
-- store_seller.name_keys = todos os nomes normalizados (sem acento, upper) já vistos para a funcionária:
-- se o nome mudar no ERP, o antigo continua resolvendo para o mesmo código.

alter table public.store_seller
  add column if not exists name_keys text[] not null default '{}';

-- Linhas já sincronizadas: chave do nome atual (mesma normalização do worker: sem acento, upper, espaços colapsados).
update public.store_seller
   set name_keys = array[
     regexp_replace(
       translate(upper(trim(name)), 'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ', 'AAAAAEEEEIIIIOOOOOUUUUCN'),
       '\s+', ' ', 'g'
     )
   ]
 where cardinality(name_keys) = 0;

create index if not exists store_seller_name_keys_idx on public.store_seller using gin (name_keys);

alter table public.sales_seller_day_agg
  add column if not exists seller_employee_id int;

comment on column public.sales_seller_day_agg.seller_employee_id is
  'FUNCIONARIO no Millennium (via store_seller.name_keys). null = nome sem cadastro de vendedora — ranking agrupa pelo nome.';

-- Liga dias antigos (gravados só com nome) às vendedoras da mesma loja. Chamado após cada sync de vendedoras.
create or replace function public.link_seller_day_aggs(p_tenant_id uuid, p_store_id uuid default null)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sales_seller_day_agg a
     set seller_employee_id = s.millennium_employee_id
    from public.store_seller s
   where a.tenant_id = p_tenant_id
     and (p_store_id is null or a.store_id = p_store_id)
     and a.seller_employee_id is null
     and s.tenant_id = a.tenant_id
     and s.store_id = a.store_id
     and a.seller_key = any (s.name_keys);
$$;

revoke all on function public.link_seller_day_aggs(uuid, uuid) from public;
revoke all on function public.link_seller_day_aggs(uuid, uuid) from anon, authenticated;
grant execute on function public.link_seller_day_aggs(uuid, uuid) to service_role;

select public.link_seller_day_aggs(t.id) from public.tenant t;
