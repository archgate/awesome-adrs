---
id: FE-001
title: TanStack Query for Server State
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Modern applications require efficient data fetching, caching, and synchronization with backend APIs. Traditional approaches using manual `fetch` with `useState`/`useEffect` demand excessive boilerplate for loading states, error handling, and cache management. Global state libraries are not designed for server state, leading to stale data and complex synchronization logic. Without a standardized solution, projects implement inconsistent patterns, duplicate caching logic, and struggle with data synchronization.

For applications with long-running sessions or complex data requirements, proper data management is critical. Stale data must be prevented through automatic background refetching. Optimistic updates improve user experience during mutations. Cached data enables the application to function during temporary network issues. Intelligent caching reduces unnecessary API calls and improves perceived performance.

## Decision

All frontends must use TanStack Query (React Query) v5 for all server state management, configured with:

- **Query hooks** (`useQuery`, `useMutation`, `useInfiniteQuery`) for all data fetching.
- **Query key factory pattern** for organized cache management (e.g., `userKeys.all`, `userKeys.lists()`, `userKeys.detail(id)`).
- **`queryOptions()` factory functions** for reusable query configs shared between hooks and route loaders, with `staleTime`/`gcTime` settings.
- **Mutation hooks** with optimistic updates and automatic cache invalidation.
- **Automatic caching** with configurable stale time and garbage collection time.
- **Background refetching** to keep data fresh.
- **Integration with TanStack Router** loaders via `queryClient.ensureQueryData()`.

## Do's and Don'ts

### Do

- Use TanStack Query hooks for all data fetching.
- Define query keys as constants or factory functions to ensure consistency and type safety.
- Leverage automatic caching and background refetching.
- Implement optimistic updates for mutations to provide immediate user feedback.
- Use query invalidation to update related data after mutations.
- Configure `staleTime` appropriately based on data volatility.
- Export `queryOptions()` factory functions alongside hooks so route loaders and hooks share the same configuration.
- Use TanStack Query DevTools in development.

### Don't

- Use raw `fetch` or `axios` calls with `useState` and `useEffect` for data fetching.
- Store server data in global state (Jotai, Redux, etc.); use TanStack Query for server state.
- Fetch the same data multiple times; use query keys to share cached data across components.
- Forget to invalidate or refetch queries after mutations.
- Set extremely short stale times that cause excessive refetching.
- Perform data wrangling or transformations in the frontend; the backend should return data ready for consumption.

## Consequences

### Positive

- Automatic caching eliminates duplicate requests and improves performance.
- Background refetching keeps data fresh without manual intervention.
- Declarative hooks reduce boilerplate compared to manual fetch logic.
- Built-in loading, error, and success state management.
- Request deduplication ensures multiple components requesting the same data trigger only one network request.
- Automatic garbage collection prevents memory leaks.
- Full TypeScript support for query data, parameters, and errors.

### Negative

- Learning curve for TanStack Query concepts (queries, mutations, cache keys, invalidation).
- Additional bundle size, though benefits outweigh the cost.
- Automatic background refetching may cause unnecessary API calls if not configured properly.
- Managing cache invalidation can become complex in large applications.
