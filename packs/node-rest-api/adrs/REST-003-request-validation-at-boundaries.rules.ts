/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "request-validation-at-boundaries": {
      description:
        "Route handlers must validate request data before processing",
      async check(ctx) {
        const routeGlob = "**/routes/**/*.{ts,js}";

        // Find files that use req.body
        const bodyMatches = await ctx.grepFiles(/req\.body/u, routeGlob);

        // Get unique files that access req.body
        const filesUsingBody = new Set(
          bodyMatches
            .filter(
              (m) =>
                !m.file.includes(".test.") &&
                !m.file.includes(".spec.") &&
                !m.file.includes("__tests__")
            )
            .map((m) => m.file)
        );

        for (const file of filesUsingBody) {
          const content = await ctx.readFile(file);

          // Check if the file contains any validation pattern
          const hasValidation =
            /\.parse\s*\(|\.safeParse\s*\(|\.validate\s*\(|\.validateAsync\s*\(|\.check\s*\(|validationResult\s*\(/u.test(
              content
            );

          if (!hasValidation) {
            ctx.report.warning({
              message:
                "Route handler accesses `req.body` without apparent request validation — validate incoming data at the boundary.",
              file,
              fix: "Add schema validation (e.g. `schema.parse(req.body)`) before processing the request body.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
