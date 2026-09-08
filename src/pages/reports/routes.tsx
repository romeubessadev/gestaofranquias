import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { paths } from "@/router/paths";
const ReportsPage = lazyPage(() => import("./ReportsPage"), "ReportsPage");

export const reportsRoutes: RouteObject[] = [
  { path: paths.reports.root, element: <Navigate to={paths.reports.tab("sales")} replace /> },
  { path: paths.reports.tab(":tab"), element: <ReportsPage /> },
];
