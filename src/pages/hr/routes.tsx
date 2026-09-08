import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const Employees = lazyPage(() => import("./Employees"), "Employees");
const EmployeeDetails = lazyPage(() => import("./EmployeeDetails"), "EmployeeDetails");
const Attendance = lazyPage(() => import("./Attendance"), "Attendance");
const LeaveRequests = lazyPage(() => import("./LeaveRequests"), "LeaveRequests");
const Payroll = lazyPage(() => import("./Payroll"), "Payroll");
const Departments = lazyPage(() => import("./Departments"), "Departments");
const Recruitment = lazyPage(() => import("./Recruitment"), "Recruitment");
const JobApplications = lazyPage(() => import("./JobApplications"), "JobApplications");

export const hrRoutes: RouteObject[] = [
  { path: paths.hr.employees, element: <Employees /> },
  { path: paths.hr.employeeDetail(), element: <EmployeeDetails /> },
  { path: paths.hr.attendance, element: <Attendance /> },
  { path: paths.hr.leaveRequests, element: <LeaveRequests /> },
  { path: paths.hr.payroll, element: <Payroll /> },
  { path: paths.hr.departments, element: <Departments /> },
  { path: paths.hr.recruitment, element: <Recruitment /> },
  { path: paths.hr.jobApplications, element: <JobApplications /> },
];
