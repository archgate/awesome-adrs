/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "moon-directory-exists": {
      description: ".moon directory must exist for Moonrepo workspace config",
      async check(ctx) {
        const moonFiles = await ctx.glob(".moon/**");
        if (moonFiles.length === 0) {
          ctx.report.violation({
            message: ".moon directory is missing — Moonrepo workspace is not configured",
            file: ".moon",
            fix: "Initialize Moonrepo with 'moon init' to create the .moon directory",
          });
        }
      },
    },
    "no-competing-monorepo-tools": {
      description: "No nx.json, turbo.json, or lerna.json allowed — Moonrepo is the standard",
      async check(ctx) {
        const forbiddenFiles = ["nx.json", "turbo.json", "lerna.json"];

        for (const file of forbiddenFiles) {
          try {
            await ctx.readFile(file);
            ctx.report.violation({
              message: `${file} found — use Moonrepo instead`,
              file,
              fix: `Remove ${file} and use Moonrepo (.moon/) for monorepo management`,
            });
          } catch {
            // File doesn't exist — good
          }
        }
      },
    },
    "no-package-scripts": {
      description: "Package.json must not have scripts — use moon.yml tasks instead",
      async check(ctx) {
        const packageJsonFiles = [
          ...(await ctx.glob("packages/*/package.json")),
          ...(await ctx.glob("packages/*/*/package.json")),
        ];

        await Promise.all(
          packageJsonFiles.map(async (file) => {
            const pkg = (await ctx.readJSON(file)) as {
              scripts?: Record<string, string>;
            };
            if (pkg.scripts && Object.keys(pkg.scripts).length > 0) {
              ctx.report.violation({
                message: `${file}: has "scripts" field — use moon.yml tasks instead`,
                file,
                fix: 'Move scripts to moon.yml tasks and remove the "scripts" field from package.json',
              });
            }
          }),
        );
      },
    },
    "moon-configs": {
      description: "All packages must have a moon.yml configuration file",
      async check(ctx) {
        const packageJsonFiles = [
          ...(await ctx.glob("packages/*/package.json")),
          ...(await ctx.glob("packages/*/*/package.json")),
        ];

        await Promise.all(
          packageJsonFiles.map(async (file) => {
            const moonYmlPath = file.replace("/package.json", "/moon.yml");
            try {
              await ctx.readFile(moonYmlPath);
            } catch {
              ctx.report.violation({
                message: `${moonYmlPath}: missing moon.yml`,
                file: moonYmlPath,
                fix: "Create a moon.yml file for this package with appropriate task definitions",
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
