/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "tanstack-query-dependency": {
      description:
        "The frontend must depend on @tanstack/react-query; no competing data-fetching libraries allowed",
      async check(ctx) {
        let frontendPkg: PackageJson | undefined;
        try {
          frontendPkg = (await ctx.readJSON("packages/frontend/package.json")) as PackageJson;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify @tanstack/react-query dependency",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = frontendPkg.dependencies ?? {};
        const devDeps = frontendPkg.devDependencies ?? {};

        if (!deps["@tanstack/react-query"] && !devDeps["@tanstack/react-query"]) {
          ctx.report.violation({
            message:
              "packages/frontend/package.json does not list @tanstack/react-query as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "@tanstack/react-query" to dependencies in packages/frontend/package.json',
          });
        }

        // Check for banned data-fetching libraries
        const banned = ["swr", "axios", "urql", "@apollo/client"];
        const allDeps = { ...deps, ...devDeps };

        for (const lib of banned) {
          if (allDeps[lib]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains banned data-fetching dependency "${lib}"`,
              file: "packages/frontend/package.json",
              fix: `Remove "${lib}" and use @tanstack/react-query instead`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
