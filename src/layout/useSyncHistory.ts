import { useCallback, useEffect, useState } from "react";
import { fetchSyncHistory, type SyncHistoryItem } from "@/data/wedash/syncHistory";
import { SALES_SYNCED_EVENT } from "@/pages/dashboard/useForceRefresh";

const POLL_MS = 60_000;
const seenKey = (tenantId: string) => `wedash.notif.seen.${tenantId}`;
const readSeen = (tenantId: string) => Number(localStorage.getItem(seenKey(tenantId)) ?? 0);

/**
 * Histórico de sincronizações para o sino de Notificações.
 * Abrir o sino marca tudo como lido: a lista mostra o que chegou desde a abertura anterior
 * e, na próxima abertura, essas somem (só aparece o que for novo).
 * Recarrega a cada 60s, quando uma sincronização termina e ao voltar para o app (PWA).
 */
export function useSyncHistory(tenantId: string) {
  const [items, setItems] = useState<SyncHistoryItem[]>([]);
  const [seenAt, setSeenAt] = useState<number>(() => readSeen(tenantId));
  /** Início da lista exibida (lido na abertura anterior). */
  const [listSince, setListSince] = useState<number>(() => readSeen(tenantId));

  const load = useCallback(async () => {
    setItems(await fetchSyncHistory(tenantId));
  }, [tenantId]);

  useEffect(() => {
    const seen = readSeen(tenantId);
    setSeenAt(seen);
    setListSince(seen);
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    const onSynced = () => void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener(SALES_SYNCED_EVENT, onSynced);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(SALES_SYNCED_EVENT, onSynced);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tenantId, load]);

  const markSeen = useCallback(() => {
    const now = Date.now();
    setListSince(seenAt);
    localStorage.setItem(seenKey(tenantId), String(now));
    setSeenAt(now);
  }, [tenantId, seenAt]);

  return {
    /** Notificações da abertura atual (novas desde a abertura anterior). */
    items: items.filter((i) => i.at.getTime() > listSince),
    unread: items.some((i) => i.at.getTime() > seenAt),
    markSeen,
  };
}
