import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const FaqPage = lazyPage(() => import("./FaqPage"), "FaqPage");
const HelpCenterPage = lazyPage(() => import("./HelpCenterPage"), "HelpCenterPage");
const KnowledgeBasePage = lazyPage(() => import("./KnowledgeBasePage"), "KnowledgeBasePage");
const DocumentationPage = lazyPage(() => import("./DocumentationPage"), "DocumentationPage");
const SearchResultsPage = lazyPage(() => import("./SearchResultsPage"), "SearchResultsPage");
const NotificationsCenterPage = lazyPage(() => import("./NotificationsCenterPage"), "NotificationsCenterPage");
const ActivityFeedPage = lazyPage(() => import("./ActivityFeedPage"), "ActivityFeedPage");

export const utilityRoutes: RouteObject[] = [
  { path: paths.utility.faq, element: <FaqPage /> },
  { path: paths.utility.helpCenter, element: <HelpCenterPage /> },
  { path: paths.utility.knowledgeBase, element: <KnowledgeBasePage /> },
  { path: paths.utility.documentation, element: <DocumentationPage /> },
  { path: paths.utility.searchResults, element: <SearchResultsPage /> },
  { path: paths.utility.notifications, element: <NotificationsCenterPage /> },
  { path: paths.utility.activityFeed, element: <ActivityFeedPage /> },
];
