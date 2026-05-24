---
id: DATA-004
title: UUID v7 Primary Keys
domain: data
rules: true
files: ["packages/datamodels/**"]
---

## Context

Traditional auto-incrementing integer primary keys require the database to generate the next sequential ID, which only works when connected to the database. For offline-first and distributed applications, this creates problems: users cannot create records while offline, synchronization between devices produces ID conflicts, and every insert requires a database round trip to obtain the generated ID.

UUIDs (Universally Unique Identifiers) solve these issues by allowing any client to generate a globally unique key without coordination. UUID v7 is preferred over UUID v4 because it encodes a Unix timestamp in the first 48 bits, making the IDs time-ordered. Time ordering provides better B-tree index locality, natural chronological sorting, and improved insert performance compared to fully random UUIDs.

## Decision

All database tables must use UUID v7 as primary keys. UUIDs are stored as `text` in SQLite in canonical format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). Primary keys must be defined as `text("id").primaryKey()` with a `$defaultFn` that generates a UUID v7 value.

- **Backend (Bun runtime):** Use `Bun.randomUUIDv7()` for generation.
- **Frontend:** Use `import { v7 as uuidv7 } from "uuid"` for generation.
- **General TypeScript:** `crypto.randomUUID()` generates v4 only and must not be used for primary keys.
- Foreign key columns referencing UUID primary keys must also be `text` type.

## Do's and Don'ts

### Do

- Use UUID v7 for all new table primary keys.
- Generate UUIDs client-side before inserting records to support offline-first workflows.
- Use Drizzle's `.$defaultFn()` with a UUID v7 generator for the `id` column.
- Store UUIDs as `text` in SQLite in canonical format (with dashes).
- Index UUID columns used as foreign keys.
- Validate UUID format when accepting external input.

### Don't

- Use auto-incrementing integer primary keys for user data tables.
- Use UUID v4 (`crypto.randomUUID()`) instead of UUID v7. Only v7 is allowed.
- Store UUIDs as BLOB without good reason. TEXT is more debuggable.
- Rely on UUID v7 ordering for business logic. Use dedicated timestamp fields for sorting.
- Generate UUIDs server-side only. This defeats offline-first capability.
- Expose internal integer IDs in APIs or URLs.

## Consequences

### Positive

- Clients can create records without database connectivity, enabling true offline-first usage.
- Multiple clients can generate UUIDs without coordination, eliminating sync conflicts on IDs.
- Time-ordered UUIDs provide better index locality and insert performance than random UUIDs.
- No database round trip needed to obtain an ID after insert.
- IDs are non-sequential and difficult to guess, improving security.
- Pre-generated IDs enable optimistic UI updates.

### Negative

- Larger storage footprint: 36 bytes (TEXT) per UUID versus 4-8 bytes for an integer.
- Larger indexes due to longer key values.
- UUIDs are harder to read and debug than simple sequential integers.
- Some database tooling assumes integer primary keys.
