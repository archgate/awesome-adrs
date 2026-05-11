---
id: TS-002
title: Explicit Return Types on Exported Functions
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx"]
---

## Context

When exported functions lack explicit return types, TypeScript infers them from the implementation. This means that internal refactoring can unintentionally change the public API, and consumers get weaker type information. Explicit return types act as a contract between the function and its callers, making breaking changes visible at the declaration site.

## Decision

All exported functions and methods must have explicit return type annotations. This applies to `export function`, `export const` arrow functions, and public class methods. Private/internal functions may rely on inference.

- Named exports must declare their return type.
- Default exports must declare their return type.
- Inline callbacks and private helpers are exempt.

## Do's and Don'ts

### Do

- Add return types to all exported functions: `export function parse(input: string): ParseResult`.
- Add return types to exported arrow functions: `export const fetch = async (url: string): Promise<Response> =>`.
- Use descriptive return types rather than inline object shapes when possible.

### Don't

- Omit return types on exported functions and rely on inference.
- Use overly broad return types like `object` or `{}`.
- Add return types to every single internal helper (focus on the public API).

## Consequences

### Positive

- Public API contracts are explicit and reviewable in diffs.
- Accidental breaking changes are caught at compile time.
- Documentation generators produce accurate type information.

### Negative

- Slightly more verbose function signatures.
- Requires updating return types when the contract genuinely changes.
