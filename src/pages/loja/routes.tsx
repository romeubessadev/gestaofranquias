import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

const LojaPage = lazyPage(() => import("./LojaPage"), "LojaPage");

export const lojaRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [{ path: paths.loja, element: <LojaPage /> }],
  },
];
