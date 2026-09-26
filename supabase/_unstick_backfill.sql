-- Unstick hung BACKFILL and re-queue with chunked worker.
update public.sync_job
set status = 'FAILED',
    error = 'aborted: hung on Millennium fetch; re-queued after chunk+timeout fix',
    finished_at = now()
where id = '88d57058-af24-4704-8c81-383ad92afae6'
  and status = 'RUNNING';

insert into public.sync_job (tenant_id, credential_id, kind, status, payload)
select c.tenant_id, c.id, 'BACKFILL', 'QUEUED', '{}'::jsonb
from public.erp_credential c
where c.tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
  and not exists (
    select 1 from public.sync_job j
    where j.credential_id = c.id and j.status in ('QUEUED', 'RUNNING')
  );

select id::text, kind, status, left(coalesce(error,''), 80) as error
from public.sync_job
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
order by created_at desc
limit 3;
