select id::text, kind, status, left(coalesce(error,''), 80) as error, locked_at
from public.sync_job
where id = '1dfce847-8977-4a4c-9fe1-566d4855ec34'
   or (tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67' and created_at > now() - interval '10 minutes')
order by created_at desc
limit 5;
