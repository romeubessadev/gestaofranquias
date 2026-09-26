-- Sessão Millennium vinculada à credencial do tenant (não ao processo do worker).
-- sync_paused: usuário libera o ERP; worker não claima jobs até retomar.

alter table public.erp_credential
  add column if not exists millennium_session text,
  add column if not exists millennium_session_at timestamptz,
  add column if not exists millennium_session_by text
    check (millennium_session_by is null or millennium_session_by in ('worker', 'app')),
  add column if not exists sync_paused boolean not null default false;

comment on column public.erp_credential.millennium_session is
  'Token WTS-Session ativo (WeDash). Logout/reclaim usa este valor.';
comment on column public.erp_credential.sync_paused is
  'true = usuário pausou sync (pode usar o ERP); worker não processa jobs desta credencial.';
