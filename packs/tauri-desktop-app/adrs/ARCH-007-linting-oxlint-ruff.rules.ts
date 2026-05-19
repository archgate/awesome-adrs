/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "oxlint-config-exists": {
      description: ".oxlintrc.json must exist at the repo root",
      async check(ctx) {
        try {
          await ctx.readFile(".oxlintrc.json");
        } catch {
          ctx.report.violation({
            message: ".oxlintrc.json is missing at repo root",
            file: ".oxlintrc.json",
            fix: "Create an .oxlintrc.json configuration file at the repository root",
          });
        }
      },
    },
    "no-wrong-linters": {
      description: "No ESLint, TSLint, Pylint, or Flake8 configs allowed — only Oxlint and Ruff",
      async check(ctx) {
        const forbiddenFiles = [
          ".eslintrc",
          ".eslintrc.js",
          ".eslintrc.cjs",
          ".eslintrc.json",
          ".eslintrc.yml",
          ".eslintrc.yaml",
          ".eslintignore",
          "eslint.config.js",
          "eslint.config.mjs",
          "eslint.config.cjs",
          "tslint.json",
          ".flake8",
          "pylintrc",
          ".pylintrc",
        ];

        // Check repo root
        await Promise.all(
          forbiddenFiles.map(async (file) => {
            try {
              await ctx.readFile(file);
              ctx.report.violation({
                message: `Forbidden linter config at root: ${file}`,
                file,
                fix: "Remove this file — use Oxlint for JS/TS and Ruff for Python",
              });
            } catch {
              // Doesn't exist — good
            }
          }),
        );

        // Check inside packages
        const packageDirs = [
          ...(await ctx.glob("packages/*/")),
          ...(await ctx.glob("packages/*/*/")),
        ];
        const packageChecks: Array<{ dir: string; file: string }> = [];
        for (const dir of packageDirs) {
          for (const file of forbiddenFiles) {
            packageChecks.push({ dir, file });
          }
        }
        await Promise.all(
          packageChecks.map(async ({ dir, file }) => {
            const fullPath = `${dir}${file}`;
            try {
              await ctx.readFile(fullPath);
              ctx.report.violation({
                message: `Forbidden linter config found: ${fullPath}`,
                file: fullPath,
                fix: "Remove this file — use Oxlint for JS/TS and Ruff for Python",
              });
            } catch {
              // Doesn't exist — good
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
