-- Nome da empresa (tenant) em caixa alta, igual ao nome das lojas vindo do ERP.
-- Espelho da regra: companyNameCase (src/lib/format.ts).

update public.tenant
set
  name = upper(regexp_replace(btrim(name), '\s+', ' ', 'g') collate "und-x-icu"),
  display_name = case
    when display_name is null then null
    else upper(regexp_replace(btrim(display_name), '\s+', ' ', 'g') collate "und-x-icu")
  end
where name is distinct from upper(regexp_replace(btrim(name), '\s+', ' ', 'g') collate "und-x-icu")
   or display_name is distinct from upper(regexp_replace(btrim(display_name), '\s+', ' ', 'g') collate "und-x-icu");
