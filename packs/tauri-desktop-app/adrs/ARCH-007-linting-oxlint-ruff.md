---
id: ARCH-007
title: Code Linting (Oxlint + Ruff)
domain: architecture
rules: true
---

## Context

Maintaining code quality and correctness is critical for long-term maintainability, especially in a hybrid workforce of human and AI/LLM developers, where AI-generated code must be held to the same high standard. Traditional linters like ESLint or Pylint are often slow, require complex configuration, and have a large dependency footprint.

The project is polyglot, using TypeScript as the primary language and Python for data tasks. We require a linting solution that is extremely fast (providing instant IDE feedback and quick CI runs), easy to configure with sensible defaults, comprehensive in its coverage of correctness rules, and well-integrated with Moonrepo and the standard IDE.

## Decision

Linting will be mandatory and enforced in all projects.

- For all **TypeScript** code, **Oxlint** is the exclusive linter.
- For all **Python** code, **Ruff** is the exclusive linter.
- An `.oxlintrc.json` configuration file must exist at the repository root.
- Ruff lint settings should be configured in `pyproject.toml` for Python projects.
- These tools will be integrated into the monorepo to run on every commit and pull request via Moonrepo tasks.
- Builds must fail on linting errors.

## Do's and Don'ts

### Do

- Integrate `oxlint` as the `lint` task in Moon task configurations for all TypeScript projects.
- Integrate `ruff check` as the `lint` task for all Python projects.
- Run `oxlint` and `ruff check` as part of `moon ci`. Builds must fail on linting errors.
- Use the Oxlint and Ruff VSCode extensions for real-time feedback.
- Keep a single `.oxlintrc.json` at the repository root.

### Don't

- Use ESLint or TSLint for TypeScript code. Oxlint is the standard linter.
- Use Pylint, Flake8, or any other linter for Python code. Ruff is the standard linter.
- Add configuration files for any forbidden linter (e.g., `.eslintrc.js`, `tslint.json`, `.flake8`, `.pylintrc`).
- Disable or add "allow failure" exceptions for linting tasks in CI/CD.

## Consequences

### Positive

- Both Oxlint and Ruff are written in Rust and provide 50-100x faster performance than their Node.js/Python counterparts (ESLint, Pylint), enabling near-instant developer feedback and faster CI/CD pipelines.
- Ruff replaces a multitude of Python tools (Flake8, Pylint, isort, etc.) with a single binary.
- Simplified configuration with one `.oxlintrc.json` for TypeScript and one `pyproject.toml` section for Python.
- A single, enforced set of rules ensures all code, whether written by a human or an LLM, adheres to the same quality guidelines.
- Both tools have mature VSCode extensions and integrate easily with Moonrepo.

### Negative

- Oxlint is newer than ESLint and does not yet have 1:1 parity with the entire ESLint plugin ecosystem. Some highly specific rules may be unavailable.
- Developers familiar with ESLint's flexibility and ecosystem will need to adapt to Oxlint.
