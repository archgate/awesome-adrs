---
id: ARCH-001
title: Code Formatting with Prettier
domain: architecture
rules: true
---

## Context

Code formatting is a major source of debate and developer friction. In a hybrid workforce of human and AI/LLM developers, stylistic consistency is critical for readability and maintainability. AI-generated code can have wide variations in style, and human developers have their own preferences. We require a "zero-tolerance" policy for formatting, where a single, opinionated tool makes all stylistic decisions.

Prettier is the industry-defining standard formatter for the JavaScript and TypeScript ecosystem. It is fast, opinionated, and integrates seamlessly with standard IDEs and CI pipelines.

## Decision

Formatting will be mandatory and enforced in all projects.

- For all **TypeScript**, **JavaScript**, **JSON**, **YAML**, and **Markdown** files, **Prettier** is the exclusive formatter.
- Prettier will be configured to run automatically in the IDE (e.g., on save) and will be enforced via a check in all CI/CD pipelines.
- Builds must fail on formatting errors.
- A Prettier configuration file (e.g., `.prettierrc.json` or `prettier.config.js`) must exist at the repository root.

## Do's and Don'ts

### Do

- Integrate `prettier --check` in CI pipelines. Builds must fail on formatting errors.
- Use the Prettier VSCode extension with "format on save" configured.
- Keep a single Prettier config at the repository root.

### Don't

- Use any other formatter for JavaScript or TypeScript. Do not use ESLint for formatting.
- Debate formatting rules in a pull request. If the code passes the formatter, the style is correct.
- Commit unformatted code.
- Disable or add "allow failure" exceptions for format-check tasks in CI/CD.

## Consequences

### Positive

- The formatter's output is the final word, eliminating all style debates from code reviews.
- All code, whether written by any developer or an LLM, will be visually consistent, reducing cognitive load.
- Prettier is the industry-defining standard for the web ecosystem, handling TypeScript, JavaScript, JSON, YAML, and Markdown.
- Prettier has an excellent VSCode extension and is simple to configure in any CI pipeline.

### Negative

- Opinionated formatting means developers who dislike specific style choices have no alternative. This is a deliberate trade-off in favor of consistency.
