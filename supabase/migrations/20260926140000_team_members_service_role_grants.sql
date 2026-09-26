-- Edge team-members (service_role): convite cria identity + membership, aceite atualiza identity,
-- cancelar convite apaga membership. RLS é ignorado pelo service_role, mas o GRANT é obrigatório.

grant insert, update on public.identity to service_role;
grant insert, delete on public.membership to service_role;
