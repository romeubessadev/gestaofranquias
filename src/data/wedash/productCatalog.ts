/**
 * Configurações > Produtos — cadastro de produtos da rede (product_catalog, global) com o custo
 * das tabelas de custo do Millennium. "Atualizar" = Edge `erp-products-sync` (catálogo + tabelas + preços).
 */
import { brandFromProductCode } from "./costTableFill";

export interface CatalogProductRow {
  code: string;
  description: string;
  category: string;
  brand: "WEPINK" | "WPINK";
}

const PAGE = 1000;

async function client() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

export async function fetchCatalogProducts(): Promise<CatalogProductRow[]> {
  const sb = await client();
  if (!sb) return [];
  const { data: types, error: typeErr } = await sb.from("product_type").select("type_id, description");
  if (typeErr) throw typeErr;
  const typeName = new Map((types ?? []).map((t) => [Number(t.type_id), String(t.description ?? "")]));
  const out: CatalogProductRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("product_catalog")
      .select("product_code, description, type_id")
      .order("description")
      .order("product_code")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data ?? []) {
      const code = String(r.product_code);
      out.push({
        code,
        description: String(r.description ?? ""),
        category: r.type_id == null ? "" : typeName.get(Number(r.type_id)) ?? "",
        brand: brandFromProductCode(code),
      });
    }
    if (!data || data.length < PAGE) break;
  }
  return out;
}

/** COD_PRODUTO → custo unitário em reais na tabela. */
export async function fetchCostTablePrices(tableId: number): Promise<Map<string, number>> {
  const sb = await client();
  const out = new Map<string, number>();
  if (!sb) return out;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("product_cost_table_price")
      .select("product_code, unit_cost_cents")
      .eq("table_id", tableId)
      .order("product_code")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of data ?? []) out.set(String(r.product_code), Number(r.unit_cost_cents) / 100);
    if (!data || data.length < PAGE) break;
  }
  return out;
}

/** Tabela mais usada pelas lojas do tenant (null = nenhuma loja com tabela). */
export async function fetchMostUsedCostTable(tenantId: string): Promise<number | null> {
  const sb = await client();
  if (!sb) return null;
  const { data, error } = await sb
    .from("store")
    .select("cost_table_id")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .not("cost_table_id", "is", null);
  if (error) throw error;
  const count = new Map<number, number>();
  for (const r of data ?? []) {
    const id = Number(r.cost_table_id);
    count.set(id, (count.get(id) ?? 0) + 1);
  }
  let best: number | null = null;
  for (const [id, n] of count) if (best == null || n > (count.get(best) ?? 0)) best = id;
  return best;
}

export async function fetchProductsRefreshedAt(): Promise<string | null> {
  const sb = await client();
  if (!sb) return null;
  const { data, error } = await sb.from("product_catalog_sync").select("refreshed_at").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data?.refreshed_at as string | null) ?? null;
}

const SYNC_PRODUCTS_ERRORS: Record<string, string> = {
  credential_missing: "Conecte o Millennium em Configurações > Integrações.",
  credential_invalid: "Senha do Millennium inválida. Reconecte em Configurações > Integrações.",
  integration_paused: "Integração desconectada. Conecte o Millennium em Configurações > Integrações.",
  erp_busy: "Millennium ocupado (limite de sessões). Tente de novo em instantes.",
  busy: "Os produtos já estão sendo atualizados. Tente de novo em alguns minutos.",
  forbidden: "Seu perfil não pode atualizar os produtos.",
};

/**
 * Busca no Millennium agora (Edge `erp-products-sync`): `all` = catálogo + tabelas de custo + preços;
 * `costs` = só tabelas de custo + preços.
 */
export async function syncProductsNow(
  scope: "all" | "costs" = "all",
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sb = await client();
  if (!sb) return { ok: false, message: "Sem conexão com o servidor." };
  const { data, error } = await sb.functions.invoke("erp-products-sync", { body: { scope } });
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
    message: SYNC_PRODUCTS_ERRORS[body?.error ?? ""] ?? "Não foi possível atualizar os produtos no Millennium. Tente de novo.",
  };
}
