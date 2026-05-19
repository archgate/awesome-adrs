/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-barrel-files": {
      description:
        "No index.ts/index.tsx barrel files that re-export from other modules in the frontend",
      async check(ctx) {
        const indexFiles = [
          ...(await ctx.glob("packages/frontend/src/**/index.ts")),
          ...(await ctx.glob("packages/frontend/src/**/index.tsx")),
        ];

        // Patterns that indicate a barrel / re-export file
        const RE_EXPORT_PATTERNS = [
          /export\s*\{[^}]*\}\s*from\s/,
          /export\s*\*\s*from\s/,
          /export\s*\{\s*default\s*\}\s*from\s/,
        ];

        for (const file of indexFiles) {
          // Exclude route index files (TanStack Router file-based routes)
          if (file.includes("/routes/") || file.includes("\\routes\\"))
            continue;

          // Exclude src/main.tsx-style entry points (though they wouldn't be index.ts)
          // main.tsx is not named index, so no exclusion needed

          let content: string;
          try {
            content = await ctx.readFile(file);
          } catch {
            continue;
          }

          const isBarrel = RE_EXPORT_PATTERNS.some((pattern) =>
            pattern.test(content),
          );

          if (isBarrel) {
            ctx.report.violation({
              message: `${file}: Barrel file detected — index files must not re-export from other modules`,
              file,
              fix: "Remove the barrel file and update imports to reference the actual source files directly",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
