-- Clear inflated aggs and re-queue BACKFILL after EVENTO filter fix.
delete from public.sales_hour_agg
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67';

delete from public.sales_day_agg
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67';

update public.sync_job
set status = 'FAILED',
    error = 'cancelled: re-sync with EVENTO whitelist',
    finished_at = now()
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
  and status in ('QUEUED', 'RUNNING');

update public.erp_credential
set last_light_sync_at = null,
    last_success_at = null
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67';

insert into public.sync_job (tenant_id, credential_id, kind, status, payload)
select c.tenant_id, c.id, 'BACKFILL', 'QUEUED', '{}'::jsonb
from public.erp_credential c
where c.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67';

select id::text, kind, status from public.sync_job
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
order by created_at desc limit 3;
