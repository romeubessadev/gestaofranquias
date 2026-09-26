-- Reset completo Santana: onboarding + vendas + jobs.
-- E-mail: santanaebessaltda@gmail.com
-- Não mexe na senha Auth.

-- 0) Resolve tenant do membership
-- 1) Apaga agregados de vendas do tenant
delete from public.sales_hour_agg sha
using public.membership m
join public.identity i on i.id = m.identity_id
where sha.tenant_id = m.tenant_id
  and lower(i.email) = lower('santanaebessaltda@gmail.com');

delete from public.sales_day_agg sda
using public.membership m
join public.identity i on i.id = m.identity_id
where sda.tenant_id = m.tenant_id
  and lower(i.email) = lower('santanaebessaltda@gmail.com');

-- 2) Escopo de lojas do membership (wizard etapa 3 confirma de novo)
delete from public.membership_store ms
using public.membership m
join public.identity i on i.id = m.identity_id
where ms.membership_id = m.id
  and lower(i.email) = lower('santanaebessaltda@gmail.com');

-- 3) Reabre wizard na etapa 2 (credencial ERP) — empresa já gravada
update public.membership m
set onboarding_step = 2
from public.identity i
where m.identity_id = i.id
  and lower(i.email) = lower('santanaebessaltda@gmail.com');

-- 4) Limpa watermark / erro pra SyncingPage esperar o novo SEED
update public.erp_credential ec
set
  last_success_at = null,
  last_light_sync_at = null,
  last_error = null,
  last_error_at = null,
  status = case when ec.status = 'INVALID' then 'VALID' else ec.status end
from public.membership m
join public.identity i on i.id = m.identity_id
where ec.tenant_id = m.tenant_id
  and lower(i.email) = lower('santanaebessaltda@gmail.com');

-- 5) Cancela jobs abertos + marca antigos como reset
update public.sync_job sj
set status = 'FAILED',
    error = 'reset onboarding (teste history 24m)',
    finished_at = now()
from public.membership m
join public.identity i on i.id = m.identity_id
where sj.tenant_id = m.tenant_id
  and lower(i.email) = lower('santanaebessaltda@gmail.com')
  and sj.status in ('QUEUED', 'RUNNING');

select
  i.email,
  m.onboarding_step,
  ec.status as erp_status,
  ec.last_success_at,
  ec.last_light_sync_at,
  (select count(*) from public.membership_store ms where ms.membership_id = m.id) as stores,
  (select count(*) from public.sales_day_agg s where s.tenant_id = m.tenant_id) as day_rows,
  (select count(*) from public.sales_hour_agg s where s.tenant_id = m.tenant_id) as hour_rows
from public.identity i
join public.membership m on m.identity_id = i.id
left join public.erp_credential ec on ec.tenant_id = m.tenant_id
where lower(i.email) = lower('santanaebessaltda@gmail.com');
