/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "pyproject-toml-exists": {
      description:
        "Python job packages must have a pyproject.toml file",
      async check(ctx) {
        const pyFiles = await ctx.glob("packages/jobs/**/*.py");
        if (pyFiles.length === 0) return;

        const pyprojectFiles = await ctx.glob("packages/jobs/**/pyproject.toml");
        if (pyprojectFiles.length === 0) {
          ctx.report.violation({
            message:
              "Python files found in packages/jobs/ but no pyproject.toml exists — UV requires pyproject.toml for dependency management",
            file: "packages/jobs/pyproject.toml",
            fix: "Create a pyproject.toml file in the Python job package root using `uv init`",
          });
        }
      },
    },
    "no-legacy-python-config": {
      description:
        "No legacy Python dependency/config files (requirements.txt, Pipfile, setup.py, setup.cfg, poetry.lock)",
      async check(ctx) {
        const forbidden = [
          { glob: "packages/jobs/**/requirements.txt", name: "requirements.txt" },
          { glob: "packages/jobs/**/requirements*.txt", name: "requirements*.txt" },
          { glob: "packages/jobs/**/Pipfile", name: "Pipfile" },
          { glob: "packages/jobs/**/Pipfile.lock", name: "Pipfile.lock" },
          { glob: "packages/jobs/**/setup.py", name: "setup.py" },
          { glob: "packages/jobs/**/setup.cfg", name: "setup.cfg" },
          { glob: "packages/jobs/**/poetry.lock", name: "poetry.lock" },
        ];

        for (const { glob, name } of forbidden) {
          const files = await ctx.glob(glob);
          for (const file of files) {
            if (file.includes("node_modules/")) continue;
            if (file.includes(".venv/")) continue;

            ctx.report.violation({
              message: `${file}: legacy Python config file "${name}" found — UV uses pyproject.toml + uv.lock exclusively`,
              file,
              fix: `Remove ${file} and migrate configuration to pyproject.toml with UV`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
