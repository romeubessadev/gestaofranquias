-- Lojas + dias distintos + sample revenue
with m as (
  select m.tenant_id
  from public.membership m
  join public.identity i on i.id = m.identity_id
  where lower(i.email) = lower('santanaebessaltda@gmail.com')
  limit 1
)
select s.code, s.millennium_store_id, s.id,
  (select count(distinct d.day) from public.sales_day_agg d where d.store_id = s.id) as days,
  (select coalesce(sum(d.revenue_cents),0)/100.0 from public.sales_day_agg d where d.store_id = s.id) as brl
from public.store s
join m on m.tenant_id = s.tenant_id
where s.active = true
order by s.code;
