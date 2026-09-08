import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const ProjectsList = lazyPage(() => import("./ProjectsList"), "ProjectsList");
const ProjectDetails = lazyPage(() => import("./ProjectDetails"), "ProjectDetails");
const CreateEditProject = lazyPage(() => import("./CreateEditProject"), "CreateEditProject");
const TaskDetails = lazyPage(() => import("./TaskDetails"), "TaskDetails");
const ProjectTimeline = lazyPage(() => import("./ProjectTimeline"), "ProjectTimeline");
const TeamBoard = lazyPage(() => import("./TeamBoard"), "TeamBoard");
const SprintBoard = lazyPage(() => import("./SprintBoard"), "SprintBoard");
const GanttView = lazyPage(() => import("./GanttView"), "GanttView");
const ProjectAnalytics = lazyPage(() => import("./ProjectAnalytics"), "ProjectAnalytics");
const KanbanView = lazyPage(() => import("./KanbanView"), "KanbanView");

export const projectsRoutes: RouteObject[] = [
  { path: paths.projects.list, element: <ProjectsList /> },
  { path: paths.projects.detail(), element: <ProjectDetails /> },
  { path: paths.projects.new, element: <CreateEditProject /> },
  { path: paths.projects.edit(), element: <CreateEditProject /> },
  { path: paths.projects.task(), element: <TaskDetails /> },
  { path: paths.projects.timeline, element: <ProjectTimeline /> },
  { path: paths.projects.teamBoard, element: <TeamBoard /> },
  { path: paths.projects.sprintBoard, element: <SprintBoard /> },
  { path: paths.projects.gantt, element: <GanttView /> },
  { path: paths.projects.analytics, element: <ProjectAnalytics /> },
  { path: paths.projects.kanban, element: <KanbanView /> },
];
