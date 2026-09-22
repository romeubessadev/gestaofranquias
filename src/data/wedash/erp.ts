/**
 * Chamadas ao ERP Millennium.
 * - Com Supabase: Edge Function `millennium-onboarding` (login + stores + logout).
 * - Sem Supabase: mock local (senhas demos: errada / ocupado / falha).
 */
import { stores, type Store } from "./stores";
import { getSupabase } from "@/lib/supabase";

function esperar(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export interface StoreErp {
  storeId: number;
  code: string;
  name: string;
  tradeName: string;
  taxId: string;
  city: string;
  state: string;
  franchise: string;
  type: "M" | "F";
  hasWpink: boolean;
  openedAt: string;
}

export type ErpLoginResult =
  | { ok: true; session?: string; stores: StoreErp[] }
  | { ok: false; reason: "password" | "busy" | "other" | "stores" };

type EdgeResponse =
  | { ok: true; session: string; stores?: StoreErp[] }
  | { ok: false; reason: "password" | "busy" | "other" | "stores" }
  | { ok: true }
  | { error: string };

function storesMock(): StoreErp[] {
  return stores.map(
    (f: Store): StoreErp => ({
      storeId: f.millenniumFilial,
      code: f.codFilial,
      name: f.nome,
      tradeName: f.fantasia,
      taxId: f.cnpj,
      city: f.cidade,
      state: f.uf,
      franchise: "WEPINK",
      type: f.tipo,
      hasWpink: f.temWpink,
      openedAt: f.dataInauguracao,
    }),
  );
}

/**
 * Login + FILIAIS.Lista no ERP.
 * Antes de logar, a Edge libera sessão WeDash salva (reclaim) — busy do nosso sync some sem o usuário ver.
 * Demo (sem Edge): senha "errada" | "ocupado" | "falha"; qualquer outra → ok + mock.
 */
export async function testErpLogin(usuario: string, senha: string): Promise<ErpLoginResult> {
  const u = usuario.trim();
  if (!u || !senha) return { ok: false, reason: "password" };

  const sb = getSupabase();
  if (sb) {
    // Libera sessão do tenant antes (idempotente).
    try {
      await sb.functions.invoke("millennium-onboarding", { body: { action: "release" } });
    } catch {
      /* best-effort */
    }
    await esperar(400);

    const attempt = async () =>
      sb.functions.invoke<EdgeResponse>("millennium-onboarding", {
        body: { username: u, password: senha, includeStores: true, keepSession: true },
      });

    let { data, error } = await attempt();
    if (data && typeof data === "object" && "ok" in data && data.ok === false && data.reason === "busy") {
      // Ainda busy (ERP desktop ou órfão sem token) — release de novo + 1 retry curto.
      try {
        await sb.functions.invoke("millennium-onboarding", { body: { action: "release" } });
      } catch {
        /* ignore */
      }
      await esperar(1500);
      ({ data, error } = await attempt());
    }
    if (data && typeof data === "object" && "ok" in data) {
      if (data.ok === true && "session" in data) {
        return {
          ok: true,
          session: data.session || undefined,
          stores: Array.isArray(data.stores) ? data.stores : [],
        };
      }
      if (data.ok === false) return { ok: false, reason: data.reason };
    }
    console.warn("millennium-onboarding:", error?.message ?? data);
    return { ok: false, reason: "other" };
  }

  await esperar(1400);
  const s = senha.trim().toLowerCase();
  if (s === "errada") return { ok: false, reason: "password" };
  if (s === "ocupado") return { ok: false, reason: "busy" };
  if (s === "falha") return { ok: false, reason: "other" };
  return { ok: true, session: "mock-session", stores: storesMock() };
}

/** Encerra a sessão no ERP (voltar no wizard / desconectar). Best-effort.
 * Não chamar ao confirmar lojas — o token fica no tenant p/ o worker. */
export async function logoutErp(session: string | undefined): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.functions.invoke("millennium-onboarding", {
      body: { action: "logout", session: session ?? "" },
    });
  } catch (e) {
    console.warn("millennium-onboarding logout:", e);
  }
}

/** Libera sessão WeDash no Millennium + (opcional) pausa o sync do worker. */
export async function releaseErpSession(opts?: { pauseSync?: boolean }): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.functions.invoke("millennium-onboarding", {
      body: { action: opts?.pauseSync ? "pause" : "release" },
    });
  } catch (e) {
    console.warn("millennium-onboarding release:", e);
  }
}

export async function resumeErpSync(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.functions.invoke("millennium-onboarding", { body: { action: "resume" } });
  } catch (e) {
    console.warn("millennium-onboarding resume:", e);
  }
}

export type ErpIntegrationStatus = {
  username: string;
  status: string;
  syncPaused: boolean;
  dedicated: boolean;
  lastSuccessAt: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  lastLightSyncAt: string | null;
};

/** Lê estado da integração (sem senha) para Configurações > Integração ERP. */
export async function fetchErpIntegrationStatus(
  tenantId: string,
): Promise<ErpIntegrationStatus | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("erp_credential")
    .select(
      "username, status, sync_paused, dedicated, last_success_at, last_error, last_error_at, last_light_sync_at",
    )
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) {
    console.warn("fetchErpIntegrationStatus:", error.message);
    return null;
  }
  if (!data) return null;
  const row = data as {
    username: string;
    status: string;
    sync_paused?: boolean | null;
    dedicated?: boolean | null;
    last_success_at?: string | null;
    last_error?: string | null;
    last_error_at?: string | null;
    last_light_sync_at?: string | null;
  };
  return {
    username: row.username,
    status: row.status,
    syncPaused: Boolean(row.sync_paused),
    dedicated: Boolean(row.dedicated),
    lastSuccessAt: row.last_success_at ?? null,
    lastError: row.last_error ?? null,
    lastErrorAt: row.last_error_at ?? null,
    lastLightSyncAt: row.last_light_sync_at ?? null,
  };
}

/** Marca presença WeDash (heartbeat). Worker só synca com presença recente. */
export async function touchErpPresence(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.functions.invoke("millennium-onboarding", { body: { action: "presence" } });
  } catch {
    /* best-effort — sem credencial ainda (pré-onboarding) */
  }
}

/** Pausar sync + logout no Millennium (sair da WeDash). Precisa do JWT ainda válido. */
export async function pauseErpForLogout(): Promise<void> {
  await releaseErpSession({ pauseSync: true });
}

/** Preferir lojas já trazidas no login; fallback mock só sem sessão. */
export async function listErpStores(precarregadas?: StoreErp[]): Promise<StoreErp[]> {
  if (precarregadas) return precarregadas;
  await esperar(900);
  return storesMock();
}

const SLUGS_OCUPADOS = ["wepink", "vela", "perfumaria", "loja"];
/** Paths do produto + infra — não podem ser slug de tenant (`wedash.app/{slug}`). */
const SLUGS_RESERVADOS = [
  "www",
  "api",
  "app",
  "admin",
  "static",
  "assets",
  "cdn",
  "mail",
  "ftp",
  "status",
  "suporte",
  "painel",
  "login",
  "forgot",
  "reset",
  "invite",
  "install",
  "change-password",
  "onboarding",
  "dashboard",
  "goals",
  "live",
  "analytics",
  "profile",
  "settings",
  "my-goal",
  "tasks",
  "ranking",
  "auth",
];

export type SlugStatus = "disponivel" | "ocupado" | "reservado" | "invalido" | "vazio";

export function validateSlug(slug: string): SlugStatus {
  if (!slug) return "vazio";
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) return "invalido";
  if (SLUGS_RESERVADOS.includes(slug)) return "reservado";
  if (SLUGS_OCUPADOS.includes(slug)) return "ocupado";
  return "disponivel";
}

export async function checkSlug(slug: string): Promise<SlugStatus> {
  await esperar(450);
  return validateSlug(slug);
}

/** Gera slug a partir do nome da empresa (sem edição manual no onboarding). */
export function slugifyCompanyName(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Escolhe o primeiro slug livre a partir do nome (base, base-2, base-3…).
 * Se o nome não gerar base válida, usa `empresa`.
 */
export async function allocateSlugFromName(nome: string): Promise<string | null> {
  let base = slugifyCompanyName(nome);
  if (base.length < 2) base = "empresa";
  // Garante formato válido mínimo (letra/número nas pontas).
  if (!/^[a-z0-9]/.test(base)) base = `e-${base}`;
  base = base.slice(0, 36);

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`.slice(0, 40);
    const status = validateSlug(candidate);
    if (status === "disponivel") {
      await esperar(200);
      return candidate;
    }
  }
  return null;
}
