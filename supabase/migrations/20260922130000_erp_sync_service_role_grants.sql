-- Worker (service_role) needs full DML on sync + aggregate tables.
-- RLS is bypassed by service_role, but table GRANTs are still required.

grant select, insert, update, delete on public.erp_credential to service_role;
grant select, insert, update, delete on public.store to service_role;
grant select, insert, update, delete on public.sync_job to service_role;
grant select, insert, update, delete on public.sync_run to service_role;
grant select, insert, update, delete on public.sales_day_agg to service_role;
grant select, insert, update, delete on public.sales_hour_agg to service_role;

-- Sequences if any (uuid defaults use gen_random_uuid — no sequences required)
