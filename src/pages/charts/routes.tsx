import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const ApexChartsPage = lazyPage(() => import("./ApexChartsPage"), "ApexChartsPage");
const ChartjsPage = lazyPage(() => import("./ChartjsPage"), "ChartjsPage");
const StatisticsPage = lazyPage(() => import("./StatisticsPage"), "StatisticsPage");
const KpiAnalyticsPage = lazyPage(() => import("./KpiAnalyticsPage"), "KpiAnalyticsPage");
const HeatmapsPage = lazyPage(() => import("./HeatmapsPage"), "HeatmapsPage");
const RevenueAnalyticsPage = lazyPage(() => import("./RevenueAnalyticsPage"), "RevenueAnalyticsPage");
const UserAnalyticsPage = lazyPage(() => import("./UserAnalyticsPage"), "UserAnalyticsPage");

export const chartsRoutes: RouteObject[] = [
  { path: paths.charts.apex, element: <ApexChartsPage /> },
  { path: paths.charts.chartjs, element: <ChartjsPage /> },
  { path: paths.charts.statistics, element: <StatisticsPage /> },
  { path: paths.charts.kpi, element: <KpiAnalyticsPage /> },
  { path: paths.charts.heatmaps, element: <HeatmapsPage /> },
  { path: paths.charts.revenue, element: <RevenueAnalyticsPage /> },
  { path: paths.charts.userAnalytics, element: <UserAnalyticsPage /> },
];
