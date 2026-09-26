-- Turnos por loja (Configurações > Lojas > loja > Turnos) + turno de cada vendedora.
-- start_time/end_time em HH:MM local da loja (store.timezone); início < fim (sem virada de dia).
-- store_seller.shift_id: preenchido na WeDash; o sync do Millennium não mexe (upsert por colunas).

create table if not exists public.store_shift (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists store_shift_store_idx on public.store_shift (tenant_id, store_id);

comment on table public.store_shift is
  'Turnos da loja (nome + início/fim no horário local). Vendedoras apontam via store_seller.shift_id.';

alter table public.store_shift enable row level security;

grant select, insert, update, delete on public.store_shift to authenticated;
grant select, insert, update, delete on public.store_shift to service_role;

drop policy if exists store_shift_select_own on public.store_shift;
create policy store_shift_select_own
  on public.store_shift for select
  to authenticated
  using (
    tenant_id in (
      select m.tenant_id
      from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
        and m.status = 'ACTIVE'
    )
  );

drop policy if exists store_shift_write_managers on public.store_shift;
create policy store_shift_write_managers
  on public.store_shift for all
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

alter table public.store_seller
  add column if not exists shift_id uuid references public.store_shift (id) on delete set null;

comment on column public.store_seller.shift_id is
  'Turno da vendedora (store_shift). Definido na WeDash; excluir o turno deixa null.';

-- Gestor troca o turno da vendedora (só essa coluna).
grant update (shift_id) on public.store_seller to authenticated;

drop policy if exists store_seller_update_shift on public.store_seller;
create policy store_seller_update_shift
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
