/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "zod-openapi-dependency": {
      description: "The backend package must depend on @hono/zod-openapi",
      async check(ctx) {
        let backendPkg: Record<string, unknown>;
        try {
          backendPkg = (await ctx.readJSON("packages/backend/package.json")) as Record<
            string,
            unknown
          >;
        } catch {
          ctx.report.warning({
            message:
              "packages/backend/package.json not found — cannot verify @hono/zod-openapi dependency",
            file: "packages/backend/package.json",
          });
          return;
        }

        const deps = (backendPkg.dependencies ?? {}) as Record<string, string>;
        const devDeps = (backendPkg.devDependencies ?? {}) as Record<string, string>;

        if (!deps["@hono/zod-openapi"] && !devDeps["@hono/zod-openapi"]) {
          ctx.report.violation({
            message:
              "packages/backend/package.json does not list @hono/zod-openapi as a dependency",
            file: "packages/backend/package.json",
            fix: 'Add "@hono/zod-openapi" to dependencies in packages/backend/package.json',
          });
        }
      },
    },
    "openapi-route-usage": {
      description:
        "Route files must import from @hono/zod-openapi and use .openapi() instead of raw HTTP methods",
      async check(ctx) {
        const routeFiles = ctx.scopedFiles.filter((f) =>
          /[\\/]src[\\/]routes[\\/][^\\/]+\.ts$/.test(f),
        );

        const filteredRouteFiles = routeFiles.filter(
          (file) => !file.includes(".test.") && !file.includes(".spec."),
        );

        await Promise.all(
          filteredRouteFiles.map(async (file) => {
            const content = await ctx.readFile(file);

            const importsOpenApi = /from\s+["']@hono\/zod-openapi["']/.test(content);
            const hasRawMethods = /\.(?:get|post|put|delete|patch)\s*\(/.test(content);
            const hasOpenApiCalls = /\.openapi\s*\(/.test(content);

            if (!importsOpenApi && hasRawMethods) {
              ctx.report.violation({
                message: `${file}: Route file uses raw HTTP methods without importing @hono/zod-openapi`,
                file,
                fix: "Import from @hono/zod-openapi and use createRoute() with .openapi() instead of raw .get()/.post()",
              });
            }

            if (importsOpenApi && hasRawMethods && !hasOpenApiCalls) {
              ctx.report.violation({
                message: `${file}: Route file imports @hono/zod-openapi but uses raw HTTP methods instead of .openapi()`,
                file,
                fix: "Replace raw .get()/.post() calls with createRoute() and .openapi() route definitions",
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
