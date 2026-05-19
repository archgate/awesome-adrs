---
id: FE-006
title: No Path Aliases in TypeScript
domain: frontend
rules: true
files: ["**/tsconfig*.json"]
---

## Context

In TypeScript projects, developers often configure path aliases in `tsconfig.json` to avoid long relative import paths. Examples include mapping `@/` to `src/`, `~/` to the root directory, or `@components/` to `src/components/`. While these aliases can make imports look cleaner, they introduce significant problems: tooling complexity (not all build tools, bundlers, linters, and test runners understand aliases), runtime issues (Node.js and Bun don't understand them natively), import confusion (aliases obscure actual file locations), and maintenance burden (keeping alias configurations synchronized across multiple tools).

In a monorepo with multiple packages, path aliases can conflict or create ambiguous imports. AI tools and LLMs also have difficulty understanding custom path mappings, reducing their effectiveness in navigating and modifying code.

## Decision

TypeScript code must not use convenience path aliases. All imports must be either:

- **Relative imports** for intra-package imports (within the same package)
- **Package names** for inter-package imports (between different packages in the monorepo)

No convenience path alias mappings (e.g., `@/`, `~/`, `@components/`) are permitted in `tsconfig.json` or any other configuration files.

**Exception -- Workspace package resolution:** The `paths` field in `tsconfig.json` is allowed when it maps workspace package names (e.g., `@project/backend`, `@project/shared`) to their source locations for TypeScript project reference resolution. These entries are required for TypeScript's composite project mode to resolve inter-package imports to source files rather than compiled output. They are not convenience aliases -- they map the actual package name that appears in `import` statements.

## Do's and Don'ts

### Do

- Use relative imports (`../`, `../../`) for imports within the same package.
- Use package names (e.g., `@project/backend`) for imports between different packages.
- Keep imports explicit and traceable to actual file locations.
- Trust your IDE's auto-import feature to generate correct relative paths.
- Organize code to minimize deep nesting that would require long relative paths.

### Don't

- Configure convenience path aliases in `tsconfig.json` (e.g., `@/`, `~/`, `@components/`).
- Use custom path mappings like `@/`, `~/`, `@components/`, etc.
- Create shortcuts or aliases to avoid relative paths.
- Use module resolution tricks to simulate path aliases.

## Consequences

### Positive

- Zero configuration complexity for path resolution across multiple tools.
- Universal tool compatibility with linters, bundlers, and test runners.
- Clear file location visible in every import statement.
- Better navigation for developers and AI tools to understand code structure.
- No runtime issues since imports work identically at compile-time and runtime.
- Simplified monorepo with no conflicts or ambiguities between packages.

### Negative

- Some relative imports may be verbose (e.g., `../../../utils/helper`).
- Moving files requires updating relative import paths.
- Some developers prefer the aesthetics of path aliases.
