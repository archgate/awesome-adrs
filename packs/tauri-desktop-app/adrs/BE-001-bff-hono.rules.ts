/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "hono-backend-dependency": {
      description:
        "The backend package must depend on hono; no express/fastify/nestjs/koa allowed anywhere",
      async check(ctx) {
        // Check that the backend package.json has hono as a dependency
        let backendPkg: Record<string, unknown> | undefined;
        try {
          backendPkg = (await ctx.readJSON("packages/backend/package.json")) as Record<
            string,
            unknown
          >;
        } catch {
          ctx.report.warning({
            message: "packages/backend/package.json not found — cannot verify hono dependency",
            file: "packages/backend/package.json",
          });
          return;
        }

        const deps = (backendPkg.dependencies ?? {}) as Record<string, string>;
        const devDeps = (backendPkg.devDependencies ?? {}) as Record<string, string>;

        if (!deps["hono"] && !devDeps["hono"]) {
          ctx.report.violation({
            message: "packages/backend/package.json does not list hono as a dependency",
            file: "packages/backend/package.json",
            fix: 'Add "hono" to dependencies in packages/backend/package.json',
          });
        }

        // Check all workspace package.json files for banned frameworks
        const banned = ["express", "fastify", "@nestjs/core", "koa"];
        const pkgFiles = await ctx.glob("**/package.json");

        for (const pkgFile of pkgFiles) {
          if (pkgFile.includes("node_modules")) continue;

          let pkg: Record<string, unknown>;
          try {
            pkg = (await ctx.readJSON(pkgFile)) as Record<string, unknown>;
          } catch {
            continue;
          }

          const allDeps = {
            ...((pkg.dependencies ?? {}) as Record<string, string>),
            ...((pkg.devDependencies ?? {}) as Record<string, string>),
          };

          for (const framework of banned) {
            if (allDeps[framework]) {
              ctx.report.violation({
                message: `${pkgFile}: contains banned framework dependency "${framework}"`,
                file: pkgFile,
                fix: `Remove "${framework}" and use hono instead`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
