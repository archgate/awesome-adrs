/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "env-based-database-config": {
      description:
        "Database connection code must read from environment variables, not hardcoded paths",
      async check(ctx) {
        const matches = await ctx.grepFiles(
          /["'][^"']*\.db["']/,
          "packages/datamodels/**/src/**/*.ts",
        );

        for (const match of matches) {
          // Skip test files and migration files
          if (
            match.file.includes(".test.") ||
            match.file.includes(".spec.") ||
            match.file.includes("/drizzle/")
          ) {
            continue;
          }

          // Allow :memory: and patterns that are clearly env-based defaults
          if (
            match.content.includes(":memory:") ||
            match.content.includes("process.env") ||
            match.content.includes("DATABASE_URL") ||
            match.content.includes("Bun.env")
          ) {
            continue;
          }

          ctx.report.warning({
            message: `${match.file}:${match.line}: Possible hardcoded database path found. Use DATABASE_URL environment variable instead.`,
            file: match.file,
            line: match.line,
            fix: "Read the database path from process.env.DATABASE_URL or an environment-based configuration function.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
