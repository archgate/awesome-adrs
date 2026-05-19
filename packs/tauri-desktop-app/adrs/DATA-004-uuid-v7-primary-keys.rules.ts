/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "uuid-primary-keys": {
      description:
        'All sqliteTable definitions must use text("id").primaryKey() — no integer autoincrement primary keys',
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

            // Check for text("id").primaryKey() pattern
            if (
              !/text\s*\(\s*["']id["']\s*\)\s*\.primaryKey\s*\(\s*\)/.test(
                tableBlock,
              )
            ) {
              ctx.report.violation({
                message: `${file}: Table "${tableName}" must use text("id").primaryKey() for UUID v7 primary keys`,
                file,
                fix: 'Add id: text("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()) to the table definition',
              });
            }

            // Check that no integer autoincrement primary keys are used
            if (
              /integer\s*\(\s*["']id["']\s*\)\s*\.primaryKey\s*\(\s*\{[^}]*autoIncrement/.test(
                tableBlock,
              )
            ) {
              ctx.report.violation({
                message: `${file}: Table "${tableName}" uses integer autoincrement primary key instead of UUID v7`,
                file,
                fix: 'Replace integer("id").primaryKey({ autoIncrement: true }) with text("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7())',
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
