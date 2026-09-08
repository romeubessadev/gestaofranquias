import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const FinanceDashboard = lazyPage(() => import("./FinanceDashboard"), "FinanceDashboard");
const Transactions = lazyPage(() => import("./Transactions"), "Transactions");
const Payments = lazyPage(() => import("./Payments"), "Payments");
const Expenses = lazyPage(() => import("./Expenses"), "Expenses");
const ProfitLoss = lazyPage(() => import("./ProfitLoss"), "ProfitLoss");
const Budget = lazyPage(() => import("./Budget"), "Budget");
const Invoices = lazyPage(() => import("./Invoices"), "Invoices");
const InvoiceDetails = lazyPage(() => import("./InvoiceDetails"), "InvoiceDetails");
const InvoiceForm = lazyPage(() => import("./InvoiceForm"), "InvoiceForm");
const FinancialReports = lazyPage(() => import("./FinancialReports"), "FinancialReports");

export const financeRoutes: RouteObject[] = [
  { path: paths.finance.dashboard, element: <FinanceDashboard /> },
  { path: paths.finance.transactions, element: <Transactions /> },
  { path: paths.finance.payments, element: <Payments /> },
  { path: paths.finance.expenses, element: <Expenses /> },
  { path: paths.finance.profitLoss, element: <ProfitLoss /> },
  { path: paths.finance.budget, element: <Budget /> },
  { path: paths.finance.invoices, element: <Invoices /> },
  { path: paths.finance.invoiceNew, element: <InvoiceForm mode="create" /> },
  { path: paths.finance.invoiceDetail(), element: <InvoiceDetails /> },
  { path: paths.finance.invoiceEdit(), element: <InvoiceForm mode="edit" /> },
  { path: paths.finance.reports, element: <FinancialReports /> },
];
