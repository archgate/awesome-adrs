/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "packages-directory-exists": {
      description: "A packages/ directory must exist for project source code",
      async check(ctx) {
        const packageDirs = await ctx.glob("packages/*/");
        if (packageDirs.length === 0) {
          ctx.report.violation({
            message: "No packages/ directory found — all source code must live under packages/",
            file: "packages",
            fix: "Create a packages/ directory and place all project source code inside it",
          });
        }
      },
    },
    "no-root-src": {
      description: "No src/ directory at root level — source code belongs in packages/",
      async check(ctx) {
        const rootSrcFiles = await ctx.glob("src/**/*.{ts,tsx,py}");
        for (const file of rootSrcFiles) {
          ctx.report.violation({
            message: `Source file found outside packages/: ${file}`,
            file,
            fix: "Move source files to the appropriate package under packages/",
          });
        }
      },
    },
  },
} satisfies RuleSet;
