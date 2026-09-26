-- Vendedoras da loja sincronizadas do Millennium (FUNCIONARIOS.Lista CARGO=VENDEDOR + Consulta).
-- active = false quando o ERP marca DESATIVADO / INATIVO / AFASTADO / NAO_MOSTRAR_NO_EVENTO.
-- in_erp = false quando sumiu da Lista (mudou de cargo/loja) — linha fica para o histórico.
-- whatsapp / email: preenchidos no WeDash (edição + convite de acesso — TODO).
create table if not exists public.store_seller (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  millennium_employee_id int not null,
  code text,
  name text not null,
  erp_login text,
  active boolean not null default true,
  erp_flags jsonb,
  in_erp boolean not null default true,
  whatsapp text,
  email text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (store_id, millennium_employee_id)
);

create index if not exists store_seller_tenant_idx on public.store_seller (tenant_id, store_id);

comment on table public.store_seller is
  'Vendedoras (cargo VENDEDOR) por loja, sincronizadas do Millennium. active=false = desativada/afastada no ERP.';

alter table public.store_seller enable row level security;

grant select on public.store_seller to authenticated;
grant select, insert, update, delete on public.store_seller to service_role;

create policy store_seller_select_own
  on public.store_seller for select
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
