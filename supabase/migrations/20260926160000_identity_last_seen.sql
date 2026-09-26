-- Último acesso real (uso do app), não só o último login do Auth (sessão fica salva por dias).

alter table public.identity add column if not exists last_seen_at timestamptz;

-- Marca o usuário logado como ativo agora; grava no máximo 1x a cada 5 min.
create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.identity
  set last_seen_at = now()
  where auth_user_id = auth.uid()
    and (last_seen_at is null or last_seen_at < now() - interval '5 minutes');
$$;

revoke all on function public.touch_last_seen() from public;
grant execute on function public.touch_last_seen() to authenticated;
