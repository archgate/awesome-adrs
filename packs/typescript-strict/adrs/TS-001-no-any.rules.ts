/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-any-types": {
      description: "TypeScript files must not use the `any` type",
      async check(ctx) {
        const files = await ctx.glob("**/*.{ts,tsx}");
        const sourceFiles = files.filter(
          (f) => !f.endsWith(".d.ts") && !f.includes("node_modules")
        );
        for (const file of sourceFiles) {
          const matches = await ctx.grep(file, /:\s*any\b/u);
          for (const m of matches) {
            ctx.report.violation({
              message:
                "Avoid using `any` — use `unknown`, a specific type, or a generic instead.",
              file: m.file,
              line: m.line,
              fix: "Replace `any` with `unknown` and add type narrowing, or use a specific type.",
            });
          }
          const castMatches = await ctx.grep(file, /\bas\s+any\b/u);
          for (const m of castMatches) {
            ctx.report.violation({
              message:
                "Avoid `as any` type assertions — use `as unknown as T` if a cast is truly necessary.",
              file: m.file,
              line: m.line,
              fix: "Remove the `as any` cast or replace with `as unknown as SpecificType`.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
