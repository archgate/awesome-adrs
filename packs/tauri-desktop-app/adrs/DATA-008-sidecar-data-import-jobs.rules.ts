/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "job-package-structure": {
      description: "Each job under packages/jobs/ must contain a pyproject.toml",
      async check(ctx) {
        const jobDirs = await ctx.glob("packages/jobs/*/pyproject.toml");

        if (jobDirs.length === 0) {
          ctx.report.info({
            message:
              "No job packages found under packages/jobs/. Expected at least one directory with a pyproject.toml.",
            file: "packages/jobs/",
          });
        }
      },
    },
    "job-cli-argparse": {
      description: "Python job entry points must use argparse for CLI interface",
      async check(ctx) {
        const entryPoints = await ctx.glob("packages/jobs/*/src/main.py");

        for (const file of entryPoints) {
          const content = await ctx.readFile(file);

          if (!content.includes("import argparse") && !content.includes("from argparse")) {
            ctx.report.violation({
              message: `${file}: Job entry point does not import argparse. All jobs must expose a CLI interface using argparse.`,
              file,
              fix: "Add 'import argparse' and implement a create_parser() function with environment variable fallbacks.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
