---
id: REST-002
title: Route Handler Colocation
domain: backend
rules: true
files: ["**/routes/**/*.ts", "**/routes/**/*.js"]
---

## Context

Splitting route definitions and their handlers across separate files (e.g. a `routes/` directory that imports from a `controllers/` directory) adds indirection without meaningful benefit. Developers must jump between files to understand what a route does. Colocation — keeping the handler logic next to the route definition — makes routes self-contained and easier to navigate.

## Decision

Route handlers must be colocated with their route definitions. A route file should contain both the route registration and the handler logic, rather than importing handlers from a separate `controllers/` directory. Shared business logic should live in a `services/` or `lib/` layer, not in controllers.

- Each route file defines its routes and their handlers together.
- Shared logic is extracted into service modules, not controller files.
- The `controllers/` directory pattern is not used.

## Do's and Don'ts

### Do

- Define route handlers inline or in the same file as the route definition.
- Extract shared business logic into service modules (`services/`, `lib/`).
- Keep route files focused on a single resource or feature.

### Don't

- Create a separate `controllers/` directory for route handlers.
- Import handler functions from controller files into route files.
- Put business logic directly in route handlers — delegate to services.

## Consequences

### Positive

- Routes are self-contained and easier to understand at a glance.
- Fewer files to navigate when working on a single endpoint.
- Clear separation between HTTP handling (routes) and business logic (services).

### Negative

- Route files may become longer when handlers are complex.
- Teams familiar with the MVC controller pattern need to adjust.
