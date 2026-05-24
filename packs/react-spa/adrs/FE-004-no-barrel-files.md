---
id: FE-004
title: No Barrel Files
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Barrel files (also known as index files or re-export files) are `index.ts` or `index.tsx` files that re-export modules from a directory, allowing shorter import paths. While they appear to simplify imports, barrel files introduce significant problems in modern frontend tooling:

- **Tree-shaking failures:** Bundlers struggle to eliminate unused code when a barrel file references all exports in a directory. Even importing one component may pull in dependencies of every component in the barrel.
- **Slow HMR:** Development servers like Vite must process entire barrel files even when only one export is used, slowing Hot Module Replacement.
- **Circular dependencies:** Barrel files increase the likelihood of circular references when modules in the same directory import from each other.
- **Obscured import graph:** Direct imports make the actual source location of each module explicit. Barrel files hide this, making refactoring harder and reducing the effectiveness of IDE features like "go to definition."

For modern web applications where bundle size and startup performance matter, the small convenience of shorter import paths is not worth the significant performance cost.

## Decision

Frontend code must **not** use barrel files (`index.ts` / `index.tsx` re-export files). All imports must specify the exact file path containing the exported module.

- **Prohibited:** `index.ts` or `index.tsx` files whose purpose is re-exporting from other modules (`export { } from`, `export * from`, `export { default } from`).
- **Required:** Import directly from the actual source file (e.g., `import { Button } from './components/Button/Button'`).
- **Scope:** This applies to all directories within the frontend package (`src/components/`, `src/utils/`, `src/hooks/`, etc.).
- **Exceptions:** Legitimate entry points such as `src/main.tsx` and route `index.tsx` files used by file-based routers are not barrel files and are allowed.

## Do's and Don'ts

### Do

- Import directly from the specific file containing the export.
- Use IDE auto-import features to generate correct import paths.
- Organize files following the standard folder structure to keep import paths manageable.

### Don't

- Create `index.ts` or `index.tsx` files that re-export modules from a directory.
- Create intermediate re-export files with other names (e.g., `exports.ts`, `all.ts`).
- Import from a directory path (e.g., `from '../components'`) instead of from the specific file.
- Create monolithic files with multiple exports just to avoid multiple imports.

## Consequences

### Positive

- Tree shaking works correctly, eliminating unused code from production bundles.
- HMR updates are faster and more targeted during development.
- Import statements clearly show which specific file is being used, aiding navigation and refactoring.
- Circular dependency risks are significantly reduced.
- No maintenance overhead of keeping barrel files up to date.

### Negative

- Import paths are more verbose; multiple components from the same directory require separate import statements.
- Developers accustomed to barrel files may need time to adjust.
