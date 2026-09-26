import { Navigate, type RouteObject } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import { paths } from "@/router/paths";
import { RequireRole } from "@/session/RequireSession";

const LivePage = lazyPage(() => import("./LivePage"), "default");
const SharePage = lazyPage(() => import("./SharePage"), "default");
const TvPage = lazyPage(() => import("./TvPage"), "default");

export const aoVivoRoutes: RouteObject[] = [
  {
    element: <RequireRole roles={["OWNER", "MANAGER", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.live.root, element: <LivePage /> },
      { path: paths.live.share, element: <SharePage /> },
      { path: paths.live.tv, element: <TvPage /> },
      { path: paths.legacy.live.root, element: <Navigate to={paths.live.root} replace /> },
      { path: paths.legacy.live.share, element: <Navigate to={paths.live.share} replace /> },
      { path: paths.legacy.live.tv, element: <Navigate to={paths.live.tv} replace /> },
    ],
  },
];
