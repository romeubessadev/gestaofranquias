-- Enfileira FORCE (mês ant. → hoje) para Santana — preenche buracos dia a dia.
-- Worker precisa estar rodando com o fix de chunk=1.

with m as (
  select m.tenant_id, ec.id as credential_id
  from public.membership m
  join public.identity i on i.id = m.identity_id
  join public.erp_credential ec on ec.tenant_id = m.tenant_id
  where lower(i.email) = lower('santanaebessaltda@gmail.com')
  limit 1
)
insert into public.sync_job (tenant_id, credential_id, kind, status, payload)
select
  m.tenant_id,
  m.credential_id,
  'FORCE',
  'QUEUED',
  jsonb_build_object('from', '2026-08-01', 'to', '2026-09-21')
from m
returning id, kind, status, payload;
