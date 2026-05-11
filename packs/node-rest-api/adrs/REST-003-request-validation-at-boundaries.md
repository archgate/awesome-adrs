---
id: REST-003
title: Request Validation at Boundaries
domain: backend
rules: true
files: ["**/routes/**/*.ts", "**/routes/**/*.js"]
---

## Context

Unvalidated request data is a common source of bugs, security vulnerabilities, and confusing runtime errors. When route handlers access `req.body`, `req.params`, or `req.query` without validation, invalid data flows into business logic and can cause failures far from the entry point. Validating at the boundary — the first point where external data enters the system — catches problems early, produces clear error messages, and provides type safety downstream.

## Decision

All route handlers must validate incoming request data (body, params, query) at the boundary before processing. Validation should use a schema validation library (Zod, Joi, Yup, etc.) to parse and type-narrow the input. Raw `req.body` should never be passed directly to business logic without validation.

- Use schema validation (e.g. Zod `.parse()` or `.safeParse()`) on all incoming data.
- Validate at the route handler level, before calling service functions.
- Return a `400` error with validation details when input is invalid.

## Do's and Don'ts

### Do

- Validate `req.body` with a schema before using it: `const data = schema.parse(req.body)`.
- Validate path params and query strings, not just request bodies.
- Return structured validation errors (see REST-001) when validation fails.
- Use TypeScript types inferred from validation schemas for type safety.

### Don't

- Access `req.body` properties without prior validation.
- Trust that clients send correctly-shaped data.
- Defer validation to the database layer or business logic.
- Use `as` type assertions on request data instead of runtime validation.

## Consequences

### Positive

- Invalid data is caught early with clear, actionable error messages.
- Business logic can trust that its inputs are well-typed and valid.
- Reduces an entire class of bugs caused by unexpected input shapes.

### Negative

- Every route handler needs a validation schema, adding upfront effort.
- Validation schemas must be kept in sync with API contracts.
