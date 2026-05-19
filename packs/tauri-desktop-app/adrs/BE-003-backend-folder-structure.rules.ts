/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "backend-folder-structure": {
      description:
        "Route handlers must live in packages/backend/src/routes/, not in other directories",
      async check(ctx) {
        const backendSrc = "packages/backend/src";
        const allTsFiles = await ctx.glob(`${backendSrc}/**/*.ts`);

        for (const file of allTsFiles) {
          const relativePath = file.replace(`${backendSrc}/`, "");

          if (relativePath.includes(".test.") || relativePath.includes(".spec.")) continue;
          if (relativePath.startsWith("routes/")) continue;
          if (relativePath.startsWith("middlewares/")) continue;
          if (relativePath.startsWith("services/")) continue;

          const content = await ctx.readFile(file);
          if (
            /\.get\s*\(/.test(content) &&
            /\.post\s*\(/.test(content) &&
            /new Hono|Hono\./.test(content)
          ) {
            ctx.report.violation({
              message: `${file}: Route handler found outside src/routes/ directory`,
              file,
              fix: "Move route handler to packages/backend/src/routes/",
            });
          }
        }
      },
    },
    "route-registration": {
      description: "All route files must be imported in backend index.ts",
      async check(ctx) {
        const routesDir = "packages/backend/src/routes";
        let indexContent;
        try {
          indexContent = await ctx.readFile("packages/backend/src/index.ts");
        } catch {
          return;
        }

        const routeFiles = await ctx.glob(`${routesDir}/*.ts`);

        for (const file of routeFiles) {
          if (file.includes(".test.") || file.includes(".spec.")) continue;

          const moduleName = file.replace(`${routesDir}/`, "").replace(/\.ts$/, "");

          const importPattern = new RegExp(`from\\s+["']\\./routes/${moduleName}["']`);
          if (!importPattern.test(indexContent)) {
            ctx.report.violation({
              message: `${file}: Route file is not imported in packages/backend/src/index.ts`,
              file,
              fix: `Add import for ./routes/${moduleName} in packages/backend/src/index.ts`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
