-- Cancel queued LIGHT spam while Millennium session is busy.
update public.sync_job
set status = 'FAILED',
    error = 'cancelled: millennium session busy backoff',
    finished_at = now()
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
  and status = 'QUEUED';

select id::text, kind, status, left(coalesce(error,''), 100) as error
from public.sync_job
where tenant_id = 'ac84ee2c-c12f-45fd-853b-74caf47f0f67'
order by created_at desc
limit 8;
