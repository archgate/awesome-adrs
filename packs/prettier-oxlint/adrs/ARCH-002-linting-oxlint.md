---
id: ARCH-002
title: Code Linting with Oxlint
domain: architecture
rules: true
---

## Context

Maintaining code quality and correctness is critical for long-term maintainability, especially in a hybrid workforce of human and AI/LLM developers, where AI-generated code must be held to the same high standard. Traditional linters like ESLint are often slow, require complex configuration, and have a large dependency footprint.

Oxlint is a next-generation linter for TypeScript and JavaScript that is extremely fast (providing instant IDE feedback and quick CI runs), easy to configure with sensible defaults, and comprehensive in its coverage of correctness rules.

## Decision

Linting will be mandatory and enforced in all projects.

- For all **TypeScript** and **JavaScript** code, **Oxlint** is the exclusive linter.
- An `.oxlintrc.json` configuration file must exist at the repository root.
- Oxlint will be integrated into CI pipelines to run on every commit and pull request.
- Builds must fail on linting errors.

## Do's and Don'ts

### Do

- Integrate `oxlint` as the lint task in CI pipelines for all TypeScript and JavaScript projects.
- Run `oxlint` on every commit and pull request. Builds must fail on linting errors.
- Use the Oxlint VSCode extension for real-time feedback.
- Keep a single `.oxlintrc.json` at the repository root.

### Don't

- Use ESLint or TSLint for TypeScript code. Oxlint is the standard linter.
- Add configuration files for any forbidden linter (e.g., `.eslintrc.js`, `tslint.json`).
- Disable or add "allow failure" exceptions for linting tasks in CI/CD.

## Consequences

### Positive

- Oxlint is written in Rust and provides 50-100x faster performance than ESLint, enabling near-instant developer feedback and faster CI/CD pipelines.
- Simplified configuration with one `.oxlintrc.json` for the entire project.
- A single, enforced set of rules ensures all code, whether written by a human or an LLM, adheres to the same quality guidelines.
- Oxlint has a mature VSCode extension and integrates easily with any CI pipeline.

### Negative

- Oxlint is newer than ESLint and does not yet have 1:1 parity with the entire ESLint plugin ecosystem. Some highly specific rules may be unavailable.
- Developers familiar with ESLint's flexibility and ecosystem will need to adapt to Oxlint.
