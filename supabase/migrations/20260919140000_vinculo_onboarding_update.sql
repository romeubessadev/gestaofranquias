-- Permite o próprio usuário atualizar onboarding_step do membership
-- (concluir → null; avançar etapas → 1..3).

grant update (onboarding_step) on public.membership to authenticated;

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
