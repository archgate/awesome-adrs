---
id: FE-001
title: React 19 SPA Architecture
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Desktop applications built with Tauri render their UI in a webview, making web technologies the natural choice for building the interface. The frontend framework and architecture must support complex, stateful workflows, long-running sessions (users may keep the application open for hours or days), and rich data interactions. Since the application runs inside a desktop webview, there is no need for server-side rendering or SEO optimization, which eliminates the complexity of SSR/SSG frameworks entirely.

React is the most mature and widely adopted UI framework, with the largest ecosystem of component libraries, tooling, and community resources. React 19 introduces improvements to concurrent rendering, server components (not applicable here), and overall performance. Combined with a Single Page Application architecture, React provides the ideal foundation for desktop applications: instant client-side navigation, persistent state across views, and efficient resource usage since assets are loaded once and cached for the entire session.

## Decision

The frontend uses React 19+ as a Single Page Application. No server-side rendering is used.

- React 19 or later is the sole UI framework. No other frameworks (Vue, Angular, Svelte, Solid) are permitted.
- Function components and hooks are the only component model. Class components are prohibited for all new code.
- The frontend is a pure SPA: the initial load delivers a minimal HTML shell and JavaScript bundle, and all subsequent navigation and UI updates occur client-side via JavaScript without full page reloads.
- SSR/SSG frameworks (Next.js, Remix, Gatsby, Astro) are not used. They add unnecessary complexity for a desktop application that does not need SEO or server-rendered HTML.
- Strict Mode is enabled in development to surface potential problems early.
- Proper cleanup in `useEffect` hooks and careful memory management are required to support long-running desktop sessions.

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

- Mature ecosystem with the largest selection of UI libraries, component libraries, and developer tools.
- Excellent TypeScript support with comprehensive type definitions.
- Instant client-side navigation provides a fluid, native-like experience in the desktop webview.
- Hooks provide a clean, composable model for managing component logic without class complexity.
- No SSR complexity; the SPA architecture is simpler to build, test, and deploy for desktop use cases.
- Static assets are loaded once and cached, making long-running sessions efficient.

### Negative

- Developers unfamiliar with React hooks require training.
- React is relatively unopinionated, requiring additional decisions about state management, routing, and data fetching.
- Initial bundle must be downloaded and executed before the UI is interactive (mitigated by code splitting).
- Long-running SPAs require careful attention to memory leaks and event listener cleanup.
