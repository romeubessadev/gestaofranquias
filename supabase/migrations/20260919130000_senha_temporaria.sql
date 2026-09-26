-- Primeiro login com senha temporária → obrigar troca antes do onboarding/app.
alter table public.identity
  add column if not exists temporary_password boolean not null default false;

grant update (temporary_password) on public.identity to authenticated;

create policy identity_update_own_temporary_password
  on public.identity for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());
