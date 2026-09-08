import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const ResponsiveTablePage = lazyPage(() => import("./ResponsiveTablePage"), "ResponsiveTablePage");
const FilterTablePage = lazyPage(() => import("./FilterTablePage"), "FilterTablePage");
const BasicTablePage = lazyPage(() => import("./BasicTablePage"), "BasicTablePage");
const DataTablePage = lazyPage(() => import("./DataTablePage"), "DataTablePage");
const AdvancedTablePage = lazyPage(() => import("./AdvancedTablePage"), "AdvancedTablePage");
const EditableTablePage = lazyPage(() => import("./EditableTablePage"), "EditableTablePage");

export const tablesRoutes: RouteObject[] = [
  { path: paths.tables.responsive, element: <ResponsiveTablePage /> },
  { path: paths.tables.filter, element: <FilterTablePage /> },
  { path: paths.tables.basic, element: <BasicTablePage /> },
  { path: paths.tables.data, element: <DataTablePage /> },
  { path: paths.tables.advanced, element: <AdvancedTablePage /> },
  { path: paths.tables.editable, element: <EditableTablePage /> },
];
