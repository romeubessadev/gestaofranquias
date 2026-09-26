/**
 * Tabelas de custo do Millennium sob demanda (Edge `erp-products-sync`), usado no card
 * "Custo dos produtos" da loja. O catálogo de produtos se atualiza sozinho no worker.
 */

async function client() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

const SYNC_PRODUCTS_ERRORS: Record<string, string> = {
  credential_missing: "Conecte o Millennium em Configurações > Integrações.",
  credential_invalid: "Senha do Millennium inválida. Reconecte em Configurações > Integrações.",
  integration_paused: "Integração desconectada. Conecte o Millennium em Configurações > Integrações.",
  erp_busy: "Millennium ocupado (limite de sessões). Tente de novo em instantes.",
  busy: "Os produtos já estão sendo atualizados. Tente de novo em alguns minutos.",
  forbidden: "Seu perfil não pode atualizar as tabelas de custo.",
  invalid_table: "Tabela de custo inválida.",
};

export type ProductsSyncScope = { scope: "tables" } | { scope: "table"; tableId: number };

/** Busca no Millennium agora: `tables` = só a lista de tabelas de custo; `table` = preços de uma tabela. */
export async function syncProductsNow(
  request: ProductsSyncScope,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sb = await client();
  if (!sb) return { ok: false, message: "Sem conexão com o servidor." };
  const { data, error } = await sb.functions.invoke("erp-products-sync", { body: request });
  let body = data as { ok?: boolean; error?: string } | null;
  if ((!body || typeof body !== "object") && error && typeof error === "object") {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        body = (await ctx.json()) as typeof body;
      } catch {
        /* ignore */
      }
    }
  }
  if (body?.ok === true) return { ok: true };
  return {
    ok: false,
    message: SYNC_PRODUCTS_ERRORS[body?.error ?? ""] ?? "Não foi possível buscar as tabelas de custo no Millennium. Tente de novo.",
  };
}
