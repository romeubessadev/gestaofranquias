import type { RouteObject } from "react-router-dom";
import { lazyPage } from "@/lib/lazyPage";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

const AoVivoPage = lazyPage(() => import("./AoVivoPage"), "default");
const CompartilharPage = lazyPage(() => import("./CompartilharPage"), "default");
const TvPage = lazyPage(() => import("./TvPage"), "default");

export const aoVivoRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [
      { path: paths.aoVivo.root, element: <AoVivoPage /> },
      { path: paths.aoVivo.compartilhar, element: <CompartilharPage /> },
      { path: paths.aoVivo.tv, element: <TvPage /> },
    ],
  },
];
