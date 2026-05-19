---
id: FE-004
title: TanStack Router for File-Based Routing
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Single Page Applications require client-side routing to manage navigation between different views without full page reloads. A routing solution must provide declarative route definitions, type-safe routing with compile-time checking for route parameters and search params, code splitting and lazy loading, built-in data loading coordinated with route transitions, URL state management, nested routing, and navigation guards.

Traditional React routing solutions have limitations. React Router lacks built-in type safety and requires manual TypeScript definitions. Manual routing is error-prone and difficult to maintain. Framework routers like Next.js or Remix require server-side rendering, which conflicts with SPA architecture. For desktop applications with complex navigation flows, type safety is critical to prevent runtime errors from typos in route paths, missing parameters, or invalid search params.

## Decision

All frontends must use TanStack Router as the routing library, configured with:

- **File-based routing** in a folder tree structure to define routes, organized in the `src/routes/` directory.
- **Full TypeScript type safety** for routes, params, and search params.
- **Automatic code splitting** per route using lazy loading.
- **Data loading coordination** with route transitions via loaders.
- **Search parameter validation** with type-safe schemas (e.g., Zod).
- **Type-safe navigation** via `<Link>` components and `useNavigate`.
- Page components live in `src/pages/` while route files in `src/routes/` define loaders, search param validation, and reference page components.

## Do's and Don'ts

### Do

- Use TanStack Router for all client-side routing.
- Organize routes using file-based routing in `src/routes/`.
- Leverage TypeScript type safety for route parameters, search params, and navigation.
- Use `getRouteApi()` to access route data in page components.
- Use route-level code splitting with `lazy()` for optimal bundle sizes.
- Define route-level data loading with loaders that execute before route transitions.
- Evaluate route-level data preloading for every new route using `queryClient.ensureQueryData()` in loaders.
- Use search parameter schemas with Zod for validation and type safety.
- Use `<Link>` components for navigation to maintain type safety.
- Implement loading states and error boundaries at the route level.

### Don't

- Use React Router, Wouter, or other routing libraries.
- Define routes programmatically without using the file-based routing structure.
- Use string literals for route paths in navigation; use type-safe route objects.
- Perform data fetching in components when it should be done in route loaders.
- Use `window.location` or manual history manipulation; use TanStack Router's navigation APIs.
- Wrap `throw redirect()` inside a `try/catch` block in `beforeLoad` hooks; throw it outside the `try/catch`.
- Use `pendingComponent` when `autoCodeSplitting: true` is enabled, as it causes `ReferenceError` on cold-cache navigations.

## Consequences

### Positive

- Full TypeScript type safety prevents runtime errors for routes, parameters, and navigation.
- File-based routing makes routes easy to discover and maintain as the application scales.
- Automatic route-level code splitting reduces initial bundle size.
- Coordinated data loading via route loaders eliminates loading waterfalls.
- Type-safe search parameter handling simplifies complex filtering and sorting.
- Seamless integration with TanStack Query for data fetching and caching.

### Negative

- Learning curve for TanStack Router concepts (file routing, loaders, search params).
- Route types are generated at build time, requiring the dev server to be running for type checking.
- Smaller ecosystem compared to React Router.
