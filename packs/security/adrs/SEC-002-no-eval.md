---
id: SEC-002
title: No eval() or new Function()
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

## Context

`eval()` and `new Function()` execute arbitrary strings as code at runtime. This opens the door to code injection attacks, especially when the evaluated string includes any user-controlled input. Even without user input, these constructs make code harder to analyze statically, break CSP policies, and prevent JavaScript engine optimizations.

## Decision

We ban `eval()` and `new Function()` in all application code. If dynamic code execution is genuinely needed (e.g. a plugin system), it must be sandboxed and reviewed explicitly. Test files are excluded from this rule.

- `eval(...)` is banned.
- `new Function(...)` is banned.
- `setTimeout(string, ...)` and `setInterval(string, ...)` (implicit eval) should also be avoided.

## Do's and Don'ts

### Do

- Use `JSON.parse()` for parsing JSON strings.
- Use lookup tables or maps instead of dynamic code execution.
- Use a sandboxed environment (Web Workers, VM module) if dynamic execution is truly required.

### Don't

- Use `eval()` to parse or transform data.
- Use `new Function()` to create functions from strings.
- Pass strings to `setTimeout` or `setInterval` (pass functions instead).
- Use `eval` to work around TypeScript type issues.

## Consequences

### Positive

- Eliminates an entire class of code injection vulnerabilities.
- Code is statically analyzable by tools and reviewers.
- Compatible with strict Content Security Policies.

### Negative

- Some metaprogramming patterns require alternative approaches.
- Template engines or DSL interpreters need explicit review and sandboxing.
