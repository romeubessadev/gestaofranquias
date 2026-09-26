-- Venda ↔ vendedora pelo código de gerador do Millennium.
-- O relatório "WE PINK - PRODUTOS POR CUPOM E VENDEDOR" {52DE7BBC} traz FUNCIONARIO_GERADOR_GERADOR
-- (≠ FUNCIONARIO). O gerador da funcionária vem em GERADORES[0] do FUNCIONARIOS.Consulta.
-- Trocar o nome no ERP não muda o gerador → meta e histórico continuam na mesma pessoa.
-- A loja também guarda o gerador (filtro dos relatórios wtsreports): o worker só consulta o
-- lookup filial → gerador quando alguma loja ainda não tem.

alter table public.store
  add column if not exists millennium_gerador_id int;

comment on column public.store.millennium_gerador_id is
  'Gerador da filial no Millennium (lookup filial.GERADOR) — filtro FILIAL_GERADOR_GERADOR dos relatórios.';

alter table public.store_seller
  add column if not exists millennium_gerador_id int;

create index if not exists store_seller_gerador_idx
  on public.store_seller (tenant_id, millennium_gerador_id)
  where millennium_gerador_id is not null;

comment on column public.store_seller.millennium_gerador_id is
  'GERADORES[0].GERADOR do FUNCIONARIOS.Consulta — mesmo código que vem nas vendas do relatório de cupom.';

alter table public.sales_seller_day_agg
  add column if not exists seller_gerador_id int;

comment on column public.sales_seller_day_agg.seller_gerador_id is
  'Gerador da vendedora no Millennium (relatório de cupom). Liga ao cadastro mesmo que a pessoa ainda não estivesse sincronizada na gravação.';

-- Liga dias gravados sem código: 1º pelo gerador (qualquer loja do tenant), depois pelo nome (mesma loja).
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
     and a.seller_gerador_id is not null
     and s.tenant_id = a.tenant_id
     and s.millennium_gerador_id = a.seller_gerador_id;

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
