import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/data/wedash/team";
import { getSupabase } from "@/lib/supabase";
import { paths } from "@/router/paths";
import {
  emRecovery,
  limparRecovery,
  logoutAuth,
  marcarRecovery,
  sessionFromPersistedAuth,
} from "@/session/authApi";
import { roleLabel, sessionFromUser, type Session } from "@/session/session";

export type { Session };
export { roleLabel, sessionFromUser };

interface SessionContextValue {
  session: Session | null;
  ready: boolean;
  signIn: (usuario: User) => Session;
  applySession: (s: Session) => void;
  signOut: () => void;
  update: (patch: Partial<Session>) => void;
}

const CHAVE = "wedash-session";
const CHAVE_LEGACY = "wedash-sessao";

const Contexto = createContext<SessionContextValue | null>(null);

function migrateLegacySession(raw: Record<string, unknown>): Session {
  return {
    membershipId: (raw.membershipId ?? raw.vinculoId) as string,
    name: (raw.name ?? raw.nome) as string,
    cpf: raw.cpf as string,
    email: raw.email as string,
    role: raw.role as Session["role"],
    isOwner: Boolean(raw.isOwner ?? raw.proprietario),
    stores: (raw.stores as string[]) ?? [],
    collaboratorId: (raw.collaboratorId ?? raw.colaboradorId ?? null) as string | null,
    onboardingStep: (raw.onboardingStep ?? raw.onboardingEtapa ?? null) as number | null,
    temporaryPassword: Boolean(raw.temporaryPassword ?? raw.senhaTemporaria),
    tenantId: raw.tenantId as string,
    companyName: (raw.companyName ?? raw.empresaNome ?? raw.name ?? raw.nome ?? "WeDash") as string,
    companySlug: (raw.companySlug ?? raw.empresaSlug ?? "wedash") as string,
    companyLogoUrl: (raw.companyLogoUrl ?? raw.empresaLogoUrl ?? null) as string | null,
    appInstalled: Boolean(raw.appInstalled ?? raw.appInstalado),
  };
}

function ler(): Session | null {
  try {
    let raw = window.localStorage.getItem(CHAVE);
    if (!raw) {
      raw = window.localStorage.getItem(CHAVE_LEGACY);
      if (raw) {
        window.localStorage.removeItem(CHAVE_LEGACY);
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const s = migrateLegacySession(parsed);
    if (!s.companyName) {
      s.companyName = s.name || "WeDash";
      s.companySlug = s.companySlug || "wedash";
      s.companyLogoUrl = s.companyLogoUrl ?? null;
    }
    return s;
  } catch {
    return null;
  }
}

function gravar(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(CHAVE, JSON.stringify(s));
    else window.localStorage.removeItem(CHAVE);
    window.localStorage.removeItem(CHAVE_LEGACY);
  } catch {
    /* armazenamento indisponível */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = false;
    let unsub: (() => void) | undefined;

    (async () => {
      const sb = getSupabase();
      if (sb) {
        const fromAuth = await sessionFromPersistedAuth();
        if (cancel) return;
        setSession(fromAuth);
        gravar(fromAuth);
        setReady(true);
        const { data } = sb.auth.onAuthStateChange(async (event) => {
          if (cancel) return;
          if (event === "PASSWORD_RECOVERY") {
            marcarRecovery();
            setSession(null);
            gravar(null);
            navigate(paths.access.reset, { replace: true });
            return;
          }
          if (event === "SIGNED_OUT") {
            limparRecovery();
            // Millennium permanece conectado até Configurações > Integração ERP.
            setSession(null);
            gravar(null);
            return;
          }
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
            if (emRecovery()) {
              setSession(null);
              gravar(null);
              return;
            }
            // TOKEN_REFRESHED só renova JWT — não reidratar do banco (apaga progresso
            // local do onboarding, ex.: etapa 2 → volta pra 1).
            if (event === "TOKEN_REFRESHED") return;
            const s = await sessionFromPersistedAuth();
            if (cancel) return;
            setSession((atual) => {
              if (!s) return null;
              if (!atual) {
                gravar(s);
                return s;
              }
              // Preserva progresso local à frente do banco; null local = concluído (não reabrir).
              const step =
                atual.onboardingStep === null
                  ? null
                  : s.onboardingStep === null
                    ? null
                    : Math.max(atual.onboardingStep, s.onboardingStep);
              const merged: Session = {
                ...s,
                onboardingStep: step,
                // Se o usuário já trocou a senha nesta sessão, não reativar o gate.
                temporaryPassword: atual.temporaryPassword ? s.temporaryPassword : false,
                // Marca gravada no onboarding nesta sessão (antes do reload do banco).
                companyName: atual.companyName && atual.onboardingStep === null ? atual.companyName : s.companyName,
                companySlug: atual.companySlug && atual.onboardingStep === null ? atual.companySlug : s.companySlug,
                companyLogoUrl:
                  atual.onboardingStep === null && atual.companyLogoUrl !== undefined
                    ? atual.companyLogoUrl
                    : s.companyLogoUrl,
              };
              gravar(merged);
              return merged;
            });
          }
        });
        unsub = () => data.subscription.unsubscribe();
        return;
      }
      if (!cancel) {
        setSession(ler());
        setReady(true);
      }
    })();

    return () => {
      cancel = true;
      unsub?.();
    };
  }, [navigate]);

  const signIn = useCallback((u: User) => {
    const s = sessionFromUser(u);
    setSession(s);
    gravar(s);
    return s;
  }, []);

  const applySession = useCallback((s: Session) => {
    setSession(s);
    gravar(s);
  }, []);

  const signOut = useCallback(() => {
    // Não desconecta Millennium — só Configurações > Integração ERP.
    setSession(null);
    gravar(null);
    void logoutAuth();
  }, []);

  const update = useCallback((patch: Partial<Session>) => {
    setSession((atual) => {
      if (!atual) return atual;
      const nova = { ...atual, ...patch };
      gravar(nova);
      return nova;
    });
  }, []);

  const valor = useMemo(
    () => ({ session, ready, signIn, applySession, signOut, update }),
    [session, ready, signIn, applySession, signOut, update],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSession precisa estar dentro de SessionProvider");
  return ctx;
}

export function useActiveSession(): Session {
  const { session } = useSession();
  if (!session) throw new Error("Sem sessão ativa");
  return session;
}
