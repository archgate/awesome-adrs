# drizzle-sqlite

Complete SQLite data layer with Drizzle ORM — schema, migrations, UUID v7 keys, audit fields, naming conventions, environment separation.

## Included ADRs

| ID        | Title                                    |
| --------- | ---------------------------------------- |
| DATA-001  | SQLite as Embedded Database              |
| DATA-002  | Drizzle ORM for Schema and Data Access   |
| DATA-003  | Schema Migrations with Drizzle Kit       |
| DATA-004  | UUID v7 Primary Keys                     |
| DATA-005  | Audit Fields (created_at and updated_at) |
| DATA-006  | Field Naming Convention                  |
| DATA-007  | Database Environment Separation          |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/drizzle-sqlite
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/drizzle-sqlite/adrs/DATA-001-sqlite-embedded-database
```
