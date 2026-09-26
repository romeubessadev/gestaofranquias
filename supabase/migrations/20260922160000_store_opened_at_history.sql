-- opened_at (DATA_INAUGURACAO) + kind HISTORY (backfill mês a mês até teto 24m).

alter table public.store
  add column if not exists opened_at date;

do $$
declare
  r record;
begin
  for r in
    select c.conname, c.conrelid::regclass as tbl
    from pg_constraint c
    join pg_class rel on rel.oid = c.conrelid
    join pg_namespace n on n.oid = rel.relnamespace
    where n.nspname = 'public'
      and rel.relname in ('sync_job', 'sync_run')
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%SEED%'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

alter table public.sync_job
  add constraint sync_job_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE', 'HISTORY'));

alter table public.sync_run
  add constraint sync_run_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE', 'HISTORY'));
