/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "descriptive-test-names": {
      description: "Test descriptions must describe behavior, not use generic names",
      severity: "warning",
      async check(ctx) {
        const testGlob = "**/*.{test,spec}.{ts,tsx,js,jsx}";
        const genericPatterns = [
          /\b(it|test)\s*\(\s*["']test\s*\d*["']/u,
          /\b(it|test)\s*\(\s*["']it works["']/u,
          /\b(it|test)\s*\(\s*["']should work["']/u,
          /\b(it|test)\s*\(\s*["']works["']/u,
          /\b(it|test)\s*\(\s*["']test["']\s*,/u,
        ];

        for (const pattern of genericPatterns) {
          const matches = await ctx.grepFiles(pattern, testGlob);
          for (const m of matches) {
            ctx.report.warning({
              message:
                "Test has a generic name — use a descriptive name that explains the expected behavior.",
              file: m.file,
              line: m.line,
              fix: 'Rename to describe the behavior, e.g. "should return null when user is not found".',
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
