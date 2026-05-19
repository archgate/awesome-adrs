---
id: BE-001
title: Backend for Frontend with Hono
domain: backend
rules: true
files: ["packages/backend/**"]
---

## Context

Applications with a single frontend benefit from a dedicated backend that serves the frontend's exact data needs. Traditional backend architectures designed to serve multiple clients (web, mobile, third-party) create overly generic endpoints that lead to data over-fetching, under-fetching, and complex client-side transformations. For an application with a single frontend, this generality is unnecessary overhead.

A Backend for Frontend (BFF) architecture pairs a single backend with a single frontend, allowing endpoints to be designed around actual UI requirements. The backend aggregates data from multiple sources, transforms it into the exact shape the UI needs, and handles business logic that should not live in the frontend. Choosing the right framework for this BFF is equally important. Hono is an ultra-lightweight, TypeScript-first framework that runs on Bun, provides first-class RPC support for end-to-end type safety, and offers built-in middleware for common concerns like CORS and authentication.

## Decision

All backends must follow the Backend for Frontend (BFF) pattern using Hono as the framework, running on Bun.

- The project has one responsive frontend and one backend dedicated to serving it.
- The backend is tightly coupled to the frontend's data requirements. Breaking changes are acceptable since there is only one consumer.
- The backend acts as an aggregation and orchestration layer that fetches data from multiple sources, composes and transforms it into the exact shape the UI needs, and handles business logic.
- Hono is the sole backend framework. No other frameworks (Express, Fastify, NestJS, Koa) are permitted.
- Hono provides ultra-lightweight footprint (< 20KB), first-class TypeScript support, built-in RPC for type-safe frontend communication, excellent performance, and middleware for CORS, authentication, rate limiting, and logging.
- The backend does not aim to be generic or serve hypothetical future clients.

## Do's and Don'ts

### Do

- Design backend endpoints specifically for the frontend's UI needs, not as generic REST resources.
- Aggregate data from multiple sources in the backend before returning it to the frontend.
- Transform and shape data server-side to match exactly what the UI requires.
- Handle complex business logic in the backend, keeping the frontend lean.
- Iterate quickly on the backend, making breaking changes when they improve the API.
- Use Hono's context API (`c`) to access request data, set responses, and manage middleware state.
- Leverage Hono's middleware system for cross-cutting concerns (authentication, CORS, rate limiting, logging).
- Use Hono's built-in helpers like `c.json()`, `c.text()`, `c.redirect()` for responses.
- Use async/await for all asynchronous operations.
- Treat the backend and frontend as a single logical unit that evolves together.

### Don't

- Use other backend frameworks (Express, Fastify, NestJS, Koa) in the project.
- Design generic REST APIs trying to serve hypothetical future clients.
- Force the frontend to make multiple API calls to assemble data for a single view.
- Return raw database entities to the frontend without transforming into UI-specific shapes.
- Put data aggregation or transformation logic in the frontend.
- Create unnecessary abstraction layers over Hono. Keep the architecture simple.
- Use callback-based patterns. Always use async/await.
- Block the event loop with CPU-intensive synchronous operations.

## Consequences

### Positive

- Optimal data fetching where the frontend receives exactly the data it needs in the exact shape required.
- All data aggregation and transformation happens server-side, keeping the frontend lean.
- Tight coupling enables end-to-end type safety with Hono RPC.
- No backward compatibility constraints allow faster iteration.
- Hono's tiny footprint and excellent performance minimize overhead.
- Simple, intuitive API that developers familiar with Express can adopt quickly.
- Works seamlessly with Bun for optimal performance.

### Negative

- Backend is tightly coupled to the frontend and cannot easily serve other clients without creating separate BFF instances.
- Compared to Express, Hono has a smaller ecosystem of third-party middleware.
- Teams accustomed to Express or NestJS need to learn Hono's patterns and best practices.
