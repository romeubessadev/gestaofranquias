-- Nome de pessoa e turno: primeira letra de cada palavra maiúscula, partículas (de, da, do, das, dos, e)
-- minúsculas fora do início ("Ana Paula de Souza"). Espelho de `titleName` (src/lib/format.ts).
-- Empresa fica como digitada; loja segue em caixa alta (vem do ERP).

create or replace function pg_temp.title_name(s text) returns text
language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(
    initcap(lower(regexp_replace(btrim(s), '\s+', ' ', 'g') collate "und-x-icu") collate "und-x-icu") || ' ',
    ' De ', ' de '), ' Da ', ' da '), ' Do ', ' do '), ' Das ', ' das '), ' Dos ', ' dos '), ' E ', ' e ')
$$;

create or replace function pg_temp.title_name_trim(s text) returns text
language sql immutable as $$
  select btrim(pg_temp.title_name(s))
$$;

update public.identity
set name = pg_temp.title_name_trim(name)
where name is not null and name <> pg_temp.title_name_trim(name);

update public.store_shift
set name = pg_temp.title_name_trim(name)
where name <> pg_temp.title_name_trim(name);

update public.store_seller
set name = pg_temp.title_name_trim(name)
where name <> pg_temp.title_name_trim(name);

update public.sales_seller_day_agg
set seller_name = pg_temp.title_name_trim(seller_name)
where seller_name is not null and seller_name <> pg_temp.title_name_trim(seller_name);
