import { Navigate } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequireRole } from "@/session/RequireSession";

const GoalsPage = lazyPage(() => import("./GoalsPage"), "default");

export const metasRoutes: RouteObject[] = [
  {
    element: <RequireRole roles={["OWNER", "MANAGER", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.goals, element: <GoalsPage /> },
      /** Legado: Metas vivia em Configurações + /metas. */
      { path: paths.legacy.goals, element: <Navigate to={paths.goals} replace /> },
      { path: paths.legacy.goalsInSettings, element: <Navigate to={paths.goals} replace /> },
    ],
  },
];
