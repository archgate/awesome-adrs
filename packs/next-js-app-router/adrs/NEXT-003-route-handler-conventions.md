---
id: NEXT-003
title: Route Handler Conventions
domain: frontend
rules: true
files: ["**/app/**/route.ts", "**/app/**/route.js"]
---

## Context

Next.js App Router uses file-based routing for API endpoints via `route.ts` files in the `app/` directory. Route handlers must export named functions matching HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) — not a default export. Using default exports or non-standard export names causes the route to silently fail or behave unexpectedly, leading to hard-to-debug issues.

## Decision

API route handlers in `app/api/` (or any `route.ts` file) must use named exports matching HTTP methods. Default exports are not allowed in route handler files. Each exported function handles one HTTP method.

- Export named functions: `export async function GET(request)`, `export async function POST(request)`.
- Do not use `export default`.
- Each route file handles one resource; use separate files for separate endpoints.

## Do's and Don'ts

### Do

- Use named exports matching HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- Type the request parameter using `NextRequest` from `next/server`.
- Return `NextResponse.json()` for JSON responses.
- Keep route handlers thin — delegate to service functions.

### Don't

- Use `export default` in route handler files.
- Export functions with non-standard names (e.g. `handler`, `api`).
- Mix page and route handler exports in the same file.
- Put business logic directly in route handlers.

## Consequences

### Positive

- Route handlers work correctly with Next.js App Router expectations.
- HTTP method handling is explicit and discoverable.
- Consistent pattern across all API endpoints.

### Negative

- Developers coming from Pages Router (`pages/api/`) need to learn the new pattern.
- Each HTTP method needs its own exported function, even for simple CRUD.
