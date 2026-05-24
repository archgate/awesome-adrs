---
id: ARCH-002
title: Standardized Monorepo Folder Structure
domain: architecture
rules: true
---

## Context

A monorepo containing multiple polyglot projects can become chaotic without a strictly enforced folder structure. For a modern application that includes multiple packages such as frontend, backend, shared libraries, and utilities, a clear layout is critical for developer onboarding (reducing cognitive load), AI/LLM navigation (providing a predictable structure for agents), tooling integration (allowing Moonrepo to automatically discover projects), and simplicity (ensuring all code lives under a single, unified top-level directory).

Without a standard, developers create ad hoc directory structures (`/src`, `/lib`, `/server`, `/apps`) that fragment the codebase and break assumptions made by the build system, linters, and other tooling.

## Decision

All projects must adhere to a standardized root-level folder structure. All project source code, whether for deployable applications or shared libraries, will be co-located under the `/packages` directory.

- **`/packages`**: Contains all project source code. Every deployable application, shared library, and data job lives here. Typical layout includes `packages/frontend`, `packages/backend`, `packages/desktop`, `packages/datamodels/`, `packages/functions/`, and `packages/jobs/`.
- **`/.moon`**: Moonrepo workspace configuration, including shared task configurations, toolchain versions, and workspace definition.
- **`/docs`**: Human-readable project documentation only (feature plans, analysis, specs). Not for governance records.
- **`/scripts`**: Utility and automation scripts used by Moon tasks or developer tooling.
- **Root-level config**: All workspace-wide configuration files (`.oxlintrc.json`, `.prettierrc.json`, `tsconfig.json`, `bunfig.toml`, `.prototools`) must reside at the repository root.

## Do's and Don'ts

### Do

- Place all project code (applications, libraries, jobs) into a subdirectory under `/packages`.
- Add a `moon.yml` file for every project, including the root (`/moon.yml`).
- Define all toolchain versions in the root `.prototools` file.
- Place all global configuration files in the repository root.
- Place project narrative documentation (specs, analysis, plans) in the `/docs` directory.

### Don't

- Create any new top-level directories for source code (e.g., `/src`, `/lib`, `/server`, `/apps`). All project code must live within `packages/`.
- Edit `bun.lock` manually. It is managed exclusively by `bun install`.
- Add utility or automation scripts as standalone Moon projects. Place them in `/scripts/` instead.
- Commit IDE-specific files (like `.idea/`) to the repository.

## Consequences

### Positive

- All project code lives under a single top-level `/packages` directory, simplifying glob patterns and developer navigation.
- Moonrepo can automatically discover projects via wildcard-based globs.
- Centralized configuration makes tooling easy to find and manage.
- AI agents can predictably navigate the codebase due to the consistent structure.

### Negative

- The clear, top-level structural distinction between deployable "apps" and shareable "packages" is lost. Developers must rely on project naming or inspecting `moon.yml` files to understand a component's purpose.
- Without `apps/` and `packages/` guardrails, there is a risk of projects being created with ambiguous purposes.
