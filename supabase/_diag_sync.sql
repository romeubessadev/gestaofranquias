select id::text, kind, status, attempts, left(coalesce(error,''), 200) as error, created_at, locked_at, finished_at
from public.sync_job
order by created_at desc
limit 5;
