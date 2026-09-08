import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Wrap a named page export in React.lazy so each route becomes its own async
 * chunk, while preserving the component's prop types. Usage:
 * `const Page = lazyPage(() => import("./Page"), "Page");`
 * Requires a <Suspense> boundary above the rendered element (see AppShell /
 * AuthLayout).
 */
export function lazyPage<M, K extends keyof M>(
  loader: () => Promise<M>,
  name: K,
): LazyExoticComponent<M[K] extends ComponentType<infer P> ? ComponentType<P> : never> {
  return lazy(() =>
    loader().then((m) => ({ default: m[name] as ComponentType<unknown> })),
  ) as LazyExoticComponent<M[K] extends ComponentType<infer P> ? ComponentType<P> : never>;
}
