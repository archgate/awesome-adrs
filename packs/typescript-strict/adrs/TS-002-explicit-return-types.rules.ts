/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "explicit-return-types": {
      description:
        "Exported functions must have explicit return type annotations",
      async check(ctx) {
        const files = await ctx.glob("**/*.{ts,tsx}");
        const sourceFiles = files.filter(
          (f) =>
            !f.endsWith(".d.ts") &&
            !f.includes("node_modules") &&
            !f.includes(".test.") &&
            !f.includes(".spec.")
        );
        for (const file of sourceFiles) {
          // Match exported function declarations without return type before {
          const matches = await ctx.grep(
            file,
            /export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/u
          );
          for (const m of matches) {
            ctx.report.violation({
              message:
                "Exported function is missing an explicit return type annotation.",
              file: m.file,
              line: m.line,
              fix: "Add a return type annotation after the parameter list: `): ReturnType {`.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
