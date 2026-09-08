import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { RequirePapel } from "@/session/RequireSession";

const EquipePage = lazyPage(() => import("./EquipePage"), "EquipePage");

export const equipeRoutes: RouteObject[] = [
  {
    element: <RequirePapel papeis={["GESTOR", "GERENTE", "ADMIN_GLOBAL"]} />,
    children: [{ path: paths.equipe, element: <EquipePage /> }],
  },
];
