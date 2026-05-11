---
id: OBS-001
title: Structured Logging Only
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

## Context

Bare `console.log` calls produce unstructured text output that is difficult to search, filter, and aggregate in log management systems. In production, logs need to be machine-parseable (JSON) with standard fields (timestamp, level, message, context) so that monitoring tools can index them, alerting can trigger on specific conditions, and operators can correlate logs across services. Unstructured logging makes incident response slower and harder.

## Decision

All log output in production code must use a structured logging library (Pino, Winston, Bunyan, etc.) that outputs JSON with standard fields. Bare `console.log`, `console.warn`, and `console.error` are not allowed in production source code. Test files and scripts are excluded from this rule.

- Use a structured logger that outputs JSON (e.g. Pino, Winston).
- Include standard fields: timestamp, level, message, and contextual metadata.
- Reserve `console.*` for test files, scripts, and CLI tools only.

## Do's and Don'ts

### Do

- Use a structured logger: `logger.info({ userId, action }, "User signed in")`.
- Include contextual metadata (request ID, user ID, operation) in log entries.
- Configure log levels appropriately per environment.
- Use `logger.error({ err }, "Operation failed")` with error objects.

### Don't

- Use `console.log` in production application code.
- Log unstructured strings: `console.log("user signed in: " + userId)`.
- Log sensitive data (passwords, tokens, PII) at any level.
- Use `console.error` as a substitute for proper error logging.

## Consequences

### Positive

- Logs are machine-parseable and searchable in log management systems.
- Consistent log format across all services enables cross-service correlation.
- Alerting and dashboards can be built on structured log fields.

### Negative

- Requires adopting and configuring a logging library.
- Developers must pass context objects instead of simple string concatenation.
