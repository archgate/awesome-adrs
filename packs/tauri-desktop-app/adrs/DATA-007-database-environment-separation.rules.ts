/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "env-based-database-config": {
      description:
        "Database connection code must read from environment variables, not hardcoded paths",
      async check(ctx) {
        const tsFiles = ctx.scopedFiles.filter(
          (f) => f.endsWith(".ts") && (f.includes("/src/") || f.includes("\\src\\")),
        );

        for (const file of tsFiles) {
          // Skip test files and migration files
          if (file.includes(".test.") || file.includes(".spec.") || file.includes("/drizzle/")) {
            continue;
          }

          // Check for hardcoded .db file paths (e.g., "./data.db", "/path/to/file.db")
          const hardcodedDbMatches = await ctx.grep(file, /["'][^"']*\.db["']/);

          for (const match of hardcodedDbMatches) {
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
              message: `${file}:${match.line}: Possible hardcoded database path found. Use DATABASE_URL environment variable instead.`,
              file,
              line: match.line,
              fix: "Read the database path from process.env.DATABASE_URL or an environment-based configuration function.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
