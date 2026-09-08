import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const CrmDashboard = lazyPage(() => import("./CrmDashboard"), "CrmDashboard");
const CrmApp = lazyPage(() => import("./CrmApp"), "CrmApp");
const Leads = lazyPage(() => import("./Leads"), "Leads");
const LeadDetails = lazyPage(() => import("./LeadDetails"), "LeadDetails");
const Opportunities = lazyPage(() => import("./Opportunities"), "Opportunities");
const CrmCustomers = lazyPage(() => import("./CrmCustomers"), "CrmCustomers");
const DealsPipeline = lazyPage(() => import("./DealsPipeline"), "DealsPipeline");
const SalesFunnel = lazyPage(() => import("./SalesFunnel"), "SalesFunnel");
const Campaigns = lazyPage(() => import("./Campaigns"), "Campaigns");
const CustomerJourney = lazyPage(() => import("./CustomerJourney"), "CustomerJourney");

export const crmRoutes: RouteObject[] = [
  { path: paths.crm.dashboard, element: <CrmDashboard /> },
  { path: paths.crm.app, element: <CrmApp /> },
  { path: paths.crm.leads, element: <Leads /> },
  { path: paths.crm.leadDetail(), element: <LeadDetails /> },
  { path: paths.crm.opportunities, element: <Opportunities /> },
  { path: paths.crm.customers, element: <CrmCustomers /> },
  { path: paths.crm.dealsPipeline, element: <DealsPipeline /> },
  { path: paths.crm.salesFunnel, element: <SalesFunnel /> },
  { path: paths.crm.campaigns, element: <Campaigns /> },
  { path: paths.crm.customerJourney, element: <CustomerJourney /> },
];
