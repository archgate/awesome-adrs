/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-only-skip": {
      description:
        "Test files must not contain .only() or .skip() calls",
      async check(ctx) {
        const testGlob = "**/*.{test,spec}.{ts,tsx,js,jsx}";

        const onlyMatches = await ctx.grepFiles(/\.only\s*\(/u, testGlob);
        for (const m of onlyMatches) {
          ctx.report.violation({
            message:
              "Remove `.only()` before committing — it causes CI to skip other tests in this suite.",
            file: m.file,
            line: m.line,
            fix: "Remove `.only` so all tests run.",
          });
        }

        const skipMatches = await ctx.grepFiles(/\.skip\s*\(/u, testGlob);
        for (const m of skipMatches) {
          ctx.report.violation({
            message:
              "Remove `.skip()` before committing — skipped tests rot silently.",
            file: m.file,
            line: m.line,
            fix: "Remove `.skip` and fix the test, or delete it and open an issue.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
