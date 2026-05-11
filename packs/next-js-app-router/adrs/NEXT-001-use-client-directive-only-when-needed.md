---
id: NEXT-001
title: Use Client Directive Only When Needed
domain: architecture
rules: true
files: ["**/*.tsx", "**/*.ts", "**/*.jsx"]
---

## Context

In the Next.js App Router, components are Server Components by default. Server Components run on the server and send only HTML to the client, reducing bundle size and improving performance. The `"use client"` directive marks a component as a Client Component, which means it ships JavaScript to the browser. Adding `"use client"` unnecessarily increases the client bundle, adds hydration cost, and loses the benefits of server-side rendering for that component.

## Decision

Components must not use the `"use client"` directive unless they genuinely need client-side capabilities: React hooks (`useState`, `useEffect`, `useRef`, `useContext`), event handlers (`onClick`, `onChange`, `onSubmit`), or browser APIs (`window`, `document`). Server Components are the default and should be preferred.

- Only add `"use client"` when the component uses hooks, event handlers, or browser APIs.
- Push `"use client"` boundaries as deep in the component tree as possible.
- Extract interactive parts into small Client Components, keeping parents as Server Components.

## Do's and Don'ts

### Do

- Keep components as Server Components by default.
- Add `"use client"` only when using hooks, event handlers, or browser APIs.
- Extract small interactive pieces into dedicated Client Components.
- Pass server-fetched data to Client Components via props.

### Don't

- Add `"use client"` to components that only render static content.
- Add `"use client"` to layout components that don't need interactivity.
- Mark an entire page as a Client Component when only a small part is interactive.
- Use `"use client"` out of habit or to avoid thinking about the component boundary.

## Consequences

### Positive

- Smaller client-side JavaScript bundles.
- Faster page loads and less hydration work.
- Components that can run server-side have direct access to backend resources.

### Negative

- Developers must think about the client/server boundary for each component.
- Some component patterns require restructuring to separate interactive parts.
