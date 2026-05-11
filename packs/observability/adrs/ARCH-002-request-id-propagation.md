---
id: ARCH-002
title: Request ID Propagation
domain: architecture
rules: true
files: ["**/*.ts", "**/*.js"]
---

## Context

In distributed systems and even single-service architectures, tracing a request through its lifecycle is critical for debugging and monitoring. Without a consistent request ID, correlating log entries, database queries, and downstream service calls for a single user request is nearly impossible. A request ID — either received from an upstream caller via a header or generated at the entry point — should flow through every layer so that all related activity can be linked.

## Decision

HTTP handlers must propagate a request ID through the request lifecycle. The request ID should be read from an incoming header (`x-request-id`, `x-correlation-id`) or generated if absent. It must be attached to the request context and included in all log entries and outgoing requests for the duration of that request.

- Read `x-request-id` (or `x-correlation-id`) from incoming request headers.
- Generate a UUID if no request ID header is present.
- Attach the request ID to the request context (e.g. `req.requestId`, async local storage).
- Include the request ID in all log entries and outgoing HTTP calls.

## Do's and Don'ts

### Do

- Read and propagate `x-request-id` from incoming requests.
- Generate a request ID if one is not provided.
- Include the request ID in all structured log entries.
- Forward the request ID to downstream service calls.

### Don't

- Handle requests without a request ID in the context.
- Generate a new request ID at every layer instead of propagating one.
- Log entries without including the request ID.
- Use non-standard header names without team agreement.

## Consequences

### Positive

- Every log entry for a request can be correlated with a single ID.
- Debugging production issues is faster with end-to-end request tracing.
- Distributed tracing tools can link spans across services.

### Negative

- Middleware must be added to extract or generate request IDs.
- All logging calls must include the request ID, adding boilerplate.
