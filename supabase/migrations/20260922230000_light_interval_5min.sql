-- LIGHT a cada 5 min (mesmo cooldown do botão Atualizar / FORCE).
-- FORCE bem-sucedido já grava last_light_sync_at → reinicia a janela.

alter table public.erp_credential
  alter column light_interval_min set default 5;

update public.erp_credential
set light_interval_min = 5
where light_interval_min is distinct from 5;
