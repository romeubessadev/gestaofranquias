import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const UsersList = lazyPage(() => import("./UsersList"), "UsersList");
const MyProfile = lazyPage(() => import("./MyProfile"), "MyProfile");
const UserDetails = lazyPage(() => import("./UserDetails"), "UserDetails");
const AddEditUser = lazyPage(() => import("./AddEditUser"), "AddEditUser");
const Roles = lazyPage(() => import("./Roles"), "Roles");
const Permissions = lazyPage(() => import("./Permissions"), "Permissions");
const Teams = lazyPage(() => import("./Teams"), "Teams");
const Departments = lazyPage(() => import("./Departments"), "Departments");
const ActivityLogs = lazyPage(() => import("./ActivityLogs"), "ActivityLogs");

export const usersRoutes: RouteObject[] = [
  { path: paths.users.list, element: <UsersList /> },
  { path: paths.users.profile, element: <MyProfile /> },
  { path: paths.users.detail(), element: <UserDetails /> },
  { path: paths.users.new, element: <AddEditUser /> },
  { path: paths.users.edit(), element: <AddEditUser /> },
  { path: paths.users.roles, element: <Roles /> },
  { path: paths.users.permissions, element: <Permissions /> },
  { path: paths.users.teams, element: <Teams /> },
  { path: paths.users.departments, element: <Departments /> },
  { path: paths.users.activityLogs, element: <ActivityLogs /> },
];
