import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const LogisticsDashboard = lazyPage(() => import("./LogisticsDashboard"), "LogisticsDashboard");
const Shipments = lazyPage(() => import("./Shipments"), "Shipments");
const ShipmentDetails = lazyPage(() => import("./ShipmentDetails"), "ShipmentDetails");
const DeliveryTracking = lazyPage(() => import("./DeliveryTracking"), "DeliveryTracking");
const Fleet = lazyPage(() => import("./Fleet"), "Fleet");
const Warehouse = lazyPage(() => import("./Warehouse"), "Warehouse");
const RoutePlanning = lazyPage(() => import("./RoutePlanning"), "RoutePlanning");

export const logisticsRoutes: RouteObject[] = [
  { path: paths.logistics.dashboard, element: <LogisticsDashboard /> },
  { path: paths.logistics.shipments, element: <Shipments /> },
  { path: paths.logistics.shipmentDetail(), element: <ShipmentDetails /> },
  { path: paths.logistics.deliveryTracking, element: <DeliveryTracking /> },
  { path: paths.logistics.fleet, element: <Fleet /> },
  { path: paths.logistics.warehouse, element: <Warehouse /> },
  { path: paths.logistics.routePlanning, element: <RoutePlanning /> },
];
