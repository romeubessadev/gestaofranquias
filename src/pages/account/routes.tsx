import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { paths } from "@/router/paths";
const AccountPage = lazyPage(() => import("./AccountPage"), "AccountPage");

export const accountRoutes: RouteObject[] = [
  { path: paths.account.root, element: <Navigate to={paths.account.tab("profile")} replace /> },
  { path: paths.account.tab(":tab"), element: <AccountPage /> },
];
