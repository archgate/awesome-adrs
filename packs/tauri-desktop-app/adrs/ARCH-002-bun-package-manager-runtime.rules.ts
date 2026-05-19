/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "bun-lockfile-exists": {
      description: "bun.lock must exist as the project lockfile",
      async check(ctx) {
        try {
          await ctx.readFile("bun.lock");
        } catch {
          ctx.report.violation({
            message: "bun.lock file is missing",
            file: "bun.lock",
            fix: 'Run "bun install" to generate bun.lock',
          });
        }
      },
    },
    "no-wrong-lockfiles": {
      description:
        "No package-lock.json, yarn.lock, or pnpm-lock.yaml allowed",
      async check(ctx) {
        const wrongLockfiles = [
          "package-lock.json",
          "yarn.lock",
          "pnpm-lock.yaml",
        ];

        for (const lockfile of wrongLockfiles) {
          try {
            await ctx.readFile(lockfile);
            ctx.report.violation({
              message: `${lockfile} found — use bun.lock instead`,
              file: lockfile,
              fix: `Delete ${lockfile} and use "bun install" to generate bun.lock`,
            });
          } catch {
            // File doesn't exist — good
          }
        }
      },
    },
    "no-legacy-runtime-deps": {
      description:
        "No ts-node, nodemon, or tsx in dependencies — bun replaces them",
      async check(ctx) {
        const bannedDeps = ["ts-node", "nodemon", "tsx"];
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

          for (const dep of bannedDeps) {
            if (allDeps[dep]) {
              ctx.report.violation({
                message: `${pkgFile}: contains banned dependency "${dep}" — bun replaces it`,
                file: pkgFile,
                fix: `Remove "${dep}" from dependencies and use "bun --watch" instead`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
