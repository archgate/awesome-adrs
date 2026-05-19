---
id: ARCH-006
title: Code Formatting (Prettier + Ruff)
domain: architecture
rules: true
---

## Context

Code formatting is a major source of debate and developer friction. In a hybrid workforce of human and AI/LLM developers, stylistic consistency is critical for readability and maintainability. AI-generated code can have wide variations in style, and human developers have their own preferences. We require a "zero-tolerance" policy for formatting, where a single, opinionated tool makes all stylistic decisions.

The project is polyglot, using TypeScript for the application and potentially Python for data tasks. Each ecosystem has a best-in-class formatter: Prettier for the web ecosystem and Ruff for Python. Both are fast, opinionated, and integrate seamlessly with standard IDEs and the Moonrepo build system.

## Decision

Formatting will be mandatory and enforced in all projects.

- For all **TypeScript**, **JSON**, **YAML**, and **Markdown** files, **Prettier** is the exclusive formatter.
- For all **Python** code, **Ruff Formatter** is the exclusive formatter.
- These tools will be configured to run automatically in the IDE (e.g., on save) and will be enforced via a check in all CI/CD pipelines.
- Builds must fail on formatting errors.
- A Prettier configuration file (e.g., `.prettierrc.json` or `prettier.config.js`) must exist at the repository root.
- Ruff format settings should be configured in `pyproject.toml` for Python projects.

## Do's and Don'ts

### Do

- Integrate `prettier --check` as a `format-check` task in Moon task configurations for all TypeScript projects.
- Integrate `ruff format --check` as a `format-check` task for all Python projects.
- Run all `format-check` tasks as part of `moon ci`. Builds must fail on formatting errors.
- Use the Prettier and Ruff VSCode extensions with "format on save" configured.
- Keep a single Prettier config at the repository root.

### Don't

- Use any other formatter. For Python, do not use `black`, `isort`, `yapf`, etc. For web, do not use ESLint for formatting.
- Debate formatting rules in a pull request. If the code passes the formatter, the style is correct.
- Commit unformatted code.
- Disable or add "allow failure" exceptions for `format-check` tasks in CI/CD.

## Consequences

### Positive

- The formatter's output is the final word, eliminating all style debates from code reviews.
- All code, whether written by any developer or an LLM, will be visually consistent, reducing cognitive load.
- Prettier is the industry-defining standard for the web ecosystem, handling TypeScript, JSON, YAML, and Markdown.
- Ruff Formatter is written in Rust, extremely fast, and a drop-in replacement for `black` and `isort`.
- Both tools have excellent VSCode extensions and are simple to configure as Moonrepo tasks.

### Negative

- Opinionated formatting means developers who dislike specific style choices have no alternative. This is a deliberate trade-off in favor of consistency.
- Two separate formatters are maintained (one for web, one for Python), adding minor configuration overhead.
