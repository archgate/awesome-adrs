/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-legacy-type-checker-config": {
      description:
        "No mypy or pyright configuration files allowed — ty is the mandatory type checker",
      async check(ctx) {
        const forbidden = [
          { glob: "packages/jobs/**/mypy.ini", name: "mypy.ini" },
          { glob: "packages/jobs/**/.mypy.ini", name: ".mypy.ini" },
          { glob: "packages/jobs/**/pyrightconfig.json", name: "pyrightconfig.json" },
          { glob: "packages/jobs/**/.pyrightconfig.json", name: ".pyrightconfig.json" },
        ];

        for (const { glob, name } of forbidden) {
          const files = await ctx.glob(glob);
          for (const file of files) {
            ctx.report.violation({
              message: `${file}: legacy type checker config "${name}" found — ty is the mandatory type checker, configured in pyproject.toml`,
              file,
              fix: `Remove ${file} and configure ty in pyproject.toml under [tool.ty]`,
            });
          }
        }

        // Also check for mypy/pyright config sections in pyproject.toml
        const pyprojectFiles = ctx.scopedFiles.filter(
          (f) => f.endsWith("/pyproject.toml") || f.endsWith("\\pyproject.toml"),
        );
        await Promise.all(
          pyprojectFiles.map(async (file) => {
            const content = await ctx.readFile(file);

            if (content.includes("[tool.mypy]")) {
              ctx.report.violation({
                message: `${file}: contains [tool.mypy] configuration — ty is the mandatory type checker`,
                file,
                fix: "Remove [tool.mypy] section and use [tool.ty] instead",
              });
            }

            if (content.includes("[tool.pyright]")) {
              ctx.report.violation({
                message: `${file}: contains [tool.pyright] configuration — ty is the mandatory type checker`,
                file,
                fix: "Remove [tool.pyright] section and use [tool.ty] instead",
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
