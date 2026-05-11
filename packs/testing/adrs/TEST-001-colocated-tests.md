---
id: TEST-001
title: Colocated Test Files
domain: architecture
rules: true
files: ["src/**/*.ts", "src/**/*.tsx"]
---

## Context

When test files live in a separate `__tests__/` or `tests/` directory tree, navigating between source and test becomes cumbersome. Developers are less likely to write tests when they have to hunt for the right location. Colocated tests make the relationship between source and test immediately visible in the file tree.

## Decision

Test files must be colocated with the source files they test. A test for `src/utils/parse.ts` must live at `src/utils/parse.test.ts` or `src/utils/parse.spec.ts`. We do not use a separate top-level `tests/` directory for unit tests.

- Test files use the `.test.ts` or `.spec.ts` suffix.
- Integration or end-to-end tests may live in a dedicated `e2e/` directory.
- Test utilities and fixtures can live in `__fixtures__/` or `__helpers__/` directories.

## Do's and Don'ts

### Do

- Place `foo.test.ts` next to `foo.ts` in the same directory.
- Use `.test.ts` or `.spec.ts` as the suffix consistently across the project.
- Keep test helper files close to the tests that use them.

### Don't

- Create a parallel `tests/` directory that mirrors the `src/` tree.
- Put unit tests in `__tests__/` directories far from the source.
- Mix unit test files and e2e test files in the same location.

## Consequences

### Positive

- Source and test are always visible together in the file explorer.
- Moving or renaming a source file naturally includes its test.
- New team members can find tests immediately.

### Negative

- Directories may look busier with both source and test files.
- Build tooling must be configured to exclude test files from production bundles.
