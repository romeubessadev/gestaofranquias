-- Horário de funcionamento por dia da semana + edição de fuso pela UI.
-- hours JSON: chave "0".."6" (domingo=0, como Date#getDay).
-- Valor null = fechado; senão { "open": "09:00", "close": "21:00" }.

alter table public.store
  add column if not exists hours jsonb not null default '{
    "0": null,
    "1": {"open": "09:00", "close": "21:00"},
    "2": {"open": "09:00", "close": "21:00"},
    "3": {"open": "09:00", "close": "21:00"},
    "4": {"open": "09:00", "close": "21:00"},
    "5": {"open": "09:00", "close": "21:00"},
    "6": {"open": "09:00", "close": "21:00"}
  }'::jsonb;

comment on column public.store.hours is
  'Horário por dia (0=dom..6=sáb). null=fechado; {open,close} em HH:MM local da loja.';

comment on column public.store.timezone is
  'IANA (ex. America/Campo_Grande). Usado no sync e nos eixos de hora.';

-- Gestor pode editar fuso + horário das lojas do próprio tenant.
grant update (timezone, hours) on public.store to authenticated;

drop policy if exists store_update_own on public.store;
create policy store_update_own
  on public.store for update
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
