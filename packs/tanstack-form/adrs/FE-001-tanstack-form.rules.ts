/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "tanstack-form-dependency": {
      description:
        "The frontend must depend on @tanstack/react-form; no competing form libraries allowed",
      async check(ctx) {
        let frontendPkg: PackageJson | undefined;
        try {
          frontendPkg = (await ctx.readJSON("packages/frontend/package.json")) as PackageJson;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify @tanstack/react-form dependency",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = frontendPkg.dependencies ?? {};
        const devDeps = frontendPkg.devDependencies ?? {};

        if (!deps["@tanstack/react-form"] && !devDeps["@tanstack/react-form"]) {
          ctx.report.violation({
            message:
              "packages/frontend/package.json does not list @tanstack/react-form as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "@tanstack/react-form" to dependencies in packages/frontend/package.json',
          });
        }

        // Check for banned form libraries
        const banned = ["formik", "react-hook-form", "final-form", "react-final-form"];
        const allDeps = { ...deps, ...devDeps };

        for (const lib of banned) {
          if (allDeps[lib]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned form library dependency "${lib}"`,
              file: "packages/frontend/package.json",
              fix: `Remove "${lib}" and use @tanstack/react-form instead`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
