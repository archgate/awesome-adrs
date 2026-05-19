---
id: ARCH-001
title: Bun as Package Manager and Runtime
domain: architecture
rules: true
files: ["package.json", "bun.lock", "bunfig.toml"]
---

## Context

The project uses TypeScript as its primary language and relies heavily on external packages from the npm registry. Managing these dependencies requires a standard package manager, and executing TypeScript code requires a runtime. The JavaScript ecosystem has several options for each role: `npm`, `yarn`, `pnpm`, and `bun` for package management; `node` with `ts-node`/`nodemon` or `bun` for runtime execution.

Without a single standard, teams may use different package managers, leading to multiple competing lockfiles (`package-lock.json`, `yarn.lock`, `bun.lock`), inconsistent `node_modules` structures, and varying performance. Similarly, the traditional approach of transpiling TypeScript to JavaScript with `tsc` and then executing with Node.js introduces unnecessary complexity and requires workarounds like `ts-node` and `nodemon` for development hot-reloading.

Bun is a modern, high-performance tool that serves as both a package manager and a TypeScript runtime, eliminating the need for separate tools and providing a unified developer experience.

## Decision

**Bun** is the official and mandatory package manager and TypeScript runtime for the project.

As a **package manager**:

- `bun install`, `bun add`, and `bun remove` are the only permitted package management commands.
- `bun.lock` is the sole source of truth for locked dependencies and must be committed to version control.
- No other lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) are permitted.

As a **runtime**:

- All TypeScript backend services must be executed directly by `bun` (e.g., `bun src/index.ts`).
- The Vite development server must be launched using `bun` as its runtime.
- `bun --watch` replaces `ts-node`, `nodemon`, and `ts-node-dev` for development hot-reloading.
- Bun executes TypeScript directly, in-memory, with no separate build step. Note that Bun does not type-check code; static type-checking via `tsc --noEmit` remains a separate, mandatory step.

## Do's and Don'ts

### Do

- Use `bun install` to install dependencies from a `package.json` file.
- Use `bun add [package]`, `bun add -d [package]`, and `bun remove [package]` to manage dependencies.
- Commit the `bun.lock` file to your Git repository.
- Execute backend TypeScript files directly using `bun` (e.g., `bun src/index.ts`).
- Use `bun --watch src/index.ts` for built-in hot-reloading during development.
- Launch the Vite development server using `bun` (e.g., `bun run vite dev`).
- Maintain a separate script for static type-checking using `tsc --noEmit`.

### Don't

- Use `npm install`, `yarn add`, `pnpm add`, or any other package management commands.
- Commit `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` to the repository.
- Manually edit the `bun.lock` file.
- Use `node` to run the application in any environment.
- Install or add `ts-node`, `nodemon`, or `tsx` as dependencies. `bun --watch` replaces them.
- Maintain a `tsc` build step for the purpose of execution. Run TypeScript files directly.
- Assume `bun` is type-checking your code.

## Consequences

### Positive

- Significantly faster dependency installation, improving local developer experience and CI/CD pipeline speed.
- A single, unified lockfile (`bun.lock`) ensures reproducible and reliable builds across all environments.
- Eliminates a large number of dev dependencies (`ts-node`, `nodemon`, etc.), simplifying the toolchain.
- Bun's startup time and hot-reloading speed are orders of magnitude faster than the `ts-node` + `nodemon` approach.
- TypeScript and JSX are treated as first-class citizens by the runtime.
- A unified toolchain (`bun`) for both package management and execution simplifies developer experience.

### Negative

- Bun is a newer tool compared to `npm` or `yarn` and may have undiscovered edge cases.
- Some older developer tools or IDE extensions may have better default integration with `npm` and require configuration.
- While Bun has near-complete Node.js API compatibility, it is not 100%. Obscure packages relying on native C++ bindings or internal Node.js APIs may not function correctly.
- The project commits to a runtime that is newer than Node.js, carrying an "early adopter" risk.
