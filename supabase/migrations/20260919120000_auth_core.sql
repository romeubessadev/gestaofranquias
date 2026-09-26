-- Auth core: tenant + identity + membership (+ escopo de lojas)
-- Rodar via supabase db push ou SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.tenant (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  previous_slug text,
  name text not null,
  display_name text not null,
  logo_url text,
  brand_color text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.identity (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  cpf text unique,
  name text not null,
  status text not null default 'ACTIVE'
    check (status in ('PENDING', 'ACTIVE', 'SUSPENDED')),
  created_at timestamptz not null default now()
);

create table if not exists public.membership (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.identity (id) on delete cascade,
  tenant_id uuid not null references public.tenant (id) on delete cascade,
  role text not null
    check (role in ('ADMIN_GLOBAL', 'OWNER', 'MANAGER', 'SELLER')),
  status text not null default 'ACTIVE'
    check (status in ('PENDING', 'ACTIVE', 'DECLINED', 'SUSPENDED')),
  is_owner boolean not null default false,
  onboarding_step int,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (identity_id, tenant_id)
);

create table if not exists public.membership_store (
  membership_id uuid not null references public.membership (id) on delete cascade,
  store_id text not null,
  primary key (membership_id, store_id)
);

-- RLS
alter table public.tenant enable row level security;
alter table public.identity enable row level security;
alter table public.membership enable row level security;
alter table public.membership_store enable row level security;

-- Grant de privilégios da API (necessário se "expor tabelas automaticamente" estiver off)
grant usage on schema public to anon, authenticated;
grant select on public.tenant to anon, authenticated;
grant select on public.identity to authenticated;
grant select on public.membership to authenticated;
grant select on public.membership_store to authenticated;

-- Marca pública por slug (só campos de branding)
create policy tenant_public_brand
  on public.tenant for select
  to anon, authenticated
  using (active = true);

create policy identity_select_own
  on public.identity for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy membership_select_own
  on public.membership for select
  to authenticated
  using (
    identity_id in (
      select id from public.identity where auth_user_id = auth.uid()
    )
  );

create policy membership_store_select_own
  on public.membership_store for select
  to authenticated
  using (
    membership_id in (
      select m.id from public.membership m
      join public.identity i on i.id = m.identity_id
      where i.auth_user_id = auth.uid()
    )
  );

-- Seed demo (tenant do produto WeDash)
insert into public.tenant (slug, name, display_name)
values ('wedash', 'WeDash Demo Ltda', 'WeDash')
on conflict (slug) do nothing;
