/**
 * Custos do Millennium sob demanda (Edge `erp-products-sync`): card "Custo dos produtos" da loja e
 * "Atualizar custos" do aviso de produtos sem custo. O catálogo de produtos se atualiza sozinho no worker.
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
  forbidden: "Seu perfil não pode atualizar os custos.",
  invalid_table: "Tabela de custo inválida.",
  invalid_period: "Período inválido.",
};

export type ProductsSyncScope =
  | { scope: "tables" }
  | { scope: "table"; tableId: number }
  | { scope: "costs"; storeIds: string[]; from: string; to: string };

type SyncResponse = { ok?: boolean; error?: string; fixed?: number; missing?: number };

/**
 * Busca no Millennium agora: `tables` = só a lista de tabelas de custo; `table` = preços de uma tabela;
 * `costs` = produtos sem custo nas lojas/período (tabela da loja + margem) — `missing` = seguem sem custo.
 */
export async function syncProductsNow(
  request: ProductsSyncScope,
): Promise<{ ok: true; fixed: number; missing: number } | { ok: false; message: string }> {
  const sb = await client();
  if (!sb) return { ok: false, message: "Sem conexão com o servidor." };
  const { data, error } = await sb.functions.invoke("erp-products-sync", { body: request });
  let body = data as SyncResponse | null;
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
  if (body?.ok === true) return { ok: true, fixed: body.fixed ?? 0, missing: body.missing ?? 0 };
  return {
    ok: false,
    message: SYNC_PRODUCTS_ERRORS[body?.error ?? ""] ?? "Não foi possível buscar os custos no Millennium. Tente de novo.",
  };
}
