import { Navigate } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

const MetasPage = lazyPage(() => import("./MetasPage"), "default");

export const metasRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.metas, element: <MetasPage /> },
      /** Legado: Metas vivia em Configurações. */
      { path: paths.configuracoes.metas, element: <Navigate to={paths.metas} replace /> },
    ],
  },
];
