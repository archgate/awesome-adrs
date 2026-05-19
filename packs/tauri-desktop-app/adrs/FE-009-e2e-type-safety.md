---
id: FE-009
title: End-to-End Type Safety with Backend
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

TypeScript provides type safety within the frontend codebase, but traditionally there is a gap between frontend and backend. Developers manually write TypeScript interfaces matching backend API responses, which leads to type drift when the backend changes. Manual type definitions require constant maintenance, API calls often use `any` or manually defined types that may not match reality, and developers get no autocomplete for API endpoints, parameters, or response shapes.

Traditional approaches such as manual typing (error-prone), code generation from OpenAPI specs (extra build steps, can be out of sync), or GraphQL (requires different backend architecture) all have drawbacks. Hono RPC provides automatic end-to-end type safety without code generation or manual type definitions. Types flow directly from the backend: Drizzle schema to Zod to Hono routes to RPC client to the frontend.

## Decision

All frontends must use Hono RPC for end-to-end type safety with the backend.

- **Hono RPC client** on the frontend automatically infers types from the backend route definitions.
- **No manual API type definitions** and no code generation (e.g., no OpenAPI codegen). Types are inferred directly from backend code.
- **Full TypeScript safety** for routes, parameters, request bodies, and responses with compile-time checking.
- The API client is set up in `src/api/client.ts`, importing `hc` or `hcWithType` from the backend package.
- The frontend package must list the backend package as a workspace dependency so types can be resolved.
- Any backend change immediately causes TypeScript errors in the frontend if the contract is broken.
- The typed client integrates with TanStack Query hooks for data fetching.

## Do's and Don'ts

### Do

- Use the Hono RPC client for all backend API calls.
- Leverage TypeScript autocomplete for routes, parameters, and responses.
- Let TypeScript errors guide you when backend APIs change.
- Integrate TanStack Query with the Hono RPC client for data fetching.
- Handle response types properly with TypeScript type narrowing.
- Share validation schemas (Zod) between frontend and backend when needed.

### Don't

- Use `fetch` or `axios` directly for backend API calls; use the Hono RPC client.
- Manually define types for API responses; let Hono RPC infer them.
- Use `any` type to bypass type checking for API calls.
- Ignore TypeScript errors when making API calls; they indicate real contract violations.
- Create separate type definition files for API responses.
- Use code generation tools for API types; Hono RPC makes them unnecessary.

## Consequences

### Positive

- Zero manual type maintenance; types are automatically synced between frontend and backend.
- All API calls are checked at compile time, catching errors before runtime.
- Full autocomplete for routes, params, request bodies, and responses.
- Backend changes immediately surface as TypeScript errors in the frontend.
- No code generation build step required.
- Single source of truth: backend code is the authoritative source for API types.
- Entire classes of bugs (wrong endpoints, missing params, incorrect response handling) are eliminated.

### Negative

- Frontend and backend types must stay in sync, potentially requiring coordinated deploys for breaking changes.
- Requires a monorepo structure where the frontend can import backend types directly.
- Developers must understand how Hono RPC client works.
