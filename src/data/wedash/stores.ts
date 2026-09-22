export type PointType = "SHOPPING" | "RUA";
export type Division = "WEPINK" | "WPINK";

export interface Store {
  id: string;
  millenniumFilial: number;
  codFilial: string;
  nome: string;
  fantasia: string;
  cnpj: string;
  cidade: string;
  uf: string;
  tipo: "M" | "F";
  pointType: PointType;
  temWpink: boolean;
  fuso: string;
  /** Hora de abertura e fechamento (hora cheia). */
  abertura: number;
  fechamento: number;
  /** Dias da semana fechados (0 = domingo). */
  diasFechados: number[];
  dataInauguracao: string;
}

export const stores: Store[] = [
  {
    id: "f1",
    millenniumFilial: 8,
    codFilial: "00008",
    nome: "ESSENCIA PERFUMARIA CG SHOPPING",
    fantasia: "Shopping Campo Grande",
    cnpj: "45.812.330/0001-19",
    cidade: "Campo Grande",
    uf: "MS",
    tipo: "M",
    pointType: "SHOPPING",
    temWpink: false,
    fuso: "America/Campo_Grande",
    abertura: 10,
    fechamento: 22,
    diasFechados: [],
    dataInauguracao: "2024-03-14",
  },
  {
    id: "f2",
    millenniumFilial: 10,
    codFilial: "00010",
    nome: "ESSENCIA PERFUMARIA TRES LAGOAS",
    fantasia: "Shopping Três Lagoas",
    cnpj: "45.812.330/0002-08",
    cidade: "Três Lagoas",
    uf: "MS",
    tipo: "F",
    pointType: "RUA",
    temWpink: true,
    fuso: "America/Campo_Grande",
    abertura: 8,
    fechamento: 18,
    diasFechados: [0],
    dataInauguracao: "2025-06-02",
  },
];

export function storeById(id: string): Store {
  const f = allStores().find((x) => x.id === id) ?? stores.find((x) => x.id === id);
  if (!f) throw new Error(`Filial não encontrada: ${id}`);
  return f;
}

/** Casa lojas do Millennium com o catálogo local (millenniumFilial → id). */
export function storeIdsFromErp(
  lista: {
    storeId: number;
    tradeName?: string;
    taxId?: string;
    code?: string;
    name?: string;
    type?: "M" | "F";
    hasWpink?: boolean;
    openedAt?: string;
    city?: string;
    state?: string;
  }[],
): string[] {
  const ids: string[] = [];
  for (const e of lista) {
    const hit = stores.find((f) => f.millenniumFilial === e.storeId);
    if (hit) {
      if (!ids.includes(hit.id)) ids.push(hit.id);
      continue;
    }
    const id = `erp-${e.storeId}`;
    if (!ids.includes(id)) ids.push(id);
    registerExtraStore({
      id,
      millenniumFilial: e.storeId,
      codFilial: e.code ?? String(e.storeId).padStart(5, "0"),
      nome: e.name ?? e.tradeName ?? id,
      fantasia: e.tradeName ?? e.name ?? id,
      cnpj: e.taxId ?? "",
      cidade: e.city ?? "",
      uf: e.state ?? "",
      tipo: e.type ?? "F",
      pointType: "RUA",
      temWpink: Boolean(e.hasWpink),
      fuso: "America/Sao_Paulo",
      abertura: 9,
      fechamento: 21,
      diasFechados: [0],
      dataInauguracao: e.openedAt ?? "2024-01-01",
    });
  }
  return ids;
}

const CHAVE_EXTRAS = "wedash-filiais-extra";

function lerExtras(): Store[] {
  try {
    const raw = window.localStorage.getItem(CHAVE_EXTRAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Store[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function registerExtraStore(f: Store) {
  try {
    const atuais = lerExtras().filter((x) => x.id !== f.id);
    window.localStorage.setItem(CHAVE_EXTRAS, JSON.stringify([...atuais, f]));
  } catch {
    /* ignore */
  }
}

/** Catálogo completo: fixtures + extras vindas do ERP (localStorage). */
export function allStores(): Store[] {
  const map = new Map(stores.map((f) => [f.id, f]));
  for (const e of lerExtras()) map.set(e.id, e);
  return [...map.values()];
}

/**
 * Lojas do produto para filtros/ranking.
 * Se já hidratou ERP (UUIDs), ignora fixtures mock — senão "Todas" misturava f1/f2.
 */
export function productStores(): Store[] {
  const extras = lerExtras();
  return extras.length > 0 ? extras : stores;
}

/** Lojas da sessão: só ids que o membership enxerga (UUIDs reais pós-ERP). */
export function storesForSession(sessionStoreIds: string[]): Store[] {
  if (sessionStoreIds.length === 0) return [];
  const catalog = allStores();
  const hit = catalog.filter((f) => sessionStoreIds.includes(f.id));
  if (hit.length > 0) return hit;
  // Demo: sessão ainda aponta para fixtures f1/f2.
  return stores.filter((f) => sessionStoreIds.includes(f.id));
}

function rowToStore(r: {
  id: string;
  millennium_store_id: number;
  code: string | null;
  name: string | null;
  trade_name: string | null;
  timezone: string | null;
  opened_at?: string | null;
}): Store {
  return {
    id: r.id,
    millenniumFilial: r.millennium_store_id,
    codFilial: r.code || String(r.millennium_store_id).padStart(5, "0"),
    nome: r.name || r.trade_name || r.code || r.id,
    fantasia: r.trade_name || r.name || r.code || r.id,
    cnpj: "",
    cidade: "",
    uf: "",
    tipo: "F",
    pointType: "RUA",
    temWpink: false,
    fuso: r.timezone || "America/Campo_Grande",
    abertura: 9,
    fechamento: 21,
    diasFechados: [0],
    dataInauguracao: r.opened_at ? String(r.opened_at).slice(0, 10) : "2024-01-01",
  };
}

/**
 * Carrega lojas do Postgres (UUIDs da membership) e registra no catálogo local.
 * Sem isso o StorePicker cai no mock f1/f2 e o useScope rejeita a seleção.
 */
export async function hydrateSessionStores(
  tenantId: string,
  sessionStoreIds: string[],
): Promise<Store[]> {
  if (sessionStoreIds.length === 0) return [];
  const already = storesForSession(sessionStoreIds);
  if (already.length === sessionStoreIds.length) return already;

  try {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return already;

    let q = sb
      .from("store")
      .select("id, millennium_store_id, code, name, trade_name, timezone, opened_at")
      .eq("tenant_id", tenantId)
      .eq("active", true);
    if (sessionStoreIds.length > 0) q = q.in("id", sessionStoreIds);

    const { data, error } = await q.order("code");
    if (error || !data?.length) {
      if (error) console.warn("hydrateSessionStores:", error.message);
      return already;
    }

    const out: Store[] = [];
    for (const raw of data) {
      const s = rowToStore(raw as Parameters<typeof rowToStore>[0]);
      registerExtraStore(s);
      out.push(s);
    }
    return out.length > 0 ? out : already;
  } catch (e) {
    console.warn("hydrateSessionStores:", e);
    return already;
  }
}

export interface Grupo {
  id: string;
  filialId: string;
  nome: string;
  horaInicio: number;
  horaFim: number;
}

export const grupos: Grupo[] = [
  { id: "t-f1-manha", filialId: "f1", nome: "Grupo 1", horaInicio: 0, horaFim: 16 },
  { id: "t-f1-tarde", filialId: "f1", nome: "Grupo 2", horaInicio: 16, horaFim: 24 },
  { id: "t-f2-manha", filialId: "f2", nome: "Grupo 1", horaInicio: 0, horaFim: 13 },
  { id: "t-f2-tarde", filialId: "f2", nome: "Grupo 2", horaInicio: 13, horaFim: 24 },
];

export interface Tarefa {
  id: string;
  filialId: string;
  grupoId: string;
  titulo: string;
  ordem: number;
}

export const tarefas: Tarefa[] = [
  { id: "tf1", filialId: "f1", grupoId: "t-f1-manha", titulo: "Abrir caixa e conferir fundo de troco", ordem: 1 },
  { id: "tf2", filialId: "f1", grupoId: "t-f1-manha", titulo: "Reposição da vitrine de perfumaria", ordem: 2 },
  { id: "tf3", filialId: "f1", grupoId: "t-f1-manha", titulo: "Testar provadores e repor blotters", ordem: 3 },
  { id: "tf4", filialId: "f1", grupoId: "t-f1-manha", titulo: "Conferir etiquetas de preço da promoção", ordem: 4 },
  { id: "tf5", filialId: "f1", grupoId: "t-f1-manha", titulo: "Limpeza das prateleiras de body splash", ordem: 5 },
  { id: "tf6", filialId: "f1", grupoId: "t-f1-tarde", titulo: "Passagem de grupo: caixa e pendências", ordem: 1 },
  { id: "tf7", filialId: "f1", grupoId: "t-f1-tarde", titulo: "Reposição de estoque na loja", ordem: 2 },
  { id: "tf8", filialId: "f1", grupoId: "t-f1-tarde", titulo: "Organizar kits de presente", ordem: 3 },
  { id: "tf9", filialId: "f1", grupoId: "t-f1-tarde", titulo: "Fechamento de caixa e sangria", ordem: 4 },
  { id: "tf10", filialId: "f2", grupoId: "t-f2-manha", titulo: "Abrir loja e conferir fundo de troco", ordem: 1 },
  { id: "tf11", filialId: "f2", grupoId: "t-f2-manha", titulo: "Conferir vitrine externa", ordem: 2 },
  { id: "tf12", filialId: "f2", grupoId: "t-f2-manha", titulo: "Repor suplementos WPINK no expositor", ordem: 3 },
  { id: "tf13", filialId: "f2", grupoId: "t-f2-manha", titulo: "Registrar temperatura do estoque", ordem: 4 },
  { id: "tf14", filialId: "f2", grupoId: "t-f2-tarde", titulo: "Passagem de grupo", ordem: 1 },
  { id: "tf15", filialId: "f2", grupoId: "t-f2-tarde", titulo: "Reposição de perfumaria", ordem: 2 },
  { id: "tf16", filialId: "f2", grupoId: "t-f2-tarde", titulo: "Fechamento de caixa", ordem: 3 },
];

export interface Categoria {
  id: number;
  nome: string;
  divisao: Division;
  /** CMV como fração do preço de venda (custo de fábrica com imposto). */
  cmvPct: number;
}

/** Categorias por TIPO do ERP, agrupadas por id. */
export const categorias: Categoria[] = [
  { id: 1, nome: "Perfumaria", divisao: "WEPINK", cmvPct: 0.3 },
  { id: 2, nome: "Body Splash", divisao: "WEPINK", cmvPct: 0.27 },
  { id: 3, nome: "Body Cream", divisao: "WEPINK", cmvPct: 0.31 },
  { id: 4, nome: "Hair", divisao: "WEPINK", cmvPct: 0.34 },
  { id: 5, nome: "Skincare", divisao: "WEPINK", cmvPct: 0.36 },
  { id: 6, nome: "Make", divisao: "WEPINK", cmvPct: 0.38 },
  { id: 7, nome: "Kits e presentes", divisao: "WEPINK", cmvPct: 0.33 },
  { id: 8, nome: "Suplementos", divisao: "WPINK", cmvPct: 0.42 },
];

export const paymentMethods = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export interface StoreConfig {
  filialId: string;
  impostoSobreCustoPct: number;
  margemMinimaPct: number | null;
}

export const storeConfigs: StoreConfig[] = [
  { filialId: "f1", impostoSobreCustoPct: 4, margemMinimaPct: 55 },
  { filialId: "f2", impostoSobreCustoPct: 4, margemMinimaPct: null },
];
