-- Totais Santana por dia (setembro)
with m as (
  select m.tenant_id
  from public.membership m
  join public.identity i on i.id = m.identity_id
  where lower(i.email) = lower('santanaebessaltda@gmail.com')
  limit 1
)
select
  d.day,
  sum(d.revenue_cents) / 100.0 as revenue_brl,
  sum(d.sales_count) as sales
from public.sales_day_agg d
join m on m.tenant_id = d.tenant_id
where d.day >= '2026-09-01'
group by d.day
order by d.day;
