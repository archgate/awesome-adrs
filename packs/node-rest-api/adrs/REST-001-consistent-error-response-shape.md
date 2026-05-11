---
id: REST-001
title: Consistent Error Response Shape
domain: backend
rules: true
files: ["**/*.ts", "**/*.js"]
---

## Context

Inconsistent error responses across API endpoints make it difficult for clients to handle errors reliably. When each endpoint returns errors in a different format, client-side error handling becomes fragile and full of special cases. A standard error shape lets clients parse and display errors uniformly, simplifies API documentation, and makes debugging easier across the stack.

## Decision

All API error responses must use a consistent JSON shape: `{ error: { code: string, message: string, details?: unknown } }` paired with the appropriate HTTP status code. Every error path — validation failures, not-found, authorization errors, and server errors — must conform to this shape.

- Use a shared error response helper or middleware to enforce the format.
- The `code` field should be a machine-readable string (e.g. `"VALIDATION_ERROR"`, `"NOT_FOUND"`).
- The `message` field should be a human-readable description.
- The optional `details` field may contain structured validation errors or additional context.

## Do's and Don'ts

### Do

- Return `{ error: { code, message } }` for all error responses.
- Use a centralized error handler middleware.
- Map domain errors to appropriate HTTP status codes.
- Include validation details in the `details` field when applicable.

### Don't

- Return bare strings as error responses: `res.status(400).send("Bad request")`.
- Return inconsistent shapes: `{ msg: "..." }` in one place, `{ error: "..." }` in another.
- Leak stack traces or internal details in production error responses.
- Use `200 OK` for error responses.

## Consequences

### Positive

- Clients can implement a single error-handling path for all API calls.
- Error responses are self-documenting and consistent in API documentation.
- Debugging is simpler when all errors follow the same structure.

### Negative

- Existing endpoints need to be migrated to the standard shape.
- Third-party middleware errors may need wrapping to conform to the shape.
