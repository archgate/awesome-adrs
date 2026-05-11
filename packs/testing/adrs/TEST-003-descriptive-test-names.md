---
id: TEST-003
title: Descriptive Test Names
domain: architecture
rules: true
files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
---

## Context

Test names serve as living documentation. When a test fails, its name is the first thing a developer reads. Generic names like "test 1" or "it works" provide no context about what broke or why. Descriptive names make test suites readable and failures actionable.

## Decision

Test descriptions must describe the expected behavior, not just label the test. They should read as sentences that explain what the code does under specific conditions. This is a warning-level rule to encourage improvement without blocking CI.

- Use the pattern: "should [verb] when [condition]" or "[verb]s [noun] when [condition]".
- Avoid single-word or numbered test names.
- `describe` blocks should name the unit under test.

## Do's and Don'ts

### Do

- Write: `"should return null when the user is not found"`.
- Write: `"parses ISO dates correctly"`.
- Write: `"throws an error for negative amounts"`.
- Use `describe` to group: `describe("UserService")`.

### Don't

- Write: `"test 1"`, `"test 2"`, `"test 3"`.
- Write: `"it works"` or `"should work"`.
- Write: `"test"` with no description.
- Use abbreviations that only the author understands.

## Consequences

### Positive

- Failed tests immediately communicate what broke.
- Test suites serve as readable documentation of behavior.
- Code reviewers can assess test coverage from names alone.

### Negative

- Writing good test names takes a few extra seconds.
- May require renaming existing tests during adoption.
