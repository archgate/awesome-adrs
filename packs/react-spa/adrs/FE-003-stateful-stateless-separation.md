---
id: FE-003
title: Stateful and Stateless Component Separation
domain: frontend
rules: true
files: ["packages/frontend/**/*.tsx"]
---

## Context

React components can be categorized into two types based on their responsibilities. Stateful (Connected) components manage state using hooks (`useState`, TanStack Query, Jotai), handle side effects, connect to external data sources, contain business logic, and orchestrate presentational components. Stateless (Presentational) components receive all data via props, render UI based solely on props, remain pure and predictable, and are easily testable and reusable.

Mixing these concerns in a single component creates problems: hard-to-test components requiring complex mocked hooks, poor reusability due to tight coupling with data sources, difficulty developing in isolation (e.g., Storybook), unclear responsibilities, and violations of the Single Responsibility Principle. A clear separation is essential for building maintainable applications.

## Decision

All frontends must separate stateful (connected) and stateless (presentational) components.

- **Connected components** use a `"Connected"` suffix in the filename and component name (e.g., `AccountFormConnected.tsx` wraps `AccountForm.tsx`).
- **Presentational components** do NOT have "Connected" in the name and receive ALL data and callbacks as props, including translated strings via a `labels` prop.
- Connected components handle data fetching (TanStack Query), routing (TanStack Router), global state (Jotai), and i18n (`useTranslation`).
- Presentational components must NOT use `useState`, `useEffect`, `useQuery`, `useMutation`, `useAtom`, `useSetAtom`, `useContext` (except theme), or custom hooks that manage state or side effects.
- Presentational components may use `useMemo`, `useCallback`, `useRef`, and theme hooks for performance and DOM access.
- Form components have a limited exception: they may use `useForm` from TanStack Form for form-specific state, but still require a Connected wrapper when they need data fetching, mutations, or global state.

## Do's and Don'ts

### Do

- Create separate files for connected and presentational components.
- Name connected components with the "Connected" suffix.
- Keep presentational components pure with all data from props.
- Pass translated strings to presentational components via a `labels` prop.
- Write stories for presentational components with simple prop-based assertions.
- Pass all data and callbacks as props to presentational components.
- Use helper functions outside components and unit test them independently.

### Don't

- Use data-fetching or state-management hooks in presentational components.
- Fetch data directly in presentational components.
- Manage state in presentational components.
- Forget the "Connected" suffix for stateful components.
- Mix presentation logic and business logic in the same component.
- Use utility hooks that access global state (e.g., `useLocale()`) in presentational components; call them in Connected and pass results as props.

## Consequences

### Positive

- Presentational components are trivial to test with simple prop inputs.
- Pure components can be reused in different contexts with different data sources.
- Presentational components work well in Storybook for isolated development.
- Clear naming convention makes component responsibilities obvious.
- UI and business logic can be developed independently and in parallel.
- Pure components are easier to optimize and memoize.

### Negative

- More files are required for connected and presentational versions.
- Need to pass props explicitly from connected to presentational components.
- Developers must understand and follow the separation pattern.
