---
id: TS-004
title: No Non-Null Assertions
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx"]
---

## Context

The non-null assertion operator (`!`) tells TypeScript to treat a possibly null or undefined value as definitely defined. This bypasses the compiler's null-safety checks and can lead to runtime errors when the assumption turns out to be wrong. It is especially dangerous because it silently removes a safety net that `strictNullChecks` provides.

## Decision

We do not use the non-null assertion operator (`!.` or `!)`). Instead, we use proper null checks, optional chaining, or narrowing to handle nullable values safely.

- Use `if (value)` guards or optional chaining (`?.`) instead.
- Use nullish coalescing (`??`) to provide defaults.
- If you are certain a value exists, prove it with a runtime check or assertion function.

## Do's and Don'ts

### Do

- Use optional chaining: `user?.name`.
- Use nullish coalescing: `value ?? defaultValue`.
- Use type narrowing: `if (value !== null) { ... }`.
- Use assertion functions for invariants: `assertDefined(value)`.

### Don't

- Use `value!.property` to bypass null checks.
- Use `value!` in return statements or assignments.
- Chain multiple non-null assertions: `a!.b!.c`.

## Consequences

### Positive

- Null-related runtime errors are prevented by the compiler.
- Code is more explicit about how it handles nullable values.

### Negative

- Slightly more verbose code in places where the value is guaranteed.
- May need helper assertion functions for complex invariants.
