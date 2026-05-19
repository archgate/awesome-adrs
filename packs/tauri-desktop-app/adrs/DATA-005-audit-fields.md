---
id: DATA-005
title: Audit Fields (created_at and updated_at)
domain: data
rules: true
files: ["packages/datamodels/**"]
---

## Context

Understanding when records were created and last modified is essential for debugging, data analysis, user experience (e.g., "last updated 5 minutes ago"), and synchronization in offline-first applications. Without standardized timestamp tracking, teams forget to add timestamps to new tables, implement them inconsistently with different names or types, and lose visibility into record history. For offline-first applications, timestamp fields are critical for conflict resolution during synchronization (e.g., last-write-wins strategies) and for determining data freshness.

## Decision

Every database table must include `created_at` and `updated_at` audit fields. These fields are stored as Unix INTEGER timestamps in SQLite and are automatically populated using Drizzle ORM's dynamic column features.

- **`created_at`:** Set automatically on insert via `.$defaultFn(() => new Date())`. Must be NOT NULL.
- **`updated_at`:** Set automatically on update via `.$onUpdateFn(() => new Date())`. Nullable (only set when the record is updated).
- Field names follow snake_case in the database (`created_at`, `updated_at`) and camelCase in TypeScript code (`createdAt`, `updatedAt`).
- These fields must not be manually set in application code under normal circumstances. Drizzle manages them automatically.

## Do's and Don'ts

### Do

- Include `createdAt` / `created_at` and `updatedAt` / `updated_at` on every table.
- Use `.$defaultFn(() => new Date())` for automatic `createdAt` population on insert.
- Use `.$onUpdateFn(() => new Date())` for automatic `updatedAt` population on update.
- Store timestamps as `integer` with `{ mode: "timestamp" }` in SQLite.
- Make `createdAt` NOT NULL (always required).
- Make `updatedAt` nullable (only set on updates).
- Use these fields for sync conflict resolution in offline-first scenarios.
- Add indexes on timestamp fields if used for filtering or sorting.

### Don't

- Create tables without `createdAt` and `updatedAt` fields.
- Use different field names (e.g., `dateCreated`, `timestamp`, `modified`).
- Manually set these fields in application code. Let Drizzle handle them.
- Use string or text types for timestamp storage.
- Rely on these fields for business logic ordering. Use dedicated domain-specific fields.
- Forget to migrate existing tables to include these fields.

## Consequences

### Positive

- Consistent auditing capability across all tables.
- Always know when records were created and last modified, aiding debugging and troubleshooting.
- Timestamps enable conflict resolution for offline-first synchronization.
- Can display user-facing relative time (e.g., "created 5 minutes ago") for any record.
- Automatic management via Drizzle eliminates manual timestamp bookkeeping.
- Minimal storage and performance overhead (two INTEGER columns per table).

### Negative

- Two additional columns per table add slight schema complexity.
- Existing tables require a migration to add the fields.
- Only tracks create and update times, not who made the change or why.
- Client and server clocks may differ, which can affect sync conflict resolution accuracy.
