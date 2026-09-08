import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const MarketingDashboardPage = lazyPage(() => import("./MarketingPage"), "MarketingDashboardPage");
const MarketingTabPage = lazyPage(() => import("./MarketingPage"), "MarketingTabPage");

/** "/marketing" itself is the Marketing Dashboard (the module's landing page);
 *  "/marketing/:tab" covers Email/SMS/Landing Pages/Segments/Analytics sub-views. */
export const marketingRoutes: RouteObject[] = [
  { path: paths.marketing.root, element: <MarketingDashboardPage /> },
  { path: paths.marketing.tab(":tab"), element: <MarketingTabPage /> },
];
