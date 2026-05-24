/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "catalog-usage": {
      description: 'All workspace dependencies must use "catalog:" or "workspace:" notation',
      async check(ctx) {
        const packageJsonFiles = [
          ...(await ctx.glob("packages/*/package.json")),
          ...(await ctx.glob("packages/*/*/package.json")),
        ];

        await Promise.all(
          packageJsonFiles.map(async (file) => {
            const pkg = await ctx.readJSON(file);
            for (const depType of ["dependencies", "devDependencies", "peerDependencies"]) {
              const deps = (pkg as Record<string, unknown>)[depType] as
                | Record<string, string>
                | undefined;
              if (!deps) continue;

              for (const [name, version] of Object.entries(deps)) {
                if (
                  typeof version === "string" &&
                  !version.startsWith("catalog:") &&
                  !version.startsWith("workspace:")
                ) {
                  ctx.report.violation({
                    message: `${file}: ${depType}.${name} uses "${version}" instead of "catalog:" or "workspace:"`,
                    file,
                    fix: `Change to "catalog:" and ensure the package is listed in root package.json catalog`,
                  });
                }
              }
            }
          }),
        );
      },
    },
    "catalog-completeness": {
      description: "All catalog: references must resolve to entries in root package.json catalog",
      async check(ctx) {
        const rootPkg = await ctx.readJSON("package.json");
        const catalog =
          (rootPkg as Record<string, unknown>).catalog ??
          ((rootPkg.workspaces as Record<string, unknown>)?.catalog as
            | Record<string, string>
            | undefined) ??
          {};
        const catalogKeys = new Set(Object.keys(catalog as Record<string, string>));

        const packageJsonFiles = [
          ...(await ctx.glob("packages/*/package.json")),
          ...(await ctx.glob("packages/*/*/package.json")),
        ];

        await Promise.all(
          packageJsonFiles.map(async (file) => {
            const pkg = await ctx.readJSON(file);
            for (const depType of ["dependencies", "devDependencies", "peerDependencies"]) {
              const deps = (pkg as Record<string, unknown>)[depType] as
                | Record<string, string>
                | undefined;
              if (!deps) continue;

              for (const [name, version] of Object.entries(deps)) {
                if (typeof version !== "string") continue;
                if (!version.startsWith("catalog:")) continue;

                const catalogRef = version === "catalog:" ? name : version.slice("catalog:".length);

                if (!catalogKeys.has(catalogRef)) {
                  ctx.report.violation({
                    message: `${file}: ${depType}.${name} references "catalog:${catalogRef === name ? "" : catalogRef}" but "${catalogRef}" is not in root catalog`,
                    file,
                    fix: `Add "${catalogRef}" to the catalog section in the root package.json`,
                  });
                }
              }
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
