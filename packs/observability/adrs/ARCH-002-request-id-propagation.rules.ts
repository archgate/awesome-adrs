/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "request-id-propagation": {
      description:
        "HTTP handlers must propagate a request ID for tracing",
      async check(ctx) {
        const routeGlob = "**/*.{ts,js}";

        // Find files that look like route/handler files (common patterns)
        const handlerMatches = await ctx.grepFiles(
          /app\.(get|post|put|delete|patch)\s*\(|router\.(get|post|put|delete|patch)\s*\(/u,
          routeGlob
        );

        // Get unique handler files
        const handlerFiles = new Set(
          handlerMatches
            .filter(
              (m) =>
                !m.file.includes(".test.") &&
                !m.file.includes(".spec.") &&
                !m.file.includes("__tests__")
            )
            .map((m) => m.file)
        );

        for (const file of handlerFiles) {
          const content = await ctx.readFile(file);

          const hasRequestId =
            /x-request-id|x-correlation-id|requestId|correlationId|request_id|correlation_id/iu.test(
              content
            );

          if (!hasRequestId) {
            ctx.report.warning({
              message:
                "Route handler file does not reference a request ID — ensure request ID propagation for tracing.",
              file,
              fix: 'Add middleware to extract or generate a request ID from the `x-request-id` header and attach it to the request context.',
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
