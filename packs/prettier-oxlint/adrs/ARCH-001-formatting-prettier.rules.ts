/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "prettier-config-exists": {
      description: "A Prettier configuration file must exist at the repo root",
      async check(ctx) {
        const prettierConfigs = [
          ".prettierrc",
          ".prettierrc.json",
          ".prettierrc.yml",
          ".prettierrc.yaml",
          ".prettierrc.js",
          ".prettierrc.cjs",
          ".prettierrc.mjs",
          ".prettierrc.toml",
          "prettier.config.js",
          "prettier.config.cjs",
          "prettier.config.mjs",
        ];

        let found = false;
        for (const config of prettierConfigs) {
          try {
            await ctx.readFile(config);
            found = true;
            break;
          } catch {
            // Not this one
          }
        }

        if (!found) {
          ctx.report.violation({
            message: "No Prettier configuration file found at repo root",
            file: ".prettierrc.json",
            fix: "Create a Prettier config file (e.g., .prettierrc.json) at the repository root",
          });
        }
      },
    },
    "no-wrong-formatters": {
      description: "No competing formatter configs allowed — only Prettier",
      async check(ctx) {
        const forbiddenFiles = ["biome.json", "biome.jsonc", "dprint.json"];

        await Promise.all(
          forbiddenFiles.map(async (file) => {
            try {
              await ctx.readFile(file);
              ctx.report.violation({
                message: `Forbidden formatter config at root: ${file}`,
                file,
                fix: "Remove this file — use Prettier for code formatting",
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
                message: `Forbidden formatter config found: ${fullPath}`,
                file: fullPath,
                fix: "Remove this file — use Prettier for code formatting",
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
