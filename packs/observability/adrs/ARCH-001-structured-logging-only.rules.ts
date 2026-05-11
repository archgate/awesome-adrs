/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "structured-logging-only": {
      description:
        "Production code must not use console.log/warn/error — use a structured logger",
      async check(ctx) {
        const sourceGlob = "**/*.{ts,tsx,js,jsx}";

        const consolePatterns: Array<{ pattern: RegExp; method: string }> = [
          { pattern: /\bconsole\.log\s*\(/u, method: "console.log" },
          { pattern: /\bconsole\.warn\s*\(/u, method: "console.warn" },
          { pattern: /\bconsole\.error\s*\(/u, method: "console.error" },
        ];

        for (const { pattern, method } of consolePatterns) {
          const matches = await ctx.grepFiles(pattern, sourceGlob);
          for (const m of matches) {
            // Exclude test files, scripts, and CLI tools
            if (
              m.file.includes(".test.") ||
              m.file.includes(".spec.") ||
              m.file.includes("__tests__") ||
              m.file.includes("scripts/") ||
              m.file.includes("cli/")
            ) {
              continue;
            }
            ctx.report.warning({
              message: `\`${method}()\` found in production code — use a structured logger (Pino, Winston, etc.) instead.`,
              file: m.file,
              line: m.line,
              fix: `Replace \`${method}(...)\` with a structured logger call, e.g. \`logger.info({ context }, "message")\`.`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
