/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-eval": {
      description:
        "Application code must not use eval() or new Function()",
      async check(ctx) {
        const sourceGlob = "**/*.{ts,tsx,js,jsx}";

        const evalMatches = await ctx.grepFiles(/\beval\s*\(/u, sourceGlob);
        for (const m of evalMatches) {
          // Exclude test files
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.violation({
            message:
              "`eval()` executes arbitrary code and is a security risk — do not use it.",
            file: m.file,
            line: m.line,
            fix: "Replace `eval()` with `JSON.parse()`, a lookup table, or a sandboxed alternative.",
          });
        }

        const fnMatches = await ctx.grepFiles(
          /new\s+Function\s*\(/u,
          sourceGlob
        );
        for (const m of fnMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.violation({
            message:
              "`new Function()` executes arbitrary code and is a security risk — do not use it.",
            file: m.file,
            line: m.line,
            fix: "Replace `new Function()` with a static function or a sandboxed alternative.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
