# tauri-desktop-app

Full-stack architecture for data-driven desktop apps — Tauri v2, Hono BFF, SQLite + Drizzle, React 19 + MUI + TanStack, Bun, Moonrepo.

## Included ADRs

### Architecture & Toolchain

| ID        | Title                                    |
| --------- | ---------------------------------------- |
| ARCH-001  | TypeScript as Primary Language           |
| ARCH-002  | Bun as Package Manager and Runtime       |
| ARCH-003  | Monorepo with Moonrepo                   |
| ARCH-004  | Standardized Monorepo Folder Structure   |
| ARCH-005  | Toolchain Version Management with Proto  |
| ARCH-006  | Code Formatting (Prettier + Ruff)        |
| ARCH-007  | Code Linting (Oxlint + Ruff)             |
| ARCH-008  | No Path Aliases in TypeScript            |
| ARCH-009  | Centralized Dependency Versions          |
| ARCH-010  | Tauri v2 Desktop Shell                   |
| ARCH-011  | Python for Data-Related Tasks            |
| ARCH-012  | UV as Python Package Manager             |
| ARCH-013  | ty as Python Type Checker                |

### Backend

| ID     | Title                                       |
| ------ | ------------------------------------------- |
| BE-001 | Backend for Frontend with Hono              |
| BE-002 | Type-Safe API with Hono RPC and Zod OpenAPI |
| BE-003 | Backend Folder Structure                    |
| BE-004 | CORS Support for Desktop Apps               |

### Data Layer

| ID       | Title                                  |
| -------- | -------------------------------------- |
| DATA-001 | SQLite as Embedded Database            |
| DATA-002 | Drizzle ORM for Schema and Data Access |
| DATA-003 | Schema Migrations with Drizzle Kit     |
| DATA-004 | UUID v7 Primary Keys                   |
| DATA-005 | Audit Fields (created_at and updated_at) |
| DATA-006 | Field Naming Convention                |
| DATA-007 | Database Environment Separation        |
| DATA-008 | Sidecar Data Import Jobs               |

### Frontend

| ID     | Title                                          |
| ------ | ---------------------------------------------- |
| FE-001 | React 19 SPA Architecture                      |
| FE-002 | Vite as Frontend Build Tool                    |
| FE-003 | MUI as UI Component Library                    |
| FE-004 | TanStack Router for File-Based Routing         |
| FE-005 | TanStack Query for Server State                |
| FE-006 | TanStack Form for Form Management              |
| FE-007 | Jotai for Client State                         |
| FE-008 | Stateful and Stateless Component Separation    |
| FE-009 | End-to-End Type Safety with Backend            |
| FE-010 | Storybook for Component Development            |
| FE-011 | i18next for Internationalization               |
| FE-012 | No Barrel Files                                |
| FE-013 | Frontend Folder Structure                      |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/tauri-desktop-app
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/tauri-desktop-app/adrs/ARCH-001-typescript-primary-language
```
