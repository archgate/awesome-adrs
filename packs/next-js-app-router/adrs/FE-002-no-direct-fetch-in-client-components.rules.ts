/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-direct-fetch-in-client-components": {
      description:
        'Client Components (files with "use client") should not call fetch() directly',
      async check(ctx) {
        const sourceGlob = "**/*.{tsx,ts,jsx}";

        // Find files with "use client"
        const useClientMatches = await ctx.grepFiles(
          /["']use client["']/u,
          sourceGlob
        );

        const clientFiles = new Set(useClientMatches.map((m) => m.file));

        for (const file of clientFiles) {
          if (
            file.includes(".test.") ||
            file.includes(".spec.") ||
            file.includes("__tests__")
          ) {
            continue;
          }

          const fetchMatches = await ctx.grep(file, /\bfetch\s*\(/u);
          for (const m of fetchMatches) {
            ctx.report.warning({
              message:
                '`fetch()` called in a Client Component — use Server Components, Server Actions, or React Query instead.',
              file: m.file,
              line: m.line,
              fix: "Move data fetching to a Server Component and pass data via props, or use React Query with an API route.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
