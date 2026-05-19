---
id: BE-002
title: Type-Safe API with Hono RPC and Zod OpenAPI
domain: backend
rules: true
files: ["packages/backend/**"]
---

## Context

End-to-end type safety between frontend and backend is critical for building robust, maintainable desktop applications. Without it, API contracts drift between frontend and backend, validation logic is duplicated or missing, and developers lose autocomplete and IntelliSense when making API calls. Traditional approaches like manual type definitions, runtime-only validation libraries, or code generation tools each solve part of the problem but none provide a unified solution.

The `@hono/zod-openapi` package solves this comprehensively: Zod schemas define the expected input and output shapes, TypeScript types are automatically inferred from those schemas, the frontend receives full type safety via Hono RPC without manual type definitions, runtime validation ensures data integrity, and OpenAPI documentation is generated automatically from the same schemas. This creates a single source of truth for API contracts that serves validation, type safety, and documentation simultaneously.

## Decision

All backends must use `@hono/zod-openapi` with `createRoute()` for defining routes with Zod schema validation. Hono RPC provides the frontend with full TypeScript type safety. All routes generate OpenAPI documentation automatically.

- Use `createRoute` from `@hono/zod-openapi` to define routes with Zod schemas in the `request` object for query, params, and body validation.
- Use `OpenAPIHono` instances and the `.openapi()` method to implement route handlers.
- Export the app as the default export from `index.ts`. A `client.ts` module handles type inference internally and exports a typed client (`hcWithType`) for frontend consumption.
- Access validated data via `c.req.valid("query")`, `c.req.valid("param")`, `c.req.valid("json")`.
- Expose OpenAPI JSON at `/openapi.json` using `.doc31()` for OpenAPI 3.1.0 specification.
- Provide interactive API documentation via Scalar at `/docs`.
- Do NOT use `@hono/zod-validator` (`zValidator`). The `@hono/zod-openapi` package already handles Zod validation natively through `createRoute`, making `zValidator` redundant.
- Co-locate validation schemas with route definitions for maintainability.
- Share common Zod schemas across multiple routes when they validate similar data.

## Do's and Don'ts

### Do

- Define Zod schemas for all request inputs (body, query, path parameters).
- Use `createRoute` from `@hono/zod-openapi` for all route definitions.
- Use `OpenAPIHono` instances and `.openapi()` method to implement route handlers.
- Let Zod schemas infer TypeScript types rather than writing manual type definitions.
- Include comprehensive OpenAPI metadata: summary, description, tags, and examples.
- Document all error responses with appropriate status codes.
- Leverage Zod's transformation capabilities (e.g., converting strings to numbers with `.transform()` and `.pipe()`).
- Use Zod's refinements for custom validation logic beyond basic type checking.
- Return consistent error responses when validation fails.
- Integrate the Hono RPC client with data fetching libraries (e.g., TanStack Query) in the frontend.

### Don't

- Use `@hono/zod-validator` (`zValidator`). It is redundant when using `@hono/zod-openapi`.
- Skip input validation. Always validate request data with Zod schemas via `createRoute`.
- Manually type validated request data. Let Zod schemas infer the types.
- Use `any` or `unknown` types to bypass validation.
- Create separate TypeScript interfaces for API request/response types. Use Zod schemas as the source of truth.
- Use different validation libraries (joi, yup, etc.). Stick to Zod for consistency.
- Maintain separate documentation files that can drift from code.
- Force SSE streaming endpoints into `createRoute`. Use plain Hono route methods for `streamSSE` responses.
- Place plain Hono route methods (`.get()`, `.post()`) between `.openapi()` calls on an `OpenAPIHono` instance, as this breaks the type chain.

## Consequences

### Positive

- Zero type drift between frontend and backend. Frontend types are automatically derived from backend schemas.
- Compile-time and runtime safety. API calls are checked at compile time, and all inputs are validated before processing.
- Excellent developer experience with full autocomplete and IntelliSense for API calls, parameters, and responses.
- Automatic OpenAPI documentation generated from the same Zod schemas used for validation.
- Safe refactoring. Changes to backend APIs immediately cause TypeScript errors in the frontend.
- Single source of truth. Zod schemas define both validation rules and type definitions.
- Interactive API exploration via Scalar without maintaining separate documentation.

### Negative

- Developers need to learn Zod schema syntax, `@hono/zod-openapi` patterns, and Hono RPC concepts.
- OpenAPI route definitions are more verbose than basic Hono routes.
- Complex validation rules can make schemas verbose.
- Requires monorepo structure for type imports between frontend and backend.
