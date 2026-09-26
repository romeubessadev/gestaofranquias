/**
 * Período compartilhado entre as telas (useScope). sessionStorage (não localStorage):
 * fechar o app volta para "Hoje"; o logout também limpa.
 */
export const PERIOD_STORAGE_KEY = "wedash.period";

export function clearSavedPeriod() {
  try {
    sessionStorage.removeItem(PERIOD_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
