---
id: DATA-006
title: Field Naming Convention
domain: data
rules: true
files: ["packages/datamodels/**", "packages/backend/**"]
---

## Context

When working with Drizzle ORM and TypeScript, there is a fundamental naming mismatch between language conventions. TypeScript and JavaScript use camelCase for variable and property names (e.g., `firstName`, `createdAt`, `categoryId`), while SQL and database conventions use snake_case for column names (e.g., `first_name`, `created_at`, `category_id`). This creates a decision point: should the database schema follow SQL conventions or TypeScript conventions?

Using camelCase everywhere produces non-standard SQL that is harder to read in raw queries and conflicts with most SQL tooling. Using snake_case everywhere results in un-idiomatic TypeScript that violates language conventions. The best approach is to use snake_case in the database and camelCase in code, with an explicit mapping layer. Drizzle ORM supports this through column aliasing, where the TypeScript property name differs from the database column name string passed to column type functions.

## Decision

Drizzle ORM schema definitions must use camelCase for field names in TypeScript and snake_case for database column names. The mapping between the two is explicitly defined using Drizzle's column aliasing feature.

- TypeScript property names use camelCase (e.g., `categoryId`, `createdAt`, `transactionDate`).
- Database column name strings in column definitions use snake_case (e.g., `text("category_id")`, `integer("created_at")`).
- Table names in the database use snake_case.
- The mapping is explicit and visible in the schema definition; no implicit or automatic conversion is used.
- Single-word field names (e.g., `id`, `name`, `amount`) are naturally the same in both conventions.

## Do's and Don'ts

### Do

- Use camelCase for all TypeScript property names in schema definitions.
- Explicitly specify snake_case database column names using the column name parameter (e.g., `text("external_id")`).
- Use snake_case for table names in the database.
- Be consistent: all multi-word fields must follow the camelCase-to-snake_case pattern.
- Document the mapping in schema comments when non-obvious.

### Don't

- Use snake_case for TypeScript property names.
- Use camelCase strings in database column definitions (e.g., `text("externalId")` is wrong).
- Rely on automatic or implicit name conversion.
- Mix naming conventions within the same schema.
- Use abbreviations that become unclear when cased differently.

## Consequences

### Positive

- TypeScript code is idiomatic and follows JavaScript/TypeScript conventions.
- SQL schema is idiomatic and follows database conventions.
- Explicit mapping means no hidden conversions or magic.
- Type safety is preserved; TypeScript enforces correct property names.
- Works well with SQL tooling, database introspection, and cross-language access (e.g., Python sidecar jobs).

### Negative

- Schema definitions are more verbose since every multi-word field requires explicit column name mapping.
- Developers must understand both naming conventions and keep them in sync.
- Typos in column name strings are not caught by the TypeScript compiler.
