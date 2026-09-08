import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";

const Onboarding = lazyPage(() => import("./Onboarding"), "Onboarding");

export const onboardingRoutes: RouteObject[] = [{ path: paths.onboarding, element: <Onboarding /> }];
