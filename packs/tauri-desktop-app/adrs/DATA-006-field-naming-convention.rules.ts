/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "snake-case-columns": {
      description:
        "All database column name strings in Drizzle schema definitions must be snake_case",
      async check(ctx) {
        const schemaFiles = await ctx.glob("packages/**/src/schema.ts");
        const schemaDir = await ctx.glob("packages/**/src/schema/*.ts");
        const allFiles = [...schemaFiles, ...schemaDir];

        const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;
        const COLUMN_NAME_PATTERN = /(?:text|integer|real|blob)\s*\(\s*["']([^"']+)["']/g;

        for (const file of allFiles) {
          const content = await ctx.readFile(file);
          let match;

          while ((match = COLUMN_NAME_PATTERN.exec(content)) !== null) {
            const colName = match[1];
            if (!SNAKE_CASE.test(colName)) {
              ctx.report.violation({
                message: `${file}: Column name "${colName}" is not snake_case`,
                file,
                fix: `Rename column "${colName}" to snake_case format (e.g., "${colName.replace(/([A-Z])/g, "_$1").toLowerCase()}")`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
