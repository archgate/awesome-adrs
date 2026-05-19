/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "drizzle-orm-dependency": {
      description:
        "Any workspace package.json with database-related code must list drizzle-orm as a dependency",
      async check(ctx) {
        const pkgFiles = await ctx.glob("packages/**/package.json");

        for (const pkgFile of pkgFiles) {
          let pkg: Record<string, unknown>;
          try {
            pkg = (await ctx.readJSON(pkgFile)) as Record<string, unknown>;
          } catch {
            continue;
          }

          const deps = (pkg.dependencies ?? {}) as Record<string, string>;
          const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
          const allDeps = { ...deps, ...devDeps };

          // Check for banned ORMs in all packages
          const banned = ["prisma", "@prisma/client", "typeorm", "sequelize", "knex"];
          for (const orm of banned) {
            if (allDeps[orm]) {
              ctx.report.violation({
                message: `${pkgFile}: contains banned ORM dependency "${orm}"`,
                file: pkgFile,
                fix: `Remove "${orm}" and use drizzle-orm instead`,
              });
            }
          }
        }
      },
    },
    "sqlite-table-only": {
      description: "Schema files must use sqliteTable(), not pgTable() or mysqlTable()",
      async check(ctx) {
        const schemaFiles = await ctx.glob("packages/**/src/schema*.ts");

        for (const file of schemaFiles) {
          const content = await ctx.readFile(file);

          if (/pgTable\s*\(/.test(content)) {
            ctx.report.violation({
              message: `${file}: Uses pgTable() instead of sqliteTable()`,
              file,
              fix: "Replace pgTable() with sqliteTable() from drizzle-orm/sqlite-core",
            });
          }

          if (/mysqlTable\s*\(/.test(content)) {
            ctx.report.violation({
              message: `${file}: Uses mysqlTable() instead of sqliteTable()`,
              file,
              fix: "Replace mysqlTable() with sqliteTable() from drizzle-orm/sqlite-core",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
