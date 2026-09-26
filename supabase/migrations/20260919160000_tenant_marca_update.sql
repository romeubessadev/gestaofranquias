-- Proprietário pode atualizar a marca do próprio tenant (etapa Empresa do onboarding).

grant update (name, display_name, slug, logo_url) on public.tenant to authenticated;

drop policy if exists tenant_update_own_brand on public.tenant;
create policy tenant_update_own_brand
  on public.tenant for update
  to authenticated
  using (
    id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.is_owner = true
        and m.status = 'ACTIVE'
    )
  )
  with check (
    id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.is_owner = true
        and m.status = 'ACTIVE'
    )
  );
