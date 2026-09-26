-- Edge Functions (service_role) need DML/SELECT on auth tables.
-- RLS is bypassed by service_role, but table GRANTs are still required.
-- Without these, erp-credential-persist / erp-sync-enqueue return identity_not_found.

grant select on public.identity to service_role;
grant select, update on public.membership to service_role;
grant select, insert, delete on public.membership_store to service_role;
grant select, update on public.tenant to service_role;
