/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "drizzle-config-present": {
      description: "Datamodel packages with a schema file must have a drizzle.config.ts",
      async check(ctx) {
        const schemaFiles = ctx.scopedFiles.filter((f) => /[\\/]src[\\/]schema\.ts$/.test(f));

        await Promise.all(
          schemaFiles.map(async (schemaFile) => {
            const packageRoot = schemaFile.replace("/src/schema.ts", "");

            try {
              await ctx.readFile(`${packageRoot}/drizzle.config.ts`);
            } catch {
              ctx.report.violation({
                message: `${packageRoot}: Schema file exists but drizzle.config.ts is missing`,
                file: schemaFile,
                fix: "Create a drizzle.config.ts file to configure schema migrations",
              });
            }
          }),
        );
      },
    },
    "migration-directory-exists": {
      description:
        "Datamodel packages with a drizzle config must have a migrations directory with at least one SQL file",
      async check(ctx) {
        const schemaFiles = ctx.scopedFiles.filter((f) => /[\\/]src[\\/]schema\.ts$/.test(f));

        await Promise.all(
          schemaFiles.map(async (schemaFile) => {
            const packageRoot = schemaFile.replace("/src/schema.ts", "");

            // Only check packages that have a drizzle config
            try {
              await ctx.readFile(`${packageRoot}/drizzle.config.ts`);
            } catch {
              return;
            }

            const migrations = await ctx.glob(`${packageRoot}/drizzle/**/*.sql`);

            if (migrations.length === 0) {
              ctx.report.violation({
                message: `${packageRoot}: Schema file exists but no SQL migrations found in drizzle/ directory`,
                file: schemaFile,
                fix: "Run drizzle-kit generate to create migrations from the schema",
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
