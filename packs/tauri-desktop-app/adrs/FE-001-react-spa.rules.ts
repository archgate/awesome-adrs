/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "react-dependency-required": {
      description:
        "Frontend must depend on react and react-dom; no SSR/SSG framework dependencies allowed",
      async check(ctx) {
        let pkg: Record<string, unknown>;
        try {
          pkg = (await ctx.readJSON("packages/frontend/package.json")) as Record<string, unknown>;
        } catch {
          ctx.report.warning({
            message: "packages/frontend/package.json not found — cannot verify React dependencies",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = (pkg.dependencies ?? {}) as Record<string, string>;
        const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
        const allDeps = { ...deps, ...devDeps };

        // Check for react and react-dom
        if (!allDeps["react"]) {
          ctx.report.violation({
            message: "packages/frontend/package.json does not list react as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "react" to dependencies in packages/frontend/package.json',
          });
        }

        if (!allDeps["react-dom"]) {
          ctx.report.violation({
            message: "packages/frontend/package.json does not list react-dom as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "react-dom" to dependencies in packages/frontend/package.json',
          });
        }

        // Check for banned SSR/SSG frameworks
        const banned = [
          "next",
          "remix",
          "@remix-run/react",
          "gatsby",
          "astro",
          "@angular/core",
          "vue",
          "svelte",
          "solid-js",
        ];

        for (const framework of banned) {
          if (allDeps[framework]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned dependency "${framework}". Desktop apps use React SPA without SSR/SSG frameworks.`,
              file: "packages/frontend/package.json",
              fix: `Remove "${framework}" — the frontend must be a pure React SPA.`,
            });
          }
        }
      },
    },
    "no-class-components": {
      description:
        "No class components allowed in frontend .tsx files — use function components with hooks",
      async check(ctx) {
        const tsxFiles = ctx.scopedFiles.filter((f) => f.endsWith(".tsx"));

        for (const file of tsxFiles) {
          const matches = await ctx.grep(file, /class\s+\w+\s+extends\s+(\w+\.)?Component/);

          for (const match of matches) {
            ctx.report.violation({
              message: `${file}:${match.line}: Class component found. Use function components with hooks instead.`,
              file,
              line: match.line,
              fix: "Convert to a function component using hooks (useState, useEffect, etc.).",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
