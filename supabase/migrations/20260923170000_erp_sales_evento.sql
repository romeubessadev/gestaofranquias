-- Cache Millennium EVENTOS.ListaTodos: código (S-10) → id numérico da VENDAS.Lista.
-- 1 fetch por tenant; FORCE/LIGHT reusam até faltar código de alguma loja.

create table if not exists public.erp_sales_evento (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  code text not null,
  millennium_evento_id integer not null,
  label text not null default '',
  updated_at timestamptz not null default now(),
  primary key (tenant_id, code)
);

create index if not exists erp_sales_evento_tenant_idx
  on public.erp_sales_evento (tenant_id);

comment on table public.erp_sales_evento is
  'Mapa CODIGO EVENTO (S-X, S-03, S-10…) → id Millennium. Preenchido no 1º sync; evita ListaTodos a cada FORCE.';

alter table public.erp_sales_evento enable row level security;

grant select on public.erp_sales_evento to authenticated;
grant select, insert, update, delete on public.erp_sales_evento to service_role;

create policy erp_sales_evento_select_own
  on public.erp_sales_evento for select
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
