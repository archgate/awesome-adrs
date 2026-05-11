---
id: TS-003
title: Strict tsconfig
domain: architecture
rules: true
files: ["tsconfig.json"]
---

## Context

TypeScript's `strict` flag enables a suite of type-checking options that catch common mistakes: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `noImplicitAny`, `noImplicitThis`, and more. Without `strict: true`, TypeScript operates in a lenient mode that allows many unsafe patterns through silently.

## Decision

Every project must set `"strict": true` in its `tsconfig.json` `compilerOptions`. Individual strict sub-flags must not be disabled. If a project uses multiple tsconfig files (e.g. for tests), all of them must inherit or set `strict: true`.

- `compilerOptions.strict` must be `true`.
- Do not set `strictNullChecks: false` or any other sub-flag to `false`.

## Do's and Don'ts

### Do

- Set `"strict": true` in `tsconfig.json`.
- Extend a shared base tsconfig that already has strict enabled.
- Fix strict-mode errors rather than disabling the flag.

### Don't

- Set `"strict": false` or omit it entirely.
- Disable individual strict sub-flags like `"strictNullChecks": false`.
- Use `// @ts-ignore` to suppress strict-mode errors without justification.

## Consequences

### Positive

- Maximum type safety from the TypeScript compiler.
- Catches null/undefined errors, implicit any, and other common pitfalls.
- Consistent strictness across all team members and CI.

### Negative

- Existing projects may need migration effort to fix new errors.
- Some third-party type definitions may not be fully strict-compatible.
