---
id: NEXT-002
title: No Direct fetch in Client Components
domain: frontend
rules: true
files: ["**/*.tsx", "**/*.ts", "**/*.jsx"]
---

## Context

Client Components (files with `"use client"`) that call `fetch()` directly bypass Next.js data fetching patterns. Data fetching in Client Components does not benefit from server-side caching, request deduplication, or streaming. It also often leads to waterfall requests and loading state management that Server Components or Server Actions handle more elegantly.

## Decision

Client Components should not call `fetch()` directly for data loading. Instead, data should be fetched in Server Components and passed as props, or fetched via Server Actions. For client-side interactivity that requires data fetching (e.g. infinite scroll, mutations), use a library like React Query / SWR with API routes as the data source.

- Fetch data in Server Components and pass it to Client Components via props.
- Use Server Actions for mutations and form submissions.
- Use React Query or SWR (with API routes) when client-side data fetching is genuinely needed.

## Do's and Don'ts

### Do

- Fetch data in Server Components and pass it as props to Client Components.
- Use Server Actions (`"use server"`) for mutations.
- Use React Query or SWR with API routes for dynamic client-side data needs.
- Colocate data requirements with Server Components near the top of the tree.

### Don't

- Call `fetch()` directly inside Client Components for data loading.
- Use `useEffect` + `fetch` patterns for initial data loading.
- Duplicate data fetching logic between server and client.
- Bypass Server Components when they can provide the data.

## Consequences

### Positive

- Data fetching benefits from server-side caching and deduplication.
- Eliminates client-side loading waterfalls for initial page data.
- Consistent data fetching patterns across the codebase.

### Negative

- Requires careful planning of the Server/Client Component boundary.
- Some interactive data patterns (e.g. search-as-you-type) still need client-side fetching via React Query or SWR.
