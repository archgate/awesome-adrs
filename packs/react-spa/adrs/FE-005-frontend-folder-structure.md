---
id: FE-005
title: Frontend Folder Structure
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

React applications can quickly become difficult to navigate without a standardized folder structure. As applications grow in complexity, developers need clear organization, consistent patterns, and logical separation of concerns. Without a standard structure, teams end up with inconsistent organization, scattered files, unclear boundaries between routing and UI, and poor discoverability.

For complex applications, predictable structure is especially important: it reduces onboarding time, enables AI/LLM agents to navigate the codebase effectively, supports parallel development, and clearly separates routes, pages, and reusable components.

## Decision

The frontend must follow this standardized folder structure within `packages/frontend/src/`:

- **`routes/`** -- File-based route definitions (e.g., TanStack Router). Contains route files like `__root.tsx`, `index.tsx`, and nested route directories. These files define the routing tree and reference page components.
- **`pages/`** -- Page-level layout components that are referenced by routes. Each page composes features and handles layout (e.g., `HomePage.tsx`, `UsersListPage.tsx`).
- **`components/`** -- Shared UI components organized by feature domain, each in its own folder containing the component file, styles, and stories (e.g., `components/UserCard/UserCard.tsx`).
- **`queries/`** -- Data fetching hooks and query key factories organized by domain (e.g., `queries/users.ts`).
- **`atoms/`** -- Client-side global state atoms (e.g., Jotai) for UI preferences, locale, and shared state (e.g., `atoms/ui.ts`, `atoms/preferences.ts`).
- **`api/`** -- API client configuration (e.g., `api/client.ts`).
- **`types/`** -- Shared TypeScript type definitions used across multiple modules.
- **`utils/`** -- Pure utility functions and helpers (e.g., `utils/formatters.ts`, `utils/validators.ts`).

Additional directories like `hooks/` (custom React hooks) and `assets/` (bundled images, fonts, icons) may be added as needed.

## Do's and Don'ts

### Do

- Follow the exact folder structure defined in this ADR.
- Organize components in individual folders (e.g., `components/UserCard/UserCard.tsx`).
- Keep all component-related files together (component, styles, stories) in the same folder.
- Use the `pages/` directory for page components referenced by routes.
- Organize queries by domain (e.g., `queries/users.ts`, `queries/products.ts`).
- Follow naming conventions: PascalCase for components, camelCase for utilities and hooks.

### Don't

- Create additional top-level folders in `src/` without team approval.
- Place multiple unrelated components in a single folder.
- Edit auto-generated route files manually (e.g., `routeTree.gen.ts`).
- Mix page components with reusable components in the same directory.
- Use `index.ts` files for re-exporting modules (see FE-004, No Barrel Files).
- Create deeply nested component hierarchies without good reason.

## Consequences

### Positive

- Developers always know where to find specific types of files.
- The structure scales from small to large applications.
- Each component folder is self-contained with all related files.
- Routes, pages, and components have distinct responsibilities and locations.
- Consistent patterns enable better IDE support, code generation, and AI navigation.

### Negative

- Setting up the structure requires creating multiple directories upfront.
- Component organization adds one level of nesting compared to flat structures.
- Some import paths may be slightly longer.
