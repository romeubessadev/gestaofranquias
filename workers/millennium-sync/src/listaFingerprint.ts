/**
 * Impressão digital da VENDAS.Lista de hoje por loja — o Atualizar compara com a da última rodada
 * completa e, se nada mudou, pula Produtos por cupom e Marca/CMV (1 chamada ao ERP em vez de 3).
 * Fica em memória: reiniciar o worker = próxima rodada de cada loja completa.
 */
import { createHash } from "node:crypto";
import type { SaleRow } from "../../../src/data/wedash/salesTypes.ts";

type ListaRow = SaleRow & { nf?: unknown; tipoOperacao?: unknown };

/** `dia:nº de linhas:hash` — muda com venda nova, cancelada, valor, itens, forma de pagamento ou vendedora. */
export function listaFingerprint(day: string, rows: ListaRow[]): string {
  const lines = rows
    .map((r) =>
      [
        r.operationCode,
        String(r.nf ?? ""),
        String(r.tipoOperacao ?? ""),
        r.occurredAt.toISOString(),
        r.revenueCents,
        r.itemQty,
        r.paymentMethod ?? "",
        r.sellerName ?? "",
      ].join("|"),
    )
    .sort();
  const hash = createHash("sha1").update(lines.join("\n")).digest("hex").slice(0, 16);
  return `${day}:${rows.length}:${hash}`;
}

export type ListaMemo = {
  get: (storeId: string) => string | undefined;
  set: (storeId: string, fingerprint: string) => void;
  forget: (storeId: string) => void;
};

export function createListaMemo(): ListaMemo {
  const map = new Map<string, string>();
  return {
    get: (id) => map.get(id),
    set: (id, fp) => void map.set(id, fp),
    forget: (id) => void map.delete(id),
  };
}
