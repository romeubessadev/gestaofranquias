select s.millennium_store_id, d.day,
  round(d.revenue_cents/100.0, 2) as revenue,
  d.sales_count, d.item_count
from public.sales_day_agg d
join public.store s on s.id = d.store_id
where d.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
  and d.day = '2026-09-10'
  and d.brand = 'ALL'
order by 1;
