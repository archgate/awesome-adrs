/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-non-null-assertion": {
      description:
        "TypeScript files must not use the non-null assertion operator (!)",
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
          // Match non-null assertion before property access: value!.prop
          const dotMatches = await ctx.grep(file, /\w+!\./u);
          for (const m of dotMatches) {
            ctx.report.violation({
              message:
                "Avoid non-null assertion `!.` — use optional chaining (`?.`) or a null check instead.",
              file: m.file,
              line: m.line,
              fix: "Replace `value!.prop` with `value?.prop` or add a null check before access.",
            });
          }
          // Match non-null assertion before closing paren: value!)
          const parenMatches = await ctx.grep(file, /\w+!\)/u);
          for (const m of parenMatches) {
            ctx.report.violation({
              message:
                "Avoid non-null assertion `!)` — validate the value with a runtime check instead.",
              file: m.file,
              line: m.line,
              fix: "Remove the `!` and add a proper null check or use an assertion function.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
