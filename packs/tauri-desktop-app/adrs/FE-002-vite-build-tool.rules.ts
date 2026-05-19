/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "vite-dependency-required": {
      description: "Frontend must have vite in devDependencies; no webpack/parcel configs allowed",
      async check(ctx) {
        let pkg: Record<string, unknown>;
        try {
          pkg = (await ctx.readJSON("packages/frontend/package.json")) as Record<string, unknown>;
        } catch {
          ctx.report.warning({
            message: "packages/frontend/package.json not found — cannot verify Vite dependency",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
        const deps = (pkg.dependencies ?? {}) as Record<string, string>;
        const allDeps = { ...deps, ...devDeps };

        if (!allDeps["vite"]) {
          ctx.report.violation({
            message: "packages/frontend/package.json does not list vite as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "vite" to devDependencies in packages/frontend/package.json',
          });
        }

        // Check for banned bundlers
        const banned = ["webpack", "parcel", "@parcel/core", "react-scripts"];

        for (const bundler of banned) {
          if (allDeps[bundler]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned bundler dependency "${bundler}". Use Vite instead.`,
              file: "packages/frontend/package.json",
              fix: `Remove "${bundler}" and use Vite as the build tool.`,
            });
          }
        }
      },
    },
    "vite-config-exists": {
      description: "A vite.config.ts must exist in packages/frontend/",
      async check(ctx) {
        const configs = await ctx.glob("packages/frontend/vite.config.ts");

        if (configs.length === 0) {
          ctx.report.violation({
            message:
              "packages/frontend/vite.config.ts not found. Vite requires a configuration file.",
            file: "packages/frontend/vite.config.ts",
            fix: "Create a vite.config.ts in packages/frontend/ with at least the React plugin configured.",
          });
        }

        // Also check that no webpack/parcel configs exist
        const webpackConfigs = await ctx.glob("packages/frontend/webpack.config.*");
        const parcelConfigs = await ctx.glob("packages/frontend/.parcelrc");

        for (const cfg of [...webpackConfigs, ...parcelConfigs]) {
          ctx.report.violation({
            message: `${cfg}: Non-Vite bundler configuration found. Remove it and use vite.config.ts.`,
            file: cfg,
            fix: "Delete this file and configure the build in vite.config.ts.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
