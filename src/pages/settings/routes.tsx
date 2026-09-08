import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { paths } from "@/router/paths";
const SettingsPage = lazyPage(() => import("./SettingsPage"), "SettingsPage");

export const settingsRoutes: RouteObject[] = [
  { path: paths.settings.root, element: <Navigate to={paths.settings.tab("general")} replace /> },
  { path: paths.settings.tab(":tab"), element: <SettingsPage /> },
];
