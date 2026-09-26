select json_build_object(
  'by_day', (
    select coalesce(json_agg(row_to_json(t) order by t.day), '[]'::json)
    from (
      select d.day,
        round(sum(d.revenue_cents)/100.0, 2) as revenue,
        sum(d.sales_count)::int as sales
      from public.sales_day_agg d
      where d.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
        and d.brand = 'ALL'
      group by d.day
    ) t
  ),
  'by_store_today', (
    select coalesce(json_agg(row_to_json(t) order by t.millennium_store_id), '[]'::json)
    from (
      select s.millennium_store_id, s.code,
        round(sum(d.revenue_cents)/100.0, 2) as revenue,
        sum(d.sales_count)::int as sales
      from public.sales_day_agg d
      join public.store s on s.id = d.store_id
      where d.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
        and d.brand = 'ALL'
      group by s.millennium_store_id, s.code, d.day
    ) t
  ),
  'total', (
    select round(sum(revenue_cents)/100.0, 2)
    from public.sales_day_agg
    where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67' and brand = 'ALL'
  )
) as s;
