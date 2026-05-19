/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "mui-dependency-required": {
      description:
        "Frontend must depend on @mui/material; no competing component libraries allowed",
      async check(ctx) {
        let pkg: Record<string, unknown>;
        try {
          pkg = (await ctx.readJSON(
            "packages/frontend/package.json",
          )) as Record<string, unknown>;
        } catch {
          ctx.report.warning({
            message:
              "packages/frontend/package.json not found — cannot verify MUI dependency",
            file: "packages/frontend/package.json",
          });
          return;
        }

        const deps = (pkg.dependencies ?? {}) as Record<string, string>;
        const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
        const allDeps = { ...deps, ...devDeps };

        if (!allDeps["@mui/material"]) {
          ctx.report.violation({
            message:
              "packages/frontend/package.json does not list @mui/material as a dependency",
            file: "packages/frontend/package.json",
            fix: 'Add "@mui/material" to dependencies in packages/frontend/package.json',
          });
        }

        // Check for banned competing component libraries
        const banned = ["@chakra-ui/react", "antd", "@mantine/core"];

        for (const lib of banned) {
          if (allDeps[lib]) {
            ctx.report.violation({
              message: `packages/frontend/package.json contains competing component library "${lib}". Use @mui/material as the sole component library.`,
              file: "packages/frontend/package.json",
              fix: `Remove "${lib}" and use @mui/material components instead.`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
