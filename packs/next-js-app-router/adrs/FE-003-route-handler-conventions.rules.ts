/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "route-handler-conventions": {
      description:
        "Route handlers in app/ must use named HTTP method exports, not default exports",
      async check(ctx) {
        const routeGlob = "**/app/**/route.{ts,js}";
        const routeFiles = await ctx.glob(routeGlob);

        for (const file of routeFiles) {
          const content = await ctx.readFile(file);

          if (/export\s+default\b/u.test(content)) {
            // Find the line number of the default export
            const matches = await ctx.grep(file, /export\s+default\b/u);
            for (const m of matches) {
              ctx.report.violation({
                message:
                  "Route handler uses `export default` — use named exports matching HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) instead.",
                file: m.file,
                line: m.line,
                fix: "Replace `export default` with named exports like `export async function GET(request: NextRequest) { ... }`.",
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
