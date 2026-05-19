/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "snake-case-columns": {
      description:
        "All database column name strings in Drizzle schema definitions must be snake_case",
      async check(ctx) {
        const allFiles = ctx.scopedFiles.filter(
          (f) =>
            f.endsWith(".ts") &&
            (/[\\/]src[\\/]schema\.ts$/.test(f) || /[\\/]src[\\/]schema[\\/]/.test(f)),
        );

        const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;

        await Promise.all(
          allFiles.map(async (file) => {
            const content = await ctx.readFile(file);
            const localPattern = /(?:text|integer|real|blob)\s*\(\s*["']([^"']+)["']/g;
            let match;

            while ((match = localPattern.exec(content)) !== null) {
              const colName = match[1];
              if (!SNAKE_CASE.test(colName)) {
                ctx.report.violation({
                  message: `${file}: Column name "${colName}" is not snake_case`,
                  file,
                  fix: `Rename column "${colName}" to snake_case format (e.g., "${colName.replace(/([A-Z])/g, "_$1").toLowerCase()}")`,
                });
              }
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
