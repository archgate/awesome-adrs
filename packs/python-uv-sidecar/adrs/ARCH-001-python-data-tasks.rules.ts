/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "python-scope": {
      description: "Python files are only allowed in packages/jobs/ directory",
      async check(ctx) {
        const pyFiles = await ctx.glob("packages/**/*.py");

        const ALLOWED_PATTERNS = [/^packages\/jobs\//];

        for (const file of pyFiles) {
          const isAllowed = ALLOWED_PATTERNS.some((pattern) => pattern.test(file));
          if (!isAllowed) {
            ctx.report.violation({
              message: `${file}: Python file found outside allowed directory (packages/jobs/ only)`,
              file,
              fix: "Move Python files to packages/jobs/",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
