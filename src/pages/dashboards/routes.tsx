import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const AnalyticsDashboardPage = lazyPage(() => import("./AnalyticsDashboardPage"), "AnalyticsDashboardPage");
const SalesDashboardPage = lazyPage(() => import("./SalesDashboardPage"), "SalesDashboardPage");
const ProjectDashboardPage = lazyPage(() => import("./ProjectDashboardPage"), "ProjectDashboardPage");
const SaasDashboardPage = lazyPage(() => import("./SaasDashboardPage"), "SaasDashboardPage");
const BiDashboardPage = lazyPage(() => import("./BiDashboardPage"), "BiDashboardPage");
const FinanceiroPage = lazyPage(() => import("./FinanceiroPage"), "default");
const ProdutosPage = lazyPage(() => import("./ProdutosPage"), "default");
const TurnosPage = lazyPage(() => import("./TurnosPage"), "default");
const VisaoGeralPage = lazyPage(() => import("./VisaoGeralPage"), "default");

/**
 * NOTE: paths.dashboards.{crm,ecommerce,finance,logistics} and the marketing
 * dashboard intentionally reuse the SAME url as their owning domain module
 * (e.g. /crm/dashboard is registered once, in pages/crm/routes.tsx, and the
 * "Dashboards" sidebar group just links to it). Only register the 5 dashboard
 * pages that don't already belong to another domain module here.
 */
export const dashboardsRoutes: RouteObject[] = [
  { path: paths.dashboards.analytics, element: <AnalyticsDashboardPage /> },
  { path: paths.dashboards.sales, element: <SalesDashboardPage /> },
  { path: paths.dashboards.projects, element: <ProjectDashboardPage /> },
  { path: paths.dashboards.saas, element: <SaasDashboardPage /> },
  { path: paths.dashboards.bi, element: <BiDashboardPage /> },
  { path: paths.financeiro, element: <FinanceiroPage /> },
{ path: paths.produtos, element: <ProdutosPage /> },
  { path: paths.turnos, element: <TurnosPage /> },
  { path: paths.visaoGeral, element: <VisaoGeralPage /> },
];
