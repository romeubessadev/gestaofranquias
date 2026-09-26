-- kind CLOSE = fechamento noturno do dia anterior (D-1) pelo worker.

alter table public.sync_job drop constraint if exists sync_job_kind_check;
alter table public.sync_job
  add constraint sync_job_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE', 'HISTORY', 'CLOSE'));

alter table public.sync_run drop constraint if exists sync_run_kind_check;
alter table public.sync_run
  add constraint sync_run_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE', 'HISTORY', 'CLOSE'));
