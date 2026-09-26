-- Flag Millennium FILIAIS.WPINK — esconde BrandPicker em loja só cosmético.
alter table public.store
  add column if not exists has_wpink boolean not null default false;

comment on column public.store.has_wpink is
  'Loja opera WPINK (suplementos). Fonte: FILIAIS.Lista ou mapa produto→marca do sync.';
