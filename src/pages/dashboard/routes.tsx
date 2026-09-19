import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

/**
 * `/dashboard` e `/loja` eram a tela legada com TabNav interno.
 * Entrada canônica = Visão geral (`/dashboard/visao-geral`).
 */
export const dashboardRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.dashboard, element: <Navigate replace to={paths.visaoGeral} /> },
      { path: paths.lojaLegado, element: <Navigate replace to={paths.visaoGeral} /> },
    ],
  },
];
