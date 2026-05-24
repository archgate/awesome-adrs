---
id: ARCH-003
title: ty as Python Type Checker
domain: architecture
rules: true
files: ["packages/jobs/**"]
---

## Context

Python's dynamic typing benefits from static type checking to catch bugs early, improve code documentation, and enable better IDE support. Several type checkers exist in the Python ecosystem, including mypy (the original, maintained by the Python core team) and pyright (from Microsoft, used in Pylance). However, these tools can be slow on large codebases and have complex configuration requirements.

ty from Astral (the creators of Ruff and UV) is an extremely fast Python type checker written in Rust. It integrates seamlessly with the Ruff/UV toolchain, providing comprehensive type analysis with near-instant feedback. Using ty alongside Ruff for linting and UV for package management creates a unified, high-performance Python toolchain from a single vendor.

## Decision

**ty** is the mandatory Python type checker for all Python code. It replaces mypy and pyright.

- All Python packages must include type annotations and pass ty type checking.
- ty configuration goes in `pyproject.toml` under the `[tool.ty]` section.
- ty must be run as part of CI pipelines to enforce type safety.
- All functions must have parameter type annotations and return type annotations.
- All class attributes must have type annotations.
- Use `typing` module constructs (e.g., `Optional`, `Union`, `Protocol`) for complex types; prefer modern syntax (`X | Y`) when the minimum Python version supports it.

## Do's and Don'ts

### Do

- Add type annotations to all Python functions and classes.
- Run ty as part of CI to catch type errors before merging.
- Configure ty in `pyproject.toml` under `[tool.ty]`.
- Use `ty check` to verify type correctness locally before committing.
- Prefer modern type syntax (`str | None`) over `Optional[str]` when Python version allows.
- Keep the Astral toolchain consistent: Ruff for linting, UV for packages, ty for types.

### Don't

- Use mypy or pyright as the type checker.
- Use `# type: ignore` comments without a justification comment explaining why.
- Leave functions without return type annotations.
- Create separate type checker configuration files (`mypy.ini`, `.mypy.ini`, `pyrightconfig.json`).
- Skip type checking for new Python modules.

## Consequences

### Positive

- Extremely fast type checking with near-instant feedback, even on large codebases.
- Unified Astral toolchain (Ruff + UV + ty) with consistent configuration in `pyproject.toml`.
- Catches type-related bugs early in the development cycle.
- Improved code documentation through mandatory type annotations.
- Better IDE support and autocompletion from explicit type information.

### Negative

- ty is a newer tool; some edge cases may not yet be handled compared to mature alternatives.
- Developers unfamiliar with Python type annotations face a learning curve.
- Strict type checking may require more upfront effort when writing Python code.
- Some third-party libraries may lack type stubs, requiring manual type annotations or stubs.
