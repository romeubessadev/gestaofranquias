import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const PricingPage = lazyPage(() => import("./PricingPage"), "PricingPage");
const WidgetGalleryPage = lazyPage(() => import("./WidgetGalleryPage"), "WidgetGalleryPage");
const UiPlaygroundPage = lazyPage(() => import("./UiPlaygroundPage"), "UiPlaygroundPage");
const ThemeCustomizerPage = lazyPage(() => import("./ThemeCustomizerPage"), "ThemeCustomizerPage");
const RtlPreviewPage = lazyPage(() => import("./RtlPreviewPage"), "RtlPreviewPage");
const StarterKitPage = lazyPage(() => import("./StarterKitPage"), "StarterKitPage");
const ChangelogPage = lazyPage(() => import("./ChangelogPage"), "ChangelogPage");
const RoadmapPage = lazyPage(() => import("./RoadmapPage"), "RoadmapPage");
const ReleaseNotesPage = lazyPage(() => import("./ReleaseNotesPage"), "ReleaseNotesPage");

export const miscRoutes: RouteObject[] = [
  { path: paths.pricing, element: <PricingPage /> },
  { path: paths.misc.widgetGallery, element: <WidgetGalleryPage /> },
  { path: paths.misc.uiPlayground, element: <UiPlaygroundPage /> },
  { path: paths.misc.themeCustomizer, element: <ThemeCustomizerPage /> },
  { path: paths.misc.rtlPreview, element: <RtlPreviewPage /> },
  { path: paths.misc.starterKit, element: <StarterKitPage /> },
  { path: paths.misc.changelog, element: <ChangelogPage /> },
  { path: paths.misc.roadmap, element: <RoadmapPage /> },
  { path: paths.misc.releaseNotes, element: <ReleaseNotesPage /> },
];
