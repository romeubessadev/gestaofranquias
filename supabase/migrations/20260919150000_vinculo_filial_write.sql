-- Escopo de lojas do membership: políticas de escrita (store_id texto: f1, erp-8…).

grant insert, delete on public.membership_store to authenticated;

drop policy if exists membership_store_insert_own on public.membership_store;
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

drop policy if exists membership_store_delete_own on public.membership_store;
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
