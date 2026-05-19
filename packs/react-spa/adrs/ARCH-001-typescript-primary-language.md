---
id: ARCH-001
title: TypeScript as Primary Language
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx"]
---

## Context

To ensure consistency and maintainability across the project, we must standardize on a primary programming language. Without a clear standard, we risk a fragmented ecosystem where different parts of the application use different languages (e.g., plain JavaScript, Python, Go), leading to integration challenges, increased complexity in build and deployment pipelines, difficulty sharing code and patterns, and developer friction when moving between modules.

A single, standardized language is required for the application to ensure a cohesive and maintainable codebase. TypeScript offers static type safety, excellent tooling, and a unified language across all application layers.

## Decision

The primary programming language for the project is **TypeScript**.

It will be used in all parts of the application, including backend services, frontend components, build scripts, and internal tooling.

- All new source code must be written in TypeScript (`.ts`, `.tsx`).
- Strict mode must be enabled in all `tsconfig.json` files.
- TypeScript-aware linting tools (such as Oxlint) must be used to maintain code quality.
- Type definition files (`.d.ts`) should be created and shared for common data structures and API contracts.

## Do's and Don'ts

### Do

- Use TypeScript (`.ts`, `.tsx`) for all new source code, including backend services, frontend components, shared libraries, and utility scripts.
- Enable and enforce `strict` mode in all `tsconfig.json` files.
- Create and share type definition files (`.d.ts`) for common data structures and API contracts.
- Use TypeScript-aware linting tools to maintain code quality and consistency.
- Create accurate type definitions for third-party JavaScript libraries that lack them.

### Don't

- Write new files in plain JavaScript (`.js`, `.jsx`). All new code must be TypeScript.
- Use the `any` type as a shortcut. Prefer specific types, `unknown`, or generics.
- Introduce other programming languages for new services or components within the application.
- Disable strict type-checking rules in `tsconfig.json` to bypass compilation errors.
- Commit code that fails the TypeScript compiler (`tsc`).

## Consequences

### Positive

- All code adheres to a single, high-quality standard, making it easier to maintain.
- A unified set of linting rules and code style standards applies across the entire project.
- Developers can contribute to any part of the codebase without switching language context.
- The application is more robust and self-documenting due to static types.

### Negative

- All developers must be proficient in TypeScript. Training may be required for those who are not.
- Project templates and CI/CD processes must be configured to handle TypeScript transpilation.
- The project is reliant on the TypeScript open-source project and its continued development.
