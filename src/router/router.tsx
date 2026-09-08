import { Navigate, useRoutes, type RouteObject } from "react-router-dom";
import { AppShell } from "@/layout/AppShell";
import { AuthLayout } from "@/layout/AuthLayout";
import { paths } from "./paths";
import { NotFound } from "@/pages/auth/NotFound";
import { RequireSession, inicioDoPapel } from "@/session/RequireSession";
import { useSessao } from "@/session/SessionProvider";

/* Produto */
import { acessoRoutes } from "@/pages/acesso/routes";
import { onboardingRoutes } from "@/pages/onboarding/routes";
import { dashboardRoutes } from "@/pages/dashboard/routes";
import { equipeRoutes } from "@/pages/equipe/routes";
import { emBreveRoutes } from "@/pages/embreve/routes";

/* Template Vela (referência, acessível por URL) */
import { dashboardsRoutes } from "@/pages/dashboards/routes";
import { usersRoutes } from "@/pages/users/routes";
import { projectsRoutes } from "@/pages/projects/routes";
import { ecommerceRoutes } from "@/pages/ecommerce/routes";
import { financeRoutes } from "@/pages/finance/routes";
import { crmRoutes } from "@/pages/crm/routes";
import { hrRoutes } from "@/pages/hr/routes";
import { logisticsRoutes } from "@/pages/logistics/routes";
import { appsRoutes } from "@/pages/apps/routes";
import { tablesRoutes } from "@/pages/tables/routes";
import { formsRoutes } from "@/pages/forms/routes";
import { chartsRoutes } from "@/pages/charts/routes";
import { componentsShowcaseRoutes } from "@/pages/components-showcase/routes";
import { accountRoutes } from "@/pages/account/routes";
import { marketingRoutes } from "@/pages/marketing/routes";
import { reportsRoutes } from "@/pages/reports/routes";
import { settingsRoutes } from "@/pages/settings/routes";
import { utilityRoutes } from "@/pages/utility/routes";
import { miscRoutes } from "@/pages/misc/routes";
import { authRoutes } from "@/pages/auth/routes";

/** Raiz: sem sessão vai ao login; com sessão, à tela inicial do papel. */
function Raiz() {
  const { sessao } = useSessao();
  if (!sessao) return <Navigate to={paths.acesso.entrar} replace />;
  if (sessao.onboardingEtapa !== null) return <Navigate to={paths.onboarding} replace />;
  return <Navigate to={inicioDoPapel(sessao.papel)} replace />;
}

const routeTree: RouteObject[] = [
  { path: paths.home, element: <Raiz /> },
  {
    element: <AuthLayout />,
    children: [...acessoRoutes, ...authRoutes],
  },
  {
    element: <RequireSession modo="onboarding" />,
    children: [{ element: <AuthLayout />, children: [...onboardingRoutes] }],
  },
  {
    element: <RequireSession modo="app" />,
    children: [
      {
        element: <AppShell />,
        children: [
          ...dashboardRoutes,
          ...equipeRoutes,
          ...emBreveRoutes,
          ...dashboardsRoutes,
          ...usersRoutes,
          ...projectsRoutes,
          ...ecommerceRoutes,
          ...financeRoutes,
          ...crmRoutes,
          ...hrRoutes,
          ...logisticsRoutes,
          ...appsRoutes,
          ...tablesRoutes,
          ...formsRoutes,
          ...chartsRoutes,
          ...componentsShowcaseRoutes,
          ...accountRoutes,
          ...marketingRoutes,
          ...reportsRoutes,
          ...settingsRoutes,
          ...utilityRoutes,
          ...miscRoutes,
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

export function AppRouter() {
  return useRoutes(routeTree);
}
