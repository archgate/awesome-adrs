/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "tanstack-router-dependency": {
      description:
        "The frontend must depend on @tanstack/react-router; no competing routers allowed",
      async check(ctx) {
        let frontendPkg: PackageJson | undefined;
        try {
          frontendPkg = (await ctx.readJSON("packages/frontend/package.json")) as PackageJson;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify @tanstack/react-router dependency",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = frontendPkg.dependencies ?? {};
        const devDeps = frontendPkg.devDependencies ?? {};

        if (!deps["@tanstack/react-router"] && !devDeps["@tanstack/react-router"]) {
          ctx.report.violation({
            message:
              "packages/frontend/package.json does not list @tanstack/react-router as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "@tanstack/react-router" to dependencies in packages/frontend/package.json',
          });
        }

        // Check for banned routing libraries
        const banned = ["react-router-dom", "react-router", "@reach/router"];
        const allDeps = { ...deps, ...devDeps };

        for (const lib of banned) {
          if (allDeps[lib]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned routing dependency "${lib}"`,
              file: "packages/frontend/package.json",
              fix: `Remove "${lib}" and use @tanstack/react-router instead`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
