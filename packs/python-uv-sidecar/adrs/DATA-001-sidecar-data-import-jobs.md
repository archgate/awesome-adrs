---
id: DATA-001
title: Sidecar Data Import Jobs
domain: data
rules: true
files: ["packages/jobs/**"]
---

## Context

Applications often need to import data from external services such as APIs, file exports, or third-party platforms. These data import jobs have unique requirements: they must run as separate processes to avoid blocking the main application, they must be safe to retry without creating duplicate data, they must be configurable through both CLI arguments and environment variables, and they must be distributable as standalone executables without requiring users to install a Python runtime.

Running import jobs as sidecar processes that are packaged as standalone executables solves all of these concerns. The host application spawns the sidecar when the user triggers an import, monitors its progress, and handles the result. Each job is idempotent so that if a job fails partway through, the user can simply retry it without worrying about duplicate records.

## Decision

Data import jobs run as sidecar processes packaged as standalone executables. Jobs follow three core principles:

- **Idempotent and retry-safe:** Every job must produce the same result whether it runs once or multiple times with the same input. Use upsert operations (INSERT ... ON CONFLICT), delete-then-insert patterns, or transaction wrapping to ensure no duplicates are created on retry. Jobs must differentiate between retryable errors (e.g., network timeouts) and permanent failures (e.g., invalid data).
- **CLI interface with environment variable fallbacks:** All jobs expose a CLI interface using `argparse`. Every parameter accepts both a CLI argument (kebab-case, e.g., `--api-key`) and an environment variable fallback (SCREAMING_SNAKE_CASE, e.g., `API_KEY`). The main function receives all configuration as typed parameters; environment variables are resolved only at the entry point.
- **Packaged with PyInstaller as single-file executables:** Jobs are bundled with PyInstaller `--onefile` mode into standalone executables that embed the Python interpreter and all dependencies. The resulting binary (~15-30MB) can be executed directly without requiring Python to be installed. Each job defines an `entry_point.py` wrapper and a `[project.scripts]` entry in `pyproject.toml`.
- **Event-driven triggering:** Jobs are triggered by user actions in the application (e.g., clicking an import button), not by fixed schedules or cron jobs.

## Do's and Don'ts

### Do

- Use upsert or delete-insert patterns to ensure idempotency on every data write.
- Wrap entire job logic in database transactions to maintain consistency on failure.
- Use `argparse` for CLI argument parsing with `os.getenv()` defaults for all parameters.
- Define a `[project.scripts]` entry point in `pyproject.toml` and an `entry_point.py` wrapper for PyInstaller.
- Test idempotency by running jobs multiple times with the same input and verifying no duplicates.
- Keep secrets (API keys, tokens) as CLI arguments or environment variables, never hardcoded.
- Use deterministic IDs for records to prevent duplicates across retries.

### Don't

- Use blind INSERT without ON CONFLICT for data that may already exist.
- Rely on auto-increment IDs or timestamps as idempotency keys.
- Hardcode configuration values in job source code.
- Read environment variables deep inside job logic; resolve them at the entry point and pass as function arguments.
- Run jobs on fixed schedules or cron; trigger them from user actions.
- Skip the PyInstaller packaging step; always test with the built binary.

## Consequences

### Positive

- Jobs can be safely retried after failures without data corruption or duplication.
- Consistent CLI interface makes jobs testable and debuggable in any environment.
- Single-file executables simplify application distribution; no Python runtime required on user machines.
- Sidecar architecture keeps the main application responsive during long-running imports.
- Self-contained binaries are easy to version, deploy, and roll back.

### Negative

- PyInstaller adds build time (~20-30 seconds) and produces platform-specific binaries.
- Idempotent job design requires more careful planning than naive inserts.
- Each job needs boilerplate for argument parsing and entry point configuration.
- Built binaries are 15-30MB each due to the embedded Python interpreter.
