-- Cargo do ERP define quem é da equipe de vendas (substitui a chave manual "vendedor central").
-- Ativos com cargo ≠ VENDEDOR (ex.: GERENCIA, conta usada por freelancer/gerente) ficam cadastrados,
-- mas fora da Equipe de vendas e do ranking. Inativos ficam no ranking (ERP troca o cargo para INDEFINIDO ao desativar).
drop policy if exists store_seller_update_central on public.store_seller;
alter table public.store_seller drop column if exists is_central;

alter table public.store_seller
  add column if not exists erp_role text;

comment on column public.store_seller.erp_role is
  'CARGO da FUNCIONARIOS.Lista (upper). '''' = sem cargo no ERP; null = ainda não sincronizado com cargo.';
