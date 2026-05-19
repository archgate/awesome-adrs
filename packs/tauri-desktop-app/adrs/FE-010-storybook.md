---
id: FE-010
title: Storybook for Component Development
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Developing UI components in isolation provides significant benefits for desktop application frontends:

- **Faster iteration** without running the full application or Tauri shell
- **Better testing** of component variations, edge cases, and all visual states
- **Living documentation** of components with interactive examples
- **Visual regression testing** with pixel comparison to catch UI bugs
- **Component catalog** for discovering and reusing components across the app

Without a component development tool, developers must run the full application to see component changes, manually navigate to specific views, and struggle to test all component states. This leads to duplicated components, inconsistent patterns, and poor quality assurance. Storybook is the industry-standard tool for isolated component development with widespread adoption and extensive ecosystem support.

## Decision

The frontend must use **Storybook 8+** for developing and testing components in isolation.

- **Colocated stories:** Every presentational component `.tsx` file must have a corresponding `.stories.tsx` file in the same directory.
- **Play functions:** Use Storybook's `play()` functions for interaction tests that verify callbacks are invoked.
- **MSW (Mock Service Worker):** All API mocking in stories must use MSW. No real API calls in stories.
- **Visual regression testing:** Use pixel comparison for visual snapshots to catch unintended UI changes.
- **Controls/args:** Use Storybook controls for interactive property testing.
- **Core states:** Component stories should cover key states: Default, Empty, Loading, and Error (where applicable).
- **Accessibility:** Use the a11y addon to test WCAG compliance.
- **Vite integration:** Use the Vite builder for fast refresh and build performance.
- **Event handler mocks:** Use `fn()` from `storybook/test` for all event handler args in `meta.args` so they are inherited by all stories automatically.

## Do's and Don'ts

### Do

- Create Storybook stories for all presentational and connected components.
- Colocate `.stories.tsx` files next to their component files.
- Test all component variations (different props, states, sizes) in stories.
- Use MSW to mock API calls in connected component and page stories.
- Use `fn()` from `storybook/test` for event handler args, declared in `meta.args`.
- Use `play()` functions to verify callbacks are invoked with correct arguments.
- Tag interaction-only stories with `tags: ["!snapshot"]` and an `Interaction` suffix.
- Use deterministic mock data in stories (no `new Date()`, `Math.random()`, etc.).
- Use MSW handlers in object notation for automatic Storybook parameter merging.

### Don't

- Skip writing stories for reusable components.
- Make real API calls in stories; always use MSW.
- Use `console.log` for event handler args; use `fn()` instead.
- Repeat `fn()` mocks in individual story args; place them in `meta.args`.
- Write play functions that only assert `toBeInTheDocument()` without testing callbacks.
- Use non-deterministic data in story args (e.g., `new Date()`, `Date.now()`, `Math.random()`).
- Use `within(document.body)` or `within(screen)` in play functions; use `within(canvasElement)` or `within(canvasElement.ownerDocument.body)` for portals.

## Consequences

### Positive

- Components are developed and tested in isolation, speeding up iteration.
- Stories serve as living documentation for component usage and states.
- Visual regression testing catches unintended UI changes before they reach production.
- The component catalog promotes reuse and consistency across the application.
- Play functions provide lightweight interaction testing integrated into Storybook.

### Negative

- Initial setup overhead for Storybook configuration and MSW integration.
- Stories must be maintained alongside components, adding to development effort.
- Adds another build target to the project CI pipeline.
