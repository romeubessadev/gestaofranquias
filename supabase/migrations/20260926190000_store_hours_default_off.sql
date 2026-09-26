-- Loja nova nasce com todos os dias desligados (horário não configurado).
-- O gestor preenche em Configurações > Lojas (futuro "Primeiros passos").
-- Enquanto nenhum dia estiver aberto, sync automático e eixos usam 10:00–22:00
-- (autoRefresh.parseStoreHours / storeHours.effectiveWeekHours). Lojas existentes não mudam.

alter table public.store
  alter column hours set default '{
    "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null
  }'::jsonb;
