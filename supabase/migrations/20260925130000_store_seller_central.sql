-- Vendedor central da loja (conta genérica usada por freelancer / gerente).
-- Fica fora do ranking e das metas individuais; continua no faturamento da loja.
alter table public.store_seller
  add column if not exists is_central boolean not null default false;

comment on column public.store_seller.is_central is
  'Marcado à mão em Configurações > Lojas. Vendas dele não entram no ranking nem em metas individuais (continuam no total da loja).';

grant update (is_central) on public.store_seller to authenticated;

drop policy if exists store_seller_update_central on public.store_seller;
create policy store_seller_update_central
  on public.store_seller for update
  to authenticated
  using (
    tenant_id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.status = 'ACTIVE'
        and m.role in ('OWNER', 'MANAGER', 'ADMIN_GLOBAL')
    )
  )
  with check (
    tenant_id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.status = 'ACTIVE'
        and m.role in ('OWNER', 'MANAGER', 'ADMIN_GLOBAL')
    )
  );
