/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "audit-fields": {
      description:
        "All sqliteTable definitions must include both created_at and updated_at columns",
      async check(ctx) {
        const schemaFiles = await ctx.glob("packages/**/src/schema*.ts");
        const TABLE_PATTERN = /sqliteTable\s*\(\s*["']([^"']+)["']/g;

        for (const file of schemaFiles) {
          const content = await ctx.readFile(file);
          let match;

          while ((match = TABLE_PATTERN.exec(content)) !== null) {
            const tableName = match[1];
            const tableStart = match.index;

            // Extract the table definition block
            const afterMatch = content.slice(tableStart);
            const firstBrace = afterMatch.indexOf("{");
            if (firstBrace === -1) continue;

            let depth = 0;
            let tableEnd = tableStart + firstBrace;
            for (let i = firstBrace; i < afterMatch.length; i++) {
              if (afterMatch[i] === "{") depth++;
              else if (afterMatch[i] === "}") {
                depth--;
                if (depth === 0) {
                  tableEnd = tableStart + i;
                  break;
                }
              }
            }

            const tableBlock = content.slice(tableStart, tableEnd + 1);

            if (!tableBlock.includes('"created_at"')) {
              ctx.report.violation({
                message: `${file}: Table "${tableName}" is missing "created_at" column`,
                file,
                fix: `Add createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()) to table "${tableName}"`,
              });
            }
            if (!tableBlock.includes('"updated_at"')) {
              ctx.report.violation({
                message: `${file}: Table "${tableName}" is missing "updated_at" column`,
                file,
                fix: `Add updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(() => new Date()) to table "${tableName}"`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
