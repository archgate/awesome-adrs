/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "colocated-tests": {
      description: "Source files in src/ should have a colocated test file",
      async check(ctx) {
        const sourceFiles = await ctx.glob("src/**/*.{ts,tsx}");
        const filtered = sourceFiles.filter(
          (f) =>
            !f.includes("node_modules") &&
            !f.endsWith(".test.ts") &&
            !f.endsWith(".test.tsx") &&
            !f.endsWith(".spec.ts") &&
            !f.endsWith(".spec.tsx") &&
            !f.endsWith(".d.ts") &&
            !f.includes("__fixtures__") &&
            !f.includes("__helpers__")
        );

        const allFiles = new Set(await ctx.glob("src/**/*.{ts,tsx}"));

        for (const file of filtered) {
          const base = file.replace(/\.(ts|tsx)$/, "");
          const hasTest =
            allFiles.has(`${base}.test.ts`) ||
            allFiles.has(`${base}.test.tsx`) ||
            allFiles.has(`${base}.spec.ts`) ||
            allFiles.has(`${base}.spec.tsx`);

          if (!hasTest) {
            ctx.report.warning({
              message: `Source file is missing a colocated test file.`,
              file,
              fix: `Create a test file at ${base}.test.ts`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
