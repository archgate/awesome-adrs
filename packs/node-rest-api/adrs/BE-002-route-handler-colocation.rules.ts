/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "route-handler-colocation": {
      description:
        "Route files should not import from a separate controllers/ directory",
      async check(ctx) {
        const routeGlob = "**/routes/**/*.{ts,js}";

        const matches = await ctx.grepFiles(
          /from\s+['"].*controllers[/'"]|require\s*\(\s*['"].*controllers[/'"]/u,
          routeGlob
        );

        for (const m of matches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.warning({
            message:
              "Route file imports from a `controllers/` directory — colocate handler logic with the route definition instead.",
            file: m.file,
            line: m.line,
            fix: "Move the handler logic into the route file and extract shared business logic into a `services/` module.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
