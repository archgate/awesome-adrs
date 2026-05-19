---
id: ARCH-012
title: UV as Python Package Manager
domain: architecture
rules: true
files: ["packages/jobs/**"]
---

## Context

Python projects are highly dependent on external packages from registries like PyPI. The traditional Python ecosystem for managing dependencies and virtual environments is fragmented, with many competing tools and workflows (e.g., `pip` + `venv`, `poetry`, `pipenv`). This lack of a single standard leads to inconsistent project structures and setup procedures, different incompatible lockfile formats (`poetry.lock`, `Pipfile.lock`, `requirements.txt`), and slow dependency resolution and installation times.

To ensure consistency, high performance, and reproducible builds for Python projects, a single modern tool must be standardized.

## Decision

**UV** (from Astral, the creators of Ruff) is the mandatory package and environment manager for all Python projects. It replaces pip, pipenv, poetry, and conda.

- Use `uv venv` to create virtual environments.
- Use `uv add [package]` or `uv remove [package]` to manage dependencies. These commands automatically update `pyproject.toml` and regenerate `uv.lock`.
- Use `uv sync` to install all dependencies from the lockfile.
- The `uv.lock` file must be committed to version control.
- All Python packages use `pyproject.toml` with UV-compatible configuration.
- The `uv pip` commands are explicitly forbidden in favor of the `add/remove/sync` workflow.

## Do's and Don'ts

### Do

- Use `uv venv` to create virtual environments.
- Use `uv add` and `uv remove` for dependency management.
- Use `uv sync` to install dependencies from the lockfile.
- Commit `uv.lock` and `pyproject.toml` to version control.
- Use `pyproject.toml` for all project configuration.

### Don't

- Use `pip`, `python -m venv`, `poetry`, `pipenv`, `pip-tools`, or `conda`.
- Use `uv pip install` or `uv pip uninstall`.
- Use `requirements.txt` files for locking dependencies.
- Manually edit the `uv.lock` file.
- Commit the virtual environment directory (e.g., `.venv`).
- Use `setup.py` or `setup.cfg` for project configuration.

## Consequences

### Positive

- Extreme performance with drastically reduced time for dependency resolution and installation.
- Unified tool replacing a combination of `pip`, `venv`, `pip-tools`, and `poetry`.
- Familiar `add/remove/sync` workflow for developers coming from npm, yarn, or bun.
- Clean, reproducible dependency management with `pyproject.toml` + `uv.lock`.

### Negative

- UV is a relatively new tool; commands and lockfile format may still evolve.
- Adoption friction for developers accustomed to pip, poetry, or conda workflows.
- IDE integration is still maturing for automatic dependency detection.
