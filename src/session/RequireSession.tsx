import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessao } from "./SessionProvider";
import { paths } from "@/router/paths";
import type { Papel } from "@/data/gestao/equipe";

/**
 * Protege rotas: sem sessão manda para o login; com onboarding pendente
 * manda para o onboarding (e vice-versa: onboarding concluído não reabre).
 */
export function RequireSession({ modo = "app" }: { modo?: "app" | "onboarding" }) {
  const { sessao } = useSessao();
  const location = useLocation();

  if (!sessao) return <Navigate to={paths.acesso.entrar} replace state={{ de: location.pathname }} />;

  const pendente = sessao.onboardingEtapa !== null;
  if (modo === "app" && pendente) return <Navigate to={paths.onboarding} replace />;
  if (modo === "onboarding" && !pendente) return <Navigate to={paths.dashboard} replace />;

  return <Outlet />;
}

/** Restringe a rota a alguns papéis; os demais vão para a tela inicial do seu papel. */
export function RequirePapel({ papeis }: { papeis: Papel[] }) {
  const { sessao } = useSessao();
  if (!sessao) return <Navigate to={paths.acesso.entrar} replace />;
  if (!papeis.includes(sessao.papel)) return <Navigate to={inicioDoPapel(sessao.papel)} replace />;
  return <Outlet />;
}

export function inicioDoPapel(papel: Papel): string {
  return papel === "VENDEDOR" ? paths.vendedora.minhaMeta : paths.dashboard;
}
