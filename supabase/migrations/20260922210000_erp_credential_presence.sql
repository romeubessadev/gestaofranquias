-- Presença WeDash: worker só sincroniza enquanto o app está com sessão ativa
-- (heartbeat). Depois, com worker 24/7 estável, dá para afrouxar este gate.

alter table public.erp_credential
  add column if not exists wedash_present_at timestamptz;

comment on column public.erp_credential.wedash_present_at is
  'Último heartbeat do app logado. Worker só processa se recente (MVP).';
