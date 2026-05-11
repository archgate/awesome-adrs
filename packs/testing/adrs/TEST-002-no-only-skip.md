---
id: TEST-002
title: No .only() or .skip() in Committed Tests
domain: architecture
rules: true
files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
---

## Context

Test runners like Vitest, Jest, and Mocha support `.only()` to run a single test and `.skip()` to disable tests. These are useful during development but must never be committed. A committed `.only()` silently causes CI to skip all other tests in that suite, and a committed `.skip()` means tests rot without anyone noticing.

## Decision

No `.only()` or `.skip()` calls may be committed to test files. CI must catch these and fail the build. If a test is genuinely broken and needs to be skipped, open an issue and use a `TODO` comment referencing the issue number.

- `describe.only`, `it.only`, `test.only` are all banned.
- `describe.skip`, `it.skip`, `test.skip` are all banned.

## Do's and Don'ts

### Do

- Use `.only()` locally during development, then remove before committing.
- Delete or fix broken tests rather than skipping them.
- Use `TODO(#issue)` comments if a test must be temporarily disabled.

### Don't

- Commit `.only()` — it silently disables other tests.
- Commit `.skip()` — it hides broken tests.
- Use `.skip()` as a permanent solution for flaky tests.

## Consequences

### Positive

- CI always runs the full test suite.
- No tests silently rot behind `.skip()`.
- Test coverage stays accurate.

### Negative

- Developers must remember to remove `.only()` before pushing.
- Genuinely broken tests need a real fix rather than a quick skip.
