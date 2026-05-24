---
id: FE-002
title: Vite as Frontend Build Tool
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Modern frontend applications require a build tool to transform TypeScript and JSX into browser-compatible JavaScript, bundle modules for production, provide hot module replacement during development, and optimize assets through code splitting, minification, and tree shaking. Traditional tools like Webpack and Create React App suffer from slow development server startup, sluggish hot module replacement in large projects, complex configuration requirements, and in the case of CRA, have been deprecated.

For projects with large codebases, build tool performance directly impacts developer productivity. Slow feedback loops during development reduce iteration speed and frustrate developers. A modern, performant build tool is essential for fast development cycles while still producing optimized production bundles.

## Decision

Vite is the build tool and development server for the frontend.

- Vite (version 5 or later) is the sole build tool. No other bundlers (Webpack, Parcel, Create React App) are permitted.
- Configuration is defined in `vite.config.ts` at the frontend package root.
- Use `@vitejs/plugin-react` for React Fast Refresh and JSX/TSX transformation.
- ES Modules (ESM) are the primary module format; CommonJS (`require`, `module.exports`) is not used in frontend code.
- Vite's environment variable system (`.env` files with `VITE_` prefix) is used for configuration.
- Code splitting and lazy loading via dynamic imports (`React.lazy`, `import()`) are encouraged for optimal bundle sizes.
- Supports plugin-based routing solutions (e.g., TanStack Router plugin for file-based routing).

## Do's and Don'ts

### Do

- Use Vite for all frontend projects.
- Configure the build via `vite.config.ts`.
- Use `@vitejs/plugin-react` for React support.
- Use Vite's native ES modules support in development for instant server start.
- Use Vite's built-in asset handling for images, fonts, and static resources.
- Use `.env` files with the `VITE_` prefix for environment variables.

### Don't

- Use Webpack, Parcel, Create React App, or other bundlers.
- Use CommonJS (`require`, `module.exports`) in frontend code; use ES modules exclusively.
- Eject from Vite or create overly complex custom configurations.
- Commit `.env.local` or `.env.*.local` files to version control.
- Manually concatenate or bundle files; let Vite handle all bundling.

## Consequences

### Positive

- Development server starts in under one second regardless of project size, using native ES modules.
- Hot module replacement reflects changes in milliseconds with React Fast Refresh.
- Production builds are highly optimized through Rollup with tree shaking, code splitting, and minification.
- Minimal configuration is needed out of the box with sensible defaults.
- Active community and ecosystem with regular updates and comprehensive documentation.
- Framework-agnostic design makes the tool future-proof.

### Negative

- Developers familiar with Webpack must learn Vite's configuration and plugin system.
- Development mode (native ESM) and production mode (Rollup) use different bundling strategies, which can occasionally cause subtle inconsistencies.
- Vite's plugin ecosystem is smaller than Webpack's, though common needs are well covered.
