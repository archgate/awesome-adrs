---
id: DATA-001
title: SQLite as Embedded Database
domain: data
rules: true
files: ["packages/datamodels/**"]
---

## Context

Applications that need a lightweight, embedded database must choose a technology that impacts deployment complexity, data portability, user privacy, and application architecture. For local-first applications, CLI tools, Electron apps, and edge deployments, users should have full control of their data without requiring external database servers. The application should work without requiring separate database server installation, and users should not need to install, configure, or manage database servers. Traditional client-server databases like PostgreSQL, MySQL, or SQL Server require separate installation, network connectivity, user authentication, and ongoing maintenance, adding unnecessary complexity.

## Decision

SQLite is the embedded database. It is an embedded, serverless database engine that stores data in a single file on the local filesystem.

- **Embedded:** SQLite runs in-process with the application, requiring no separate server.
- **Serverless:** No configuration, no setup, no administration.
- **Self-contained:** The database is a single cross-platform file.
- **Zero-configuration:** Works out-of-the-box with no installation required.
- **Full SQL support:** ACID-compliant with comprehensive SQL features.
- **Cross-platform:** Works identically across macOS, Linux, and Windows.
- Use WAL (Write-Ahead Logging) mode for improved concurrent access: `PRAGMA journal_mode=WAL`.
- Set `PRAGMA busy_timeout = 30000` as the first PRAGMA after opening the database to handle file locks from cloud sync services.
- Enable foreign key constraints: `PRAGMA foreign_keys=ON`.
- Store database files in the user's application data directory, not the installation directory.

## Do's and Don'ts

### Do

- Store SQLite database files in the user's application data directory.
- Implement proper file-based backup strategies (the entire database is a single file).
- Use WAL mode for improved concurrent access.
- Set `PRAGMA busy_timeout` as the first PRAGMA after opening the database.
- Use `PRAGMA foreign_keys=ON` to enforce referential integrity.
- Handle database file permissions appropriately for user privacy.
- Close database connections properly to release file locks.

### Don't

- Attempt to use SQLite for high-concurrency multi-user scenarios.
- Store the database file in the application installation directory.
- Assume cloud-synced directories work reliably with SQLite WAL mode (use DELETE journal mode for cloud paths).
- Run any PRAGMA before `busy_timeout` (if the first PRAGMA hits a lock, it fails instantly).
- Use connection pooling (SQLite uses a single file, connection overhead is minimal).
- Bypass SQLite's type affinity system.

## Consequences

### Positive

- Zero setup required; users start immediately without installing database servers.
- True data ownership in a single portable file.
- Privacy by default; data never leaves the user's device unless explicitly exported.
- Simplified distribution as a standalone binary.
- Easy backups by copying a single file.
- No network latency; all operations are local.

### Negative

- Limited concurrency; only one writer at a time.
- Not suitable for multi-user concurrent access patterns.
- Performance and reliability depend on the underlying file system.
- No built-in replication; synchronization between devices requires custom implementation.
