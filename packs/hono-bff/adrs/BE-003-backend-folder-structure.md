---
id: BE-003
title: Backend Folder Structure
domain: backend
rules: true
files: ["packages/backend/**"]
---

## Context

To ensure consistency and maintainability for backend services, we must standardize on a clear folder structure. A well-organized backend codebase is critical for developer productivity, scalability, code reviews, separation of concerns, and type safety. Without a clear standard, routes might be scattered across different locations, middlewares could be defined inline rather than as reusable modules, the entry point could become bloated, and type exports for frontend integration might be unclear.

A standardized folder structure ensures that all backend services follow the same organizational principles, making them easier to understand, maintain, and extend.

## Decision

Backends must follow this standardized `src/` structure:

```
packages/backend/
├── src/
│   ├── index.ts          # Entry point: app initialization and server start
│   ├── client.ts         # Typed RPC client export for frontend consumption
│   ├── routes/           # API route handlers (one file per resource)
│   │   └── [name].ts
│   ├── services/         # Business logic (extracted from route handlers)
│   │   └── [name].ts
│   └── middlewares/       # Hono middleware (CORS, auth, rate limiting, etc.)
│       └── [name].ts
├── package.json
└── tsconfig.json
```

- **`src/index.ts`** creates the Hono application instance, sets the base path, applies global middlewares, registers routes via `.route()`, and exports the app as the default export. API route registrations must be chained to preserve TypeScript type information for Hono RPC.
- **`src/client.ts`** exports a type-safe Hono client (`hcWithType`) for frontend consumption, handling type inference internally via `typeof app`.
- **`src/routes/`** contains individual route files. Each file creates a Hono or OpenAPIHono instance, defines route handlers, and exports a single route instance.
- **`src/services/`** contains business logic extracted from route handlers for testability and reuse.
- **`src/middlewares/`** contains individual middleware files that export configured middleware instances.

## Do's and Don'ts

### Do

- Create separate files for each middleware in the `middlewares/` folder.
- Create separate files for each route or related group of routes in the `routes/` folder.
- Extract complex business logic into `services/` for testability.
- Export the app as the default export from `index.ts`.
- Keep `index.ts` minimal: only app initialization, middleware registration, and route mounting.
- Use method chaining for `.basePath()` and `.route()` calls in `index.ts` to preserve Hono RPC type information.
- Use descriptive file names that reflect the resource or functionality.

### Don't

- Define routes directly in `index.ts`. Always create separate route files.
- Define middlewares inline. Create reusable middleware files instead.
- Mix business logic with route handlers. Extract complex logic to `services/`.
- Create deeply nested folders within `routes/`, `services/`, or `middlewares/`. Keep the structure flat.
- Put non-route code (utilities, types, helpers) in the `routes/` folder.
- Export multiple route instances from a single file.
- Call `.basePath()` or `.route()` on separate lines, as this breaks type inference for Hono RPC.

## Consequences

### Positive

- Consistent organization across all backend services.
- Easy to locate and modify specific routes, services, or middlewares.
- Clear separation of concerns between configuration, middleware, business logic, and routes.
- Type-safe integration with frontend through Hono RPC.
- Each route, service, and middleware can be tested in isolation.
- Predictable file locations simplify code reviews and onboarding.

### Negative

- More files to manage compared to putting everything in `index.ts`.
- Requires discipline to maintain the structure as the codebase grows.
- May feel like over-engineering for very simple backends with only one or two routes.
