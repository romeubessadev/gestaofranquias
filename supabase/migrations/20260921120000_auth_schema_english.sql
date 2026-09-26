-- Bridge: renomeia schema auth PT → inglês (no-op se já estiver em inglês).
-- Seguro para projetos que aplicaram as migrations originais em português.

do $$
begin
  if to_regclass('public.identidade') is null then
    raise notice 'schema auth já em inglês (ou inexistente) — skip rename';
    return;
  end if;

  -- Remove policies PT (recriadas abaixo com nomes EN)
  drop policy if exists tenant_public_brand on public.tenant;
  drop policy if exists identidade_own on public.identidade;
  drop policy if exists vinculo_own on public.vinculo;
  drop policy if exists vinculo_filial_own on public.vinculo_filial;
  drop policy if exists identidade_own_update_senha_temp on public.identidade;
  drop policy if exists vinculo_own_update_onboarding on public.vinculo;
  drop policy if exists vinculo_filial_own_insert on public.vinculo_filial;
  drop policy if exists vinculo_filial_own_delete on public.vinculo_filial;
  drop policy if exists tenant_own_update_marca on public.tenant;

  -- Tabelas
  alter table public.identidade rename to identity;
  alter table public.vinculo rename to membership;
  alter table public.vinculo_filial rename to membership_store;

  -- Colunas tenant
  alter table public.tenant rename column slug_anterior to previous_slug;
  alter table public.tenant rename column nome to name;
  alter table public.tenant rename column nome_exibicao to display_name;
  alter table public.tenant rename column cor_marca to brand_color;
  alter table public.tenant rename column ativo to active;

  -- Colunas identity
  alter table public.identity rename column nome to name;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'identity' and column_name = 'senha_temporaria'
  ) then
    alter table public.identity rename column senha_temporaria to temporary_password;
  else
    alter table public.identity
      add column if not exists temporary_password boolean not null default false;
  end if;

  -- Colunas membership
  alter table public.membership rename column identidade_id to identity_id;
  alter table public.membership rename column papel to role;
  alter table public.membership rename column proprietario to is_owner;
  alter table public.membership rename column onboarding_etapa to onboarding_step;
  alter table public.membership rename column aceito_em to accepted_at;

  -- Colunas membership_store
  alter table public.membership_store rename column vinculo_id to membership_id;
  alter table public.membership_store rename column filial_id to store_id;
  -- Garante texto (migration legada usava uuid e depois cast)
  alter table public.membership_store
    alter column store_id type text using store_id::text;

  -- Remove checks antigos antes de reescrever valores enum-like
  alter table public.identity drop constraint if exists identidade_status_check;
  alter table public.identity drop constraint if exists identity_status_check;
  alter table public.membership drop constraint if exists vinculo_papel_check;
  alter table public.membership drop constraint if exists vinculo_status_check;
  alter table public.membership drop constraint if exists membership_role_check;
  alter table public.membership drop constraint if exists membership_status_check;

  update public.identity set status = case status
    when 'PENDENTE' then 'PENDING'
    when 'ATIVO' then 'ACTIVE'
    when 'SUSPENSO' then 'SUSPENDED'
    else status
  end;

  update public.membership set status = case status
    when 'PENDENTE' then 'PENDING'
    when 'ATIVO' then 'ACTIVE'
    when 'RECUSADO' then 'DECLINED'
    when 'SUSPENSO' then 'SUSPENDED'
    else status
  end;

  update public.membership set role = case role
    when 'GESTOR' then 'OWNER'
    when 'GERENTE' then 'MANAGER'
    when 'VENDEDOR' then 'SELLER'
    else role
  end;

  alter table public.identity
    add constraint identity_status_check
    check (status in ('PENDING', 'ACTIVE', 'SUSPENDED'));
  alter table public.membership
    add constraint membership_role_check
    check (role in ('ADMIN_GLOBAL', 'OWNER', 'MANAGER', 'SELLER'));
  alter table public.membership
    add constraint membership_status_check
    check (status in ('PENDING', 'ACTIVE', 'DECLINED', 'SUSPENDED'));

  -- Grants
  grant select on public.identity to authenticated;
  grant select on public.membership to authenticated;
  grant select on public.membership_store to authenticated;
  grant update (temporary_password) on public.identity to authenticated;
  grant update (onboarding_step) on public.membership to authenticated;
  grant insert, delete on public.membership_store to authenticated;
  grant update (name, display_name, slug, logo_url) on public.tenant to authenticated;

  -- Policies (inglês)
  create policy tenant_public_brand
    on public.tenant for select
    to anon, authenticated
    using (active = true);

  create policy identity_select_own
    on public.identity for select
    to authenticated
    using (auth_user_id = auth.uid());

  create policy membership_select_own
    on public.membership for select
    to authenticated
    using (
      identity_id in (
        select id from public.identity where auth_user_id = auth.uid()
      )
    );

  create policy membership_store_select_own
    on public.membership_store for select
    to authenticated
    using (
      membership_id in (
        select m.id from public.membership m
        join public.identity i on i.id = m.identity_id
        where i.auth_user_id = auth.uid()
      )
    );

  create policy identity_update_own_temporary_password
    on public.identity for update
    to authenticated
    using (auth_user_id = auth.uid())
    with check (auth_user_id = auth.uid());

  create policy membership_update_own_onboarding
    on public.membership for update
    to authenticated
    using (
      identity_id in (
        select id from public.identity where auth_user_id = auth.uid()
      )
    )
    with check (
      identity_id in (
        select id from public.identity where auth_user_id = auth.uid()
      )
    );

  create policy membership_store_insert_own
    on public.membership_store for insert
    to authenticated
    with check (
      membership_id in (
        select m.id from public.membership m
        join public.identity i on i.id = m.identity_id
        where i.auth_user_id = auth.uid()
      )
    );

  create policy membership_store_delete_own
    on public.membership_store for delete
    to authenticated
    using (
      membership_id in (
        select m.id from public.membership m
        join public.identity i on i.id = m.identity_id
        where i.auth_user_id = auth.uid()
      )
    );

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
end $$;
