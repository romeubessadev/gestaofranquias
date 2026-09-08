import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { filiais } from "@/data/gestao/filiais";
import { tenant } from "@/data/gestao/tenant";
import type { Papel, Usuario } from "@/data/gestao/equipe";

/**
 * Sessão mockada. No produto, vem do JWT emitido pelo servidor: vínculo,
 * tenant, papel e filiais do escopo. Aqui vive em localStorage para o app
 * sobreviver a recarregamentos durante a validação.
 */
export interface Sessao {
  vinculoId: string;
  nome: string;
  cpf: string;
  email: string;
  papel: Papel;
  proprietario: boolean;
  /** Ids das filiais do escopo, já resolvidos (gestor = todas). */
  filiais: string[];
  colaboradorId: string | null;
  /** null = onboarding concluído. */
  onboardingEtapa: number | null;
  tenantId: string;
  /** Instalou o app (PWA)? Só para o aviso persistente. */
  appInstalado: boolean;
}

interface SessaoContexto {
  sessao: Sessao | null;
  entrar: (usuario: Usuario) => Sessao;
  sair: () => void;
  atualizar: (patch: Partial<Sessao>) => void;
}

const CHAVE = "gestao-sessao";

const Contexto = createContext<SessaoContexto | null>(null);

function ler(): Sessao | null {
  try {
    const raw = window.localStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

function gravar(s: Sessao | null) {
  try {
    if (s) window.localStorage.setItem(CHAVE, JSON.stringify(s));
    else window.localStorage.removeItem(CHAVE);
  } catch {
    /* armazenamento indisponível: a sessão vive só em memória */
  }
}

export function sessaoDeUsuario(u: Usuario): Sessao {
  return {
    vinculoId: u.vinculoId,
    nome: u.nome,
    cpf: u.cpf,
    email: u.email,
    papel: u.papel,
    proprietario: u.proprietario,
    filiais: u.filiais.length ? u.filiais : filiais.map((f) => f.id),
    colaboradorId: u.colaboradorId,
    onboardingEtapa: u.onboardingEtapa,
    tenantId: tenant.id,
    appInstalado: false,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(ler);

  const entrar = useCallback((u: Usuario) => {
    const s = sessaoDeUsuario(u);
    setSessao(s);
    gravar(s);
    return s;
  }, []);

  const sair = useCallback(() => {
    setSessao(null);
    gravar(null);
  }, []);

  const atualizar = useCallback((patch: Partial<Sessao>) => {
    setSessao((atual) => {
      if (!atual) return atual;
      const nova = { ...atual, ...patch };
      gravar(nova);
      return nova;
    });
  }, []);

  const valor = useMemo(() => ({ sessao, entrar, sair, atualizar }), [sessao, entrar, sair, atualizar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): SessaoContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSessao precisa estar dentro de SessionProvider");
  return ctx;
}

/** Sessão garantida (usar só dentro de rotas protegidas). */
export function useSessaoAtiva(): Sessao {
  const { sessao } = useSessao();
  if (!sessao) throw new Error("Sem sessão ativa");
  return sessao;
}

export const rotuloPapel: Record<Papel, string> = {
  ADMIN_GLOBAL: "Admin",
  GESTOR: "Gestor",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedora",
};
