/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "consistent-error-response-shape": {
      description:
        "API error responses must use the standard shape { error: { code, message, details? } }",
      async check(ctx) {
        const sourceGlob = "**/*.{ts,js}";

        // Find res.status(...).json( or res.status(...).send( patterns
        const jsonMatches = await ctx.grepFiles(
          /res\.status\s*\(\s*[4-5]\d{2}\s*\)\s*\.json\s*\(/u,
          sourceGlob
        );

        for (const m of jsonMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }

          // Check if the line contains the standard error shape
          if (!m.content.includes("error:") && !m.content.includes("error :")) {
            ctx.report.warning({
              message:
                "Error response may not use the standard shape `{ error: { code, message } }` — ensure all error responses are consistent.",
              file: m.file,
              line: m.line,
              fix: 'Return `res.status(CODE).json({ error: { code: "ERROR_CODE", message: "..." } })`.',
            });
          }
        }

        // Check for res.send with error status codes (should use .json instead)
        const sendMatches = await ctx.grepFiles(
          /res\.status\s*\(\s*[4-5]\d{2}\s*\)\s*\.send\s*\(/u,
          sourceGlob
        );

        for (const m of sendMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.warning({
            message:
              "Error response uses `.send()` instead of `.json()` — use the standard JSON error shape.",
            file: m.file,
            line: m.line,
            fix: 'Replace `.send(...)` with `.json({ error: { code: "ERROR_CODE", message: "..." } })`.',
          });
        }
      },
    },
  },
} satisfies RuleSet;
