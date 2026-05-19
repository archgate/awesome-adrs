/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "jotai-client-state-dependency": {
      description:
        "When global state is used, jotai must be the dependency; no competing state libraries allowed",
      async check(ctx) {
        let frontendPkg: PackageJson | undefined;
        try {
          frontendPkg = (await ctx.readJSON("packages/frontend/package.json")) as PackageJson;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify state management dependencies",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = frontendPkg.dependencies ?? {};
        const devDeps = frontendPkg.devDependencies ?? {};
        const allDeps = { ...deps, ...devDeps };

        // Check for banned state management libraries
        const banned = [
          "redux",
          "@reduxjs/toolkit",
          "zustand",
          "mobx",
          "mobx-react",
          "mobx-react-lite",
          "recoil",
        ];

        for (const lib of banned) {
          if (allDeps[lib]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned state management dependency "${lib}"`,
              file: "packages/frontend/package.json",
              fix: `Remove "${lib}" and use jotai instead (or remove global state if not needed)`,
            });
          }
        }

        // Jotai is optional — only warn if atoms directory exists but jotai is missing
        const atomFiles = await ctx.glob("packages/frontend/src/atoms/**/*.ts");
        if (atomFiles.length > 0 && !allDeps["jotai"]) {
          ctx.report.violation({
            message: "packages/frontend has atom files but jotai is not listed as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "jotai" to dependencies in packages/frontend/package.json',
          });
        }
      },
    },
  },
} satisfies RuleSet;
