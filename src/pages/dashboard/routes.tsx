import { Navigate } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

const DashboardPage = lazyPage(() => import("./DashboardPage"), "DashboardPage");

export const dashboardRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.dashboard, element: <DashboardPage /> },
      // Legado: a página principal era /loja; redireciona preservando a query.
      { path: paths.lojaLegado, element: <Navigate replace to={paths.dashboard} /> },
    ],
  },
];