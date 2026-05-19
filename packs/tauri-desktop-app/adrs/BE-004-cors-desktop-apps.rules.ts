/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "cors-middleware-import": {
      description: "Backend source files must import hono/cors for CORS support",
      async check(ctx) {
        const backendFiles = ctx.scopedFiles.filter(
          (f) => f.endsWith(".ts") && f.startsWith("packages/backend/src/"),
        );

        if (backendFiles.length === 0) return;

        let corsImportFound = false;

        for (const file of backendFiles) {
          if (file.includes(".test.") || file.includes(".spec.")) continue;

          const content = await ctx.readFile(file);

          if (/from\s+["']hono\/cors["']/.test(content)) {
            corsImportFound = true;
            break;
          }
        }

        if (!corsImportFound) {
          ctx.report.violation({
            message:
              "No file in packages/backend/src/ imports from 'hono/cors'. CORS middleware is required.",
            file: "packages/backend/src/index.ts",
            fix: 'Add import { cors } from "hono/cors" and apply CORS middleware in the backend',
          });
        }
      },
    },
  },
} satisfies RuleSet;
