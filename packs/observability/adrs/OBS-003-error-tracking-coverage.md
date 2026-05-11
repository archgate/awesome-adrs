---
id: OBS-003
title: Error Tracking Coverage
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

## Context

Silently swallowed errors are one of the most dangerous patterns in production code. When a `catch` block does nothing or only logs to the console without reporting to an error tracking system (Sentry, Datadog, Bugsnag, etc.), the error goes unnoticed. The team has no visibility into failures, cannot measure error rates, and cannot prioritize fixes. Every caught error must be reported so that monitoring dashboards and alerting reflect the true state of the system.

## Decision

All `catch` blocks must report errors to the error tracking system. Empty catch blocks and catch blocks that only use `console.*` without error reporting are not allowed. Errors may be intentionally suppressed only with an explicit comment explaining why.

- Report caught errors to the error tracking system (e.g. `Sentry.captureException(err)`).
- Never leave catch blocks empty.
- If an error is intentionally ignored, add a comment explaining why.
- Log the error with a structured logger in addition to reporting it.

## Do's and Don'ts

### Do

- Report errors to the tracking system: `Sentry.captureException(err)`.
- Log errors with context: `logger.error({ err, userId }, "Payment failed")`.
- Re-throw errors when the caller should handle them.
- Add a comment when intentionally suppressing an error: `// Expected: file may not exist`.

### Don't

- Leave catch blocks empty: `catch (err) {}`.
- Only `console.error` without reporting: `catch (err) { console.error(err) }`.
- Catch and ignore errors without explanation.
- Catch broad error types when you only need to handle specific ones.

## Consequences

### Positive

- All production errors are visible in the error tracking dashboard.
- Error rates and trends can be monitored and alerted on.
- No errors are silently lost in production.

### Negative

- Error tracking services have volume-based costs.
- Developers must distinguish between expected and unexpected errors.
