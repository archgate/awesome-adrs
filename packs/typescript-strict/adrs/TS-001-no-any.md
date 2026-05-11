---
id: TS-001
title: No Any Types
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx"]
---

## Context

The `any` type disables TypeScript's type checking entirely, defeating the purpose of using TypeScript in the first place. Code that uses `any` loses all type safety guarantees, allowing bugs to slip through that the compiler would otherwise catch. It also degrades IDE support and makes refactoring risky.

## Decision

We ban the use of the `any` type across the codebase. All variables, parameters, return types, and type assertions must use specific types, `unknown`, or generics instead.

- Use `unknown` when the type is truly not known, then narrow with type guards.
- Use generics when writing reusable code that works across types.
- Declaration files (`.d.ts`) are excluded from this rule.

## Do's and Don'ts

### Do

- Use `unknown` and narrow the type before using it.
- Use generics for flexible, type-safe abstractions.
- Use specific union types when a value could be one of several types.
- Use `as unknown as T` if a cast is absolutely necessary (and document why).

### Don't

- Use `: any` as a type annotation.
- Use `as any` to silence type errors.
- Use `<any>` as a generic type argument.
- Suppress the rule with eslint-disable comments without a reviewed justification.

## Consequences

### Positive

- Type errors are caught at compile time instead of runtime.
- IDE autocompletion and refactoring tools work reliably.
- Code is self-documenting through its type annotations.

### Negative

- Some third-party library integrations require extra type work.
- Initial migration from JavaScript may take longer.
