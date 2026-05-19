/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "tauri-config-exists": {
      description: "Tauri configuration file must exist in packages/desktop/src-tauri/",
      async check(ctx) {
        const configFiles = [
          ...(await ctx.glob("packages/desktop/src-tauri/tauri.conf.json")),
          ...(await ctx.glob("packages/desktop/tauri.conf.json")),
        ];

        if (configFiles.length === 0) {
          ctx.report.warning({
            message:
              "No tauri.conf.json found in packages/desktop/src-tauri/ or packages/desktop/ — Tauri desktop shell may not be configured",
            file: "packages/desktop/src-tauri/tauri.conf.json",
            fix: "Create tauri.conf.json in packages/desktop/src-tauri/ with Tauri v2 configuration",
          });
        }
      },
    },
    "tauri-dependencies": {
      description: "@tauri-apps/cli and @tauri-apps/api must be present in workspace dependencies",
      async check(ctx) {
        const pkgFiles = [
          ...(await ctx.glob("package.json")),
          ...(await ctx.glob("packages/*/package.json")),
          ...(await ctx.glob("packages/*/*/package.json")),
        ];

        const results = await Promise.all(
          pkgFiles.map(async (pkgFile) => {
            let pkg: Record<string, unknown>;
            try {
              pkg = (await ctx.readJSON(pkgFile)) as Record<string, unknown>;
            } catch {
              return { hasCliDep: false, hasApiDep: false };
            }

            const allDeps = {
              ...((pkg.dependencies ?? {}) as Record<string, string>),
              ...((pkg.devDependencies ?? {}) as Record<string, string>),
            };

            return {
              hasCliDep: !!allDeps["@tauri-apps/cli"],
              hasApiDep: !!allDeps["@tauri-apps/api"],
            };
          }),
        );
        const hasCliDep = results.some((r) => r.hasCliDep);
        const hasApiDep = results.some((r) => r.hasApiDep);

        if (!hasCliDep) {
          ctx.report.warning({
            message:
              "@tauri-apps/cli not found in any workspace package — required for Tauri build tooling",
            file: "package.json",
            fix: "Add @tauri-apps/cli as a devDependency in the root or desktop package",
          });
        }

        if (!hasApiDep) {
          ctx.report.warning({
            message:
              "@tauri-apps/api not found in any workspace package — required for frontend-to-Rust IPC",
            file: "package.json",
            fix: "Add @tauri-apps/api as a dependency in the frontend or desktop package",
          });
        }
      },
    },
    "no-electron": {
      description: "No Electron or alternative desktop shell frameworks are permitted",
      async check(ctx) {
        const banned = ["electron", "electron-builder", "nw", "neutralino"];
        const pkgFiles = await ctx.glob("**/package.json");

        await Promise.all(
          pkgFiles.map(async (pkgFile) => {
            let pkg: Record<string, unknown>;
            try {
              pkg = (await ctx.readJSON(pkgFile)) as Record<string, unknown>;
            } catch {
              return;
            }

            const allDeps = {
              ...((pkg.dependencies ?? {}) as Record<string, string>),
              ...((pkg.devDependencies ?? {}) as Record<string, string>),
            };

            for (const framework of banned) {
              if (allDeps[framework]) {
                ctx.report.violation({
                  message: `${pkgFile}: contains banned desktop shell dependency "${framework}"`,
                  file: pkgFile,
                  fix: `Remove "${framework}" — Tauri v2 is the only permitted desktop shell`,
                });
              }
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
