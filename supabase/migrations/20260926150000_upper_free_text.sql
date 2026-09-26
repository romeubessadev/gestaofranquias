-- Texto livre (nome de pessoa, turno, empresa) é gravado em caixa alta, sem espaços sobrando.
-- Normaliza o que já estava gravado.

update public.identity
set name = upper(regexp_replace(btrim(name), '\s+', ' ', 'g'))
where name is not null and name <> upper(regexp_replace(btrim(name), '\s+', ' ', 'g'));

update public.store_shift
set name = upper(regexp_replace(btrim(name), '\s+', ' ', 'g'))
where name <> upper(regexp_replace(btrim(name), '\s+', ' ', 'g'));

update public.tenant
set name = upper(regexp_replace(btrim(name), '\s+', ' ', 'g')),
    display_name = upper(regexp_replace(btrim(display_name), '\s+', ' ', 'g'))
where name <> upper(regexp_replace(btrim(name), '\s+', ' ', 'g'))
   or display_name is distinct from upper(regexp_replace(btrim(display_name), '\s+', ' ', 'g'));

update public.store_seller
set name = upper(regexp_replace(btrim(name), '\s+', ' ', 'g'))
where name <> upper(regexp_replace(btrim(name), '\s+', ' ', 'g'));

update public.sales_seller_day_agg
set seller_name = upper(regexp_replace(btrim(seller_name), '\s+', ' ', 'g'))
where seller_name is not null
  and seller_name <> upper(regexp_replace(btrim(seller_name), '\s+', ' ', 'g'));
