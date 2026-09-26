-- SEED (pós-onboarding) + RANGE (sob demanda) + FORCE (período + hoje).
-- Mantém BACKFILL / FORCE_LIGHT por compatibilidade com jobs antigos.

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
      and pg_get_constraintdef(c.oid) ilike '%BACKFILL%'
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;
end $$;

alter table public.sync_job
  add constraint sync_job_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE'));

alter table public.sync_run
  add constraint sync_run_kind_check
  check (kind in ('BACKFILL', 'SEED', 'LIGHT', 'FORCE_LIGHT', 'FORCE', 'RANGE'));
