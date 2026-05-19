---
id: BE-004
title: CORS Support for Desktop Apps
domain: backend
rules: true
files: ["packages/backend/**"]
---

## Context

Desktop applications built with frameworks like Tauri run the frontend inside a webview that loads content from a local origin (e.g., `tauri://localhost` or `https://tauri.localhost`). In production, the frontend and backend typically share the same origin or communicate via Tauri's IPC, making CORS a non-issue. However, during development the frontend dev server (e.g., Vite on `http://localhost:5173`) and the backend (e.g., Hono on `http://localhost:3000`) run on different ports, which constitutes different origins.

Browsers and webviews enforce the Same-Origin Policy, blocking cross-origin requests unless the server explicitly permits them via CORS headers. Without proper CORS configuration, the development workflow breaks entirely because the frontend cannot reach the backend.

## Decision

CORS must be configured via Hono's built-in `cors()` middleware from `hono/cors`.

- **Desktop production (Tauri webview):** CORS can be a no-op because the frontend and backend communicate within the same origin or via Tauri's IPC bridge. However, the middleware should still be present for consistency.
- **Development mode:** Configure allowed origins to include the frontend dev server (e.g., `http://localhost:5173`).
- Allowed origins must be read from environment variables so they can differ between development and production without code changes.
- Never use wildcard (`*`) origins with credentials enabled.
- Enable `credentials: true` to support authentication tokens and cookies.
- Handle preflight `OPTIONS` requests properly (Hono's CORS middleware does this automatically).

## Do's and Don'ts

### Do

- Use Hono's built-in CORS middleware (`hono/cors`) for all CORS configuration.
- Explicitly whitelist allowed origins using environment variables.
- Enable credentials (`credentials: true`) to support token-based authentication.
- Apply the CORS middleware globally in the backend entry point.
- Test CORS configuration in both development and production modes.
- Validate tokens and implement authorization in the backend. Do not rely on CORS for security.

### Don't

- Use wildcard origin (`origin: "*"`) with credentials enabled. Browsers block this.
- Hardcode allowed origins in the source code. Use environment variables.
- Skip CORS configuration entirely. Even if production does not need it, development does.
- Rely on CORS as a security mechanism. It only controls browser-initiated requests.
- Expose sensitive headers unnecessarily.

## Consequences

### Positive

- Frontend and backend can communicate across different origins during development.
- Authentication tokens and cookies can be forwarded from the frontend to the backend.
- Consistent, well-tested implementation via Hono's built-in middleware.
- Environment-specific configuration supports both development and production without code changes.
- Explicit origin whitelisting prevents unauthorized access from untrusted origins.

### Negative

- Developers must understand CORS concepts and configure allowed origins correctly.
- Different configurations for development and production require environment variable management.
- Misconfigured origins silently break frontend-backend communication, which can be confusing to debug.
