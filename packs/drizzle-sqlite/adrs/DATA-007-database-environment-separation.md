---
id: DATA-007
title: Database Environment Separation
domain: data
rules: true
files: ["packages/datamodels/**"]
---

## Context

SQLite databases are stored as single files on the filesystem. Unlike client-server databases that run as separate instances per environment, SQLite-based applications must manage database file separation manually. Without strict separation, critical risks emerge: development code could accidentally modify production data, tests could interfere with development databases, production data could be exposed in development environments, and CI pipelines could produce non-deterministic results from shared state.

For applications that handle sensitive user data, environment separation is essential. Development should use sample data that can be freely reset, tests should run against isolated databases for reliability, and production should protect real user data from accidental corruption.

## Decision

Databases must be strictly separated across development, test, and production environments using distinct file paths and environment-based configuration.

- Use the `DATABASE_URL` environment variable to control database location. Application code must read from this variable (or `process.env`) rather than hardcoding paths.
- **Development:** Uses a file-based database in the user's application data directory (e.g., `~/.app-name/data/app.dev.db`).
- **Test:** Uses `:memory:` for speed and isolation. Each test run starts with a clean state.
- **Production:** Uses a distinct file in the user's application data directory (e.g., `~/.app-name/data/app.prod.db`). Requires explicit configuration and must never be the default.
- Default to the development database when no environment is specified; never default to production.
- Database files must not be committed to version control.

## Do's and Don'ts

### Do

- Use `DATABASE_URL` or `process.env` to determine the database file path at startup.
- Use in-memory databases (`:memory:`) for unit and integration tests.
- Provide descriptive file names that indicate the environment (e.g., `app.dev.db`, `app.test.db`, `app.prod.db`).
- Add `*.db`, `*.db-shm`, and `*.db-wal` to `.gitignore`.
- Validate the database path before critical operations to prevent environment mismatches.

### Don't

- Hardcode database file paths in application source code.
- Share database files between environments.
- Default to the production database path when no environment variable is set.
- Commit production or development databases to version control.
- Store test databases permanently on disk; clean up after CI runs.

## Consequences

### Positive

- Production data is protected from accidental modification during development.
- Tests run with isolated, clean databases, eliminating flaky test results from shared state.
- Developers can freely reset and modify development data without risk.
- CI/CD pipelines produce consistent, reproducible results.
- Clear separation makes debugging easier since it is always obvious which environment is active.

### Negative

- Developers must configure environment variables for each environment.
- Multiple database files must be managed across environments.
- Development seed data must be maintained and kept up-to-date.
