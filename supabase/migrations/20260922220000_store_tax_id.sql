-- CNPJ da loja (Millennium CGC) — StorePicker / Topbar.
alter table public.store
  add column if not exists tax_id text;

comment on column public.store.tax_id is
  'CNPJ/CGC da filial no Millennium (exibição no seletor de loja).';
