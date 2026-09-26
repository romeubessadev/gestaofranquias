import { Navigate } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequireRole } from "@/session/RequireSession";

const TeamPage = lazyPage(() => import("./TeamPage"), "TeamPage");

export const equipeRoutes: RouteObject[] = [
  {
    element: <RequireRole roles={["OWNER", "MANAGER", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.team, element: <TeamPage /> },
      { path: paths.legacy.teamRoot, element: <Navigate to={paths.team} replace /> },
    ],
  },
];
