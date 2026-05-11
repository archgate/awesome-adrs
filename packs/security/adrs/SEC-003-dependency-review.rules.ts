/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "dependency-review": {
      description:
        "Flag dependencies with postinstall scripts as potential supply chain risks",
      severity: "warning",
      async check(ctx) {
        const pkg = await ctx.readJSON("package.json");
        if (!pkg || typeof pkg !== "object") return;

        const pkgData = pkg as PackageJson;
        const allDeps: Record<string, string> = {
          ...(pkgData.dependencies ?? {}),
          ...(pkgData.devDependencies ?? {}),
        };

        // Check if any dependency's own package.json has lifecycle scripts
        // For now, check the project's own package.json for risky patterns
        const scripts = (pkgData as { scripts?: Record<string, string> })
          .scripts;
        if (scripts) {
          if (scripts.postinstall) {
            ctx.report.warning({
              message:
                "This project has a `postinstall` script — ensure it does not execute untrusted code.",
              file: "package.json",
              fix: "Review the postinstall script and remove it if it is not essential.",
            });
          }
          if (scripts.preinstall) {
            ctx.report.warning({
              message:
                "This project has a `preinstall` script — ensure it does not execute untrusted code.",
              file: "package.json",
              fix: "Review the preinstall script and remove it if it is not essential.",
            });
          }
        }

        // Flag if there are many dependencies (potential bloat)
        const depCount = Object.keys(allDeps).length;
        if (depCount > 100) {
          ctx.report.warning({
            message: `Project has ${depCount} dependencies — consider auditing for unnecessary packages.`,
            file: "package.json",
            fix: "Run `npm audit` and review whether all dependencies are necessary.",
          });
        }
      },
    },
  },
} satisfies RuleSet;
