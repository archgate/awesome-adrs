---
id: ARCH-009
title: Centralized Dependency Versions
domain: architecture
rules: true
files: ["package.json", "**/package.json"]
---

## Context

In a monorepo structure with multiple TypeScript packages (backend, frontend, datamodels, desktop, jobs), managing dependency versions consistently across all packages is challenging. Without a centralized version management strategy, several problems arise: version drift where different packages use different versions of the same dependency, duplicate resolutions that increase bundle size and potential for bugs, update complexity requiring changes in multiple `package.json` files, and inconsistent behavior across packages from different versions of shared tools.

A centralized version management system ensures that all packages in the monorepo use the same versions of shared dependencies, particularly for build tools (TypeScript, Vite), linting and formatting tools, core frameworks, type definitions, and ORMs and database libraries.

## Decision

All TypeScript packages must use a **package version catalog** for centralized dependency version management. The root `package.json` must include a catalog section that defines shared package versions. Every dependency used in workspace packages must be defined in the root catalog first, then referenced using the `catalog:` protocol. Workspace-internal dependencies use the `workspace:` protocol.

- The root `package.json` catalog is the single source of truth for all dependency versions.
- Individual workspace packages reference catalog versions using `catalog:` in their `package.json` files.
- Inter-workspace dependencies use `workspace:` to reference sibling packages.
- Having direct version specifications in individual workspace packages without a corresponding catalog entry is a violation.
- Update versions in the catalog first, then run the package manager install command to propagate changes.

## Do's and Don'ts

### Do

- Add all dependencies to the catalog before using them in workspace packages.
- Use `catalog:` syntax in all workspace `package.json` files for every external dependency.
- Use `workspace:` syntax for dependencies on sibling packages within the monorepo.
- Update versions in the catalog first, then install to propagate changes.
- Treat the catalog as the single source of truth for all package versions.

### Don't

- Specify versions directly in workspace packages (e.g., `"package": "^1.2.3"`).
- Add dependencies to workspace packages without first adding them to the catalog.
- Use package manager update commands that bypass the catalog and add direct version specifications.
- Add `dependencies` or `devDependencies` with explicit versions to the root `package.json` outside the catalog.

## Consequences

### Positive

- Single source of truth for all dependency versions across the entire monorepo.
- Zero version drift since all packages use the same version of every shared dependency.
- Easier dependency updates by changing version once in the catalog.
- Simplified code reviews with all version changes in one file.
- Maximum deduplication by the package manager.

### Negative

- All packages must use the same version of every dependency (no per-package version overrides).
- Larger initial catalog setup as all dependencies must be cataloged.
- Breaking changes in a dependency affect all packages that use it simultaneously.
