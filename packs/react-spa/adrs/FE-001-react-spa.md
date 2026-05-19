---
id: FE-001
title: React SPA Architecture
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Modern web applications require a frontend framework that supports complex, stateful workflows and rich data interactions. For applications where SEO and server-side rendering are not requirements — such as dashboards, admin panels, internal tools, or desktop-class web apps — a Single Page Application architecture eliminates SSR/SSG complexity entirely.

React is the most mature and widely adopted UI framework, with the largest ecosystem of component libraries, tooling, and community resources. React 19 introduces improvements to concurrent rendering and overall performance. Combined with a Single Page Application architecture, React provides the ideal foundation: instant client-side navigation, persistent state across views, and efficient resource usage since assets are loaded once and cached for the entire session.

## Decision

The frontend uses React 19+ as a Single Page Application. No server-side rendering is used.

- React 19 or later is the sole UI framework. No other frameworks (Vue, Angular, Svelte, Solid) are permitted.
- Function components and hooks are the only component model. Class components are prohibited for all new code.
- The frontend is a pure SPA: the initial load delivers a minimal HTML shell and JavaScript bundle, and all subsequent navigation and UI updates occur client-side via JavaScript without full page reloads.
- SSR/SSG frameworks (Next.js, Remix, Gatsby, Astro) are not used. They add unnecessary complexity for applications that do not need SEO or server-rendered HTML.
- Strict Mode is enabled in development to surface potential problems early.
- Proper cleanup in `useEffect` hooks and careful memory management are required to support long-running sessions.

## Do's and Don'ts

### Do

- Use React function components with hooks for all components.
- Write all React code in TypeScript (`.tsx` files).
- Use React's built-in hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) appropriately.
- Create custom hooks to encapsulate and share component logic.
- Implement proper cleanup in `useEffect` hooks to prevent memory leaks during long-running sessions.
- Use code splitting and `React.lazy` for lazy loading to optimize initial bundle size.
- Use `React.StrictMode` in development.

### Don't

- Create class components. The class component API is deprecated in favor of function components and hooks.
- Use SSR/SSG frameworks (Next.js, Remix, Gatsby, Astro) for the application frontend.
- Use other UI frameworks (Vue, Angular, Svelte) in the project.
- Implement full page reloads for navigation between routes.
- Overuse `useEffect`; prefer derived state or event handlers when possible.
- Mutate state directly; always use setter functions from `useState` or state management libraries.

## Consequences

### Positive

- React's large ecosystem provides solutions for virtually any UI requirement.
- Function components with hooks provide a simple, composable model for building UIs.
- SPA architecture eliminates server round-trips, providing instant navigation.
- Code splitting ensures only necessary code is loaded, optimizing performance.
- Strict Mode catches potential problems during development.
- The large React community ensures excellent documentation, tooling, and third-party support.

### Negative

- SPA architecture is not suitable for SEO-critical applications.
- Initial bundle must be downloaded before the application becomes interactive.
- Client-side routing requires proper configuration to handle browser history.
- Long-running sessions require careful attention to memory management and cleanup.
