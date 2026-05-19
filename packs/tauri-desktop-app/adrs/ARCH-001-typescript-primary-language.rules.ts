/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-js-files": {
      description:
        "All source code must be TypeScript — no .js/.jsx files in source directories",
      async check(ctx) {
        const excludeDirs = ["node_modules", "dist", "build", ".moon"];

        const jsFiles = [
          ...(await ctx.glob("**/*.js")),
          ...(await ctx.glob("**/*.jsx")),
        ];

        for (const file of jsFiles) {
          const shouldExclude = excludeDirs.some(
            (dir) => file.includes(`/${dir}/`) || file.includes(`\\${dir}\\`),
          );
          if (shouldExclude) continue;

          // Allow config files at root (e.g., prettier.config.js, eslint.config.js)
          if (!file.includes("/src/") && !file.includes("\\src\\") &&
              !file.includes("/packages/") && !file.includes("\\packages\\")) {
            continue;
          }

          ctx.report.violation({
            message: `JS file found in source: ${file}`,
            file,
            fix: "Convert to TypeScript (.ts/.tsx)",
          });
        }
      },
    },
  },
} satisfies RuleSet;
