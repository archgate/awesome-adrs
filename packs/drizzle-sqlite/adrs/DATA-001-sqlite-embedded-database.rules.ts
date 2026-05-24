/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "sqlite-dependency-required": {
      description: "Project must use better-sqlite3 or @libsql/client as SQLite driver",
      async check(ctx) {
        const pkg = await ctx.readJSON("package.json");
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        const hasSqliteDriver = "better-sqlite3" in allDeps || "@libsql/client" in allDeps;

        if (!hasSqliteDriver) {
          ctx.report.warning({
            message:
              "No SQLite driver found in dependencies. Expected better-sqlite3 or @libsql/client.",
            file: "package.json",
            fix: "Add better-sqlite3 or @libsql/client to your dependencies.",
          });
        }
      },
    },
    "no-server-database-deps": {
      description: "Project must not depend on server-based database clients (pg, mysql2, mongodb)",
      async check(ctx) {
        const pkg = await ctx.readJSON("package.json");
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        const forbidden = ["pg", "mysql2", "mongodb", "@prisma/client"];

        for (const dep of forbidden) {
          if (dep in allDeps) {
            ctx.report.violation({
              message: `Server-based database dependency "${dep}" found. This project uses SQLite as the embedded database.`,
              file: "package.json",
              fix: `Remove "${dep}" and use SQLite via better-sqlite3 or @libsql/client instead.`,
            });
          }
        }
      },
    },
    "drizzle-sqlite-dialect": {
      description: "Drizzle config must use the sqlite dialect",
      async check(ctx) {
        const configFiles = await ctx.glob("**/drizzle.config.ts");

        await Promise.all(
          configFiles.map(async (file) => {
            const content = await ctx.readFile(file);

            if (!content.includes('"sqlite"') && !content.includes("'sqlite'")) {
              ctx.report.violation({
                message: `${file}: Drizzle config must use dialect: "sqlite".`,
                file,
                fix: 'Set dialect: "sqlite" in your drizzle.config.ts.',
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
