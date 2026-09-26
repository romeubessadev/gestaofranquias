-- Configurações > Logs — erros e avisos do sync Millennium (worker).
-- Writes: service_role (worker). Read: OWNER/MANAGER do tenant. Retenção 30 dias (worker purga).
create table if not exists public.sync_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  job_id uuid,
  job_kind text,
  level text not null check (level in ('ERROR', 'WARN')),
  -- etapa do sync: vendas, margem, categorias, top_produtos, detalhe_movimento, login, job…
  source text not null,
  store_id uuid references public.store (id) on delete set null,
  store_label text,
  day date,
  message text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sync_log_tenant_created_idx
  on public.sync_log (tenant_id, created_at desc);

comment on table public.sync_log is
  'Erros/avisos do worker millennium-sync (Configurações > Logs). Mensagens sanitizadas (sem token/senha). Retenção 30d.';

alter table public.sync_log enable row level security;

grant select on public.sync_log to authenticated;
grant select, insert, update, delete on public.sync_log to service_role;

create policy sync_log_select_managers
  on public.sync_log for select
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
  );
