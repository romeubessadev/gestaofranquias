-- Itens vendidos por vendedora/dia (QUANTIDADE da VENDAS.Lista) → P.A. no Destaques da equipe.
-- Linhas antigas ficam 0 até o dia ser regravado pelo worker.
alter table public.sales_seller_day_agg
  add column if not exists item_count integer not null default 0;
