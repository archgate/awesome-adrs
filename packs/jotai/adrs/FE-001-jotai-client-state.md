---
id: FE-001
title: Jotai for Client State
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Modern React applications need to manage different types of state: server state (data from APIs), UI state (component-local toggles, modals), and global client state (theme preference, sidebar open/closed, locale). While TanStack Query handles server state and TanStack Router manages URL state, applications sometimes need a solution for global client state shared across components without prop drilling.

Traditional global state solutions have limitations. The Context API causes re-renders of all consumers even when unrelated state changes. Redux requires significant boilerplate and is overkill for simple global state. Zustand and Valtio are viable alternatives but less composable. Component state with prop drilling becomes unwieldy in deep component trees. Most applications need very little global client state since server state belongs in TanStack Query and URL state belongs in TanStack Router.

## Decision

Jotai is the standardized global client state management library. It is not required for all applications -- most frontends can function entirely without global state management by using component-local state (`useState`, `useReducer`), server state via TanStack Query, and URL state via TanStack Router.

- **Only introduce Jotai when there is a genuine need** for global client state (UI preferences, sidebar state, locale, theme, selected filters, current view mode).
- **Atomic model**: small, focused atoms for each piece of state.
- **`atomWithStorage`** for persisting state to localStorage when appropriate.
- **Derived atoms** to compute values from other atoms.
- Atoms organized in `src/atoms/` directory (e.g., `src/atoms/ui.ts`, `src/atoms/preferences.ts`).
- No other global state libraries (Redux, Zustand, Valtio, Recoil, MobX) are permitted.

## Do's and Don'ts

### Do

- Evaluate if you actually need global state before introducing Jotai.
- Prefer component-local state, TanStack Query, or URL state over global state when possible.
- Keep atoms small and focused on a single piece of state.
- Use derived atoms to compute values from other atoms.
- Use `atomWithStorage` for persisting state to localStorage.
- Leverage TypeScript for type-safe atoms with explicit type definitions.
- Use `useAtomValue` for read-only access and `useSetAtom` for write-only access to minimize re-renders.

### Don't

- Introduce Jotai unless you have a genuine need for global state.
- Use Jotai for server state; use TanStack Query instead.
- Use Jotai for URL-based state; use TanStack Router search params instead.
- Use Jotai for component-local state that doesn't need to be shared; use `useState`.
- Create massive atoms with unrelated state; keep atoms focused and granular.
- Use Redux, Zustand, Valtio, MobX, Recoil, or other global state libraries.
- Mutate atom values directly; always use setter functions.

## Consequences

### Positive

- Atomic state model prevents unnecessary re-renders with fine-grained subscriptions.
- Minimal boilerplate compared to Redux or Context API.
- Excellent TypeScript support with full type inference.
- Composable derived atoms create a reactive dependency graph.
- Built for React Suspense and Concurrent Mode.
- Lightweight (~3KB) with minimal overhead.

### Negative

- Learning curve for atomic state concepts.
- With many small atoms, tracking state flow can be challenging without DevTools.
- Smaller ecosystem compared to Redux.
