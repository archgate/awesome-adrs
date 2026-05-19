---
id: DATA-002
title: Drizzle ORM for Schema and Data Access
domain: data
rules: true
files: ["packages/datamodels/**", "packages/backend/**"]
---

## Context

Applications need a clear, maintainable way to define data models and access the database from TypeScript code. The approach chosen affects type safety, developer productivity, migration management, and consistency across the codebase. Several options exist: raw SQL queries (maximum control but no type safety), query builders like Knex (better composability but manual type annotations), traditional ORMs like TypeORM or Sequelize (heavy runtime overhead, complex configuration), and modern type-safe ORMs like Drizzle or Prisma.

For a TypeScript-first application using SQLite as the embedded database, the data access layer must provide end-to-end type safety from schema definition to query results, integrate seamlessly with the database, offer minimal runtime overhead, and support the full range of SQL operations.

## Decision

Drizzle ORM is the sole ORM for all TypeScript data access and schema definition. No other ORMs (Prisma, TypeORM, Sequelize, Knex) are permitted.

- **Schema definition:** All tables are defined using Drizzle's `sqliteTable()` API. Schemas are the single source of truth: TypeScript types are inferred automatically, and Drizzle Kit generates migrations from them.
- **Data access:** All database queries (SELECT, INSERT, UPDATE, DELETE), transactions, joins, and aggregations use Drizzle's query API. No raw SQL query strings.
- **Zod integration:** Use `drizzle-zod` to generate Zod schemas from Drizzle table definitions for runtime validation and OpenAPI documentation.
- **SQLite only:** Schema definitions must use `sqliteTable()` and SQLite-specific column types (`integer`, `text`, `real`, `blob`). Do not use `pgTable()` or `mysqlTable()`.

## Do's and Don'ts

### Do

- Define all tables using Drizzle's `sqliteTable()` function.
- Use appropriate SQLite column types: `integer()`, `text()`, `real()`, `blob()`.
- Define indexes, foreign keys, and constraints in the schema.
- Organize schema files by domain within the datamodels package.
- Use Drizzle's query API for all database operations.
- Leverage TypeScript type inference from schema to query results.
- Use `drizzle-zod` to generate Zod schemas from table definitions.
- Use transactions for multi-step operations requiring atomicity.
- Use prepared statements for repeated queries.
- Use `select()` with specific columns instead of `SELECT *` when possible.

### Don't

- Use other ORMs (Prisma, TypeORM, Sequelize) or raw query builders (Knex).
- Write raw SQL queries using template strings or concatenation.
- Use `pgTable()` or `mysqlTable()` for schema definitions. Only `sqliteTable()` is allowed.
- Manually write TypeScript types for database tables. Use Drizzle's type inference.
- Use `any` type for query results.
- Construct WHERE clauses by concatenating user input (SQL injection risk).
- Query the database inside loops (N+1 problem).
- Scatter schema definitions across multiple packages without organization.

## Consequences

### Positive

- Single source of truth: schemas defined once in TypeScript serve as type definitions, validation source, and migration input.
- Full end-to-end type safety from schema definition to query results.
- Zero runtime overhead from direct SQL generation without entity hydration.
- Automatic Zod schema generation for runtime validation.
- Excellent developer experience with IDE autocomplete and refactoring support.
- Schema changes automatically propagate type errors to all consuming code.

### Negative

- Developers must learn Drizzle's schema API and query builder.
- Tightly coupled to the Drizzle ecosystem, making future ORM migration more involved.
- Some advanced SQL features may require using Drizzle's `sql` template tag.
- Complex join queries can produce hard-to-read inferred types.
