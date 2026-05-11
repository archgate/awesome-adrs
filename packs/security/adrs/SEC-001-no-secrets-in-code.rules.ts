/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-secrets-in-code": {
      description:
        "Source files must not contain hardcoded secrets, API keys, or tokens",
      async check(ctx) {
        const sourceGlob = "**/*.{ts,tsx,js,jsx}";
        const secretPatterns: Array<{ pattern: RegExp; label: string }> = [
          {
            pattern: /API_KEY\s*=\s*["'][^"']{8,}["']/u,
            label: "hardcoded API key",
          },
          {
            pattern: /SECRET\s*=\s*["'][^"']{8,}["']/u,
            label: "hardcoded secret",
          },
          {
            pattern: /PASSWORD\s*=\s*["'][^"']+["']/u,
            label: "hardcoded password",
          },
          {
            pattern: /TOKEN\s*=\s*["'][^"']{8,}["']/u,
            label: "hardcoded token",
          },
        ];

        for (const { pattern, label } of secretPatterns) {
          const matches = await ctx.grepFiles(pattern, sourceGlob);
          for (const m of matches) {
            // Exclude example files and test fixtures
            if (
              m.file.includes(".env.example") ||
              m.file.includes("__fixtures__") ||
              m.file.includes("fixture")
            ) {
              continue;
            }
            ctx.report.violation({
              message: `Possible ${label} found — do not hardcode secrets in source files.`,
              file: m.file,
              line: m.line,
              fix: "Move the secret to an environment variable and read it via `process.env`.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
