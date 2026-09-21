-- ERP sync + sales aggregates (Visão Geral read model).
-- Writes: service_role only. Authenticated: SELECT own tenant.

-- ---------------------------------------------------------------------------
-- erp_credential (1 per tenant in v1)
-- ---------------------------------------------------------------------------
create table if not exists public.erp_credential (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenant (id) on delete cascade,
  username text not null,
  password_ciphertext text not null,
  dedicated boolean not null default false,
  status text not null default 'NOT_CONFIGURED'
    check (status in ('VALID', 'INVALID', 'NOT_CONFIGURED')),
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  light_interval_min int not null default 30
    check (light_interval_min > 0),
  last_light_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- store (Millennium filial mapped to tenant)
-- ---------------------------------------------------------------------------
create table if not exists public.store (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  millennium_store_id int not null,
  code text,
  name text,
  trade_name text,
  timezone text not null default 'America/Campo_Grande',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, millennium_store_id)
);

create index if not exists store_tenant_idx on public.store (tenant_id);

-- ---------------------------------------------------------------------------
-- sync_job (worker poll queue)
-- ---------------------------------------------------------------------------
create table if not exists public.sync_job (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  credential_id uuid not null references public.erp_credential (id) on delete cascade,
  kind text not null
    check (kind in ('BACKFILL', 'LIGHT', 'FORCE_LIGHT')),
  status text not null default 'QUEUED'
    check (status in ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED')),
  payload jsonb,
  attempts int not null default 0,
  locked_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists sync_job_claim_idx
  on public.sync_job (status, created_at)
  where status = 'QUEUED';

create index if not exists sync_job_credential_running_idx
  on public.sync_job (credential_id)
  where status = 'RUNNING';

-- ---------------------------------------------------------------------------
-- sync_run (audit of completed attempts)
-- ---------------------------------------------------------------------------
create table if not exists public.sync_run (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  credential_id uuid not null references public.erp_credential (id) on delete cascade,
  kind text not null
    check (kind in ('BACKFILL', 'LIGHT', 'FORCE_LIGHT')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  stores_done int not null default 0,
  error text
);

create index if not exists sync_run_tenant_idx
  on public.sync_run (tenant_id, started_at desc);

-- ---------------------------------------------------------------------------
-- sales_day_agg (canonical dashboard day bucket)
-- ---------------------------------------------------------------------------
create table if not exists public.sales_day_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  sales_count int not null default 0,
  item_count int not null default 0,
  primary key (tenant_id, store_id, day, brand)
);

create index if not exists sales_day_agg_scope_idx
  on public.sales_day_agg (tenant_id, day);

-- ---------------------------------------------------------------------------
-- sales_hour_agg (current local day only; cleaned next day by worker)
-- ---------------------------------------------------------------------------
create table if not exists public.sales_hour_agg (
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  store_id uuid not null references public.store (id) on delete cascade,
  day date not null,
  hour smallint not null
    check (hour >= 0 and hour <= 23),
  brand text not null default 'ALL'
    check (brand in ('WEPINK', 'WPINK', 'ALL')),
  revenue_cents bigint not null default 0,
  sales_count int not null default 0,
  item_count int not null default 0,
  primary key (tenant_id, store_id, day, hour, brand)
);

create index if not exists sales_hour_agg_scope_idx
  on public.sales_hour_agg (tenant_id, day);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.erp_credential enable row level security;
alter table public.store enable row level security;
alter table public.sync_job enable row level security;
alter table public.sync_run enable row level security;
alter table public.sales_day_agg enable row level security;
alter table public.sales_hour_agg enable row level security;

-- SELECT grants for authenticated (own tenant via policies). No INSERT/UPDATE/DELETE.
grant select on public.erp_credential to authenticated;
grant select on public.store to authenticated;
grant select on public.sync_job to authenticated;
grant select on public.sync_run to authenticated;
grant select on public.sales_day_agg to authenticated;
grant select on public.sales_hour_agg to authenticated;

-- Helper predicate: caller belongs to tenant
-- (inlined in each policy to avoid extra function dependency)

create policy erp_credential_select_own
  on public.erp_credential for select
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

create policy store_select_own
  on public.store for select
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

create policy sync_job_select_own
  on public.sync_job for select
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

create policy sync_run_select_own
  on public.sync_run for select
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

create policy sales_day_agg_select_own
  on public.sales_day_agg for select
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

create policy sales_hour_agg_select_own
  on public.sales_hour_agg for select
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

-- Note: membership_store.store_id remains text (legacy erp-N / f1).
-- Remap to store.id happens when onboarding persists stores (app layer).
