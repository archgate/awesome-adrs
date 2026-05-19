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
      description: "No competing formatter configs allowed — only Prettier and Ruff",
      async check(ctx) {
        const forbiddenFiles = [
          "biome.json",
          "biome.jsonc",
          "dprint.json",
          "black.toml",
          ".isort.cfg",
          "yapf.ini",
          ".style.yapf",
        ];

        for (const file of forbiddenFiles) {
          try {
            await ctx.readFile(file);
            ctx.report.violation({
              message: `Forbidden formatter config at root: ${file}`,
              file,
              fix: "Remove this file — use Prettier for JS/TS and Ruff for Python",
            });
          } catch {
            // Doesn't exist — good
          }
        }

        // Check inside packages
        const packageDirs = [
          ...(await ctx.glob("packages/*/")),
          ...(await ctx.glob("packages/*/*/")),
        ];
        for (const dir of packageDirs) {
          for (const file of forbiddenFiles) {
            const fullPath = `${dir}${file}`;
            try {
              await ctx.readFile(fullPath);
              ctx.report.violation({
                message: `Forbidden formatter config found: ${fullPath}`,
                file: fullPath,
                fix: "Remove this file — use Prettier for JS/TS and Ruff for Python",
              });
            } catch {
              // Doesn't exist — good
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
