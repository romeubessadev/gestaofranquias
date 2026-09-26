update public.sync_job
set status = 'FAILED', error = 'cancelled: wait for millennium session', finished_at = now()
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67' and status in ('QUEUED','RUNNING');

insert into public.sync_job (tenant_id, credential_id, kind, status, payload)
select c.tenant_id, c.id, 'BACKFILL', 'QUEUED', '{}'::jsonb
from public.erp_credential c
where c.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67';
