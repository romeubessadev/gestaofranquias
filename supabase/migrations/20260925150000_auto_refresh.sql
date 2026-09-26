-- Atualização automática (Configurações > Integrações): o worker roda o Atualizar de hoje
-- nas lojas abertas a cada N minutos e fecha o dia 30 min depois do fechamento.

alter table public.erp_credential
  add column if not exists auto_refresh_enabled boolean not null default true,
  add column if not exists auto_refresh_interval_min int not null default 30
    check (auto_refresh_interval_min in (15, 30, 60));

comment on column public.erp_credential.auto_refresh_enabled is
  'Atualização automática ligada (padrão). Só roda nas lojas abertas (horário + fuso da loja).';
comment on column public.erp_credential.auto_refresh_interval_min is
  'Intervalo da atualização automática em minutos: 15, 30 ou 60.';

alter table public.store
  add column if not exists last_closed_day date,
  add column if not exists last_sync_at timestamptz;

comment on column public.store.last_closed_day is
  'Último dia fechado da loja (Atualizar bem-sucedido depois do fechamento). Dias depois dele e antes de hoje ficam pendentes.';
comment on column public.store.last_sync_at is
  'Último Atualizar de hoje bem-sucedido da loja (manual ou automático).';

-- Gestor liga/desliga e escolhe o intervalo pela UI.
grant update (auto_refresh_enabled, auto_refresh_interval_min) on public.erp_credential to authenticated;

drop policy if exists erp_credential_update_auto_refresh on public.erp_credential;
create policy erp_credential_update_auto_refresh
  on public.erp_credential for update
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
