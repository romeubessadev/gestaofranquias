-- Diagnóstico Santana: jobs + totais por dia em set/2026
with m as (
  select m.tenant_id
  from public.membership m
  join public.identity i on i.id = m.identity_id
  where lower(i.email) = lower('santanaebessaltda@gmail.com')
  limit 1
)
select sj.kind, sj.status, sj.error, sj.created_at, sj.finished_at
from public.sync_job sj
join m on m.tenant_id = sj.tenant_id
order by sj.created_at desc
limit 20;
