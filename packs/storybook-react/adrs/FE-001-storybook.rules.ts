/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "storybook-in-devdeps": {
      description: "Storybook must be listed in the frontend package devDependencies",
      async check(ctx) {
        let pkg: { devDependencies?: Record<string, string> };
        try {
          pkg = (await ctx.readJSON("packages/frontend/package.json")) as typeof pkg;
        } catch {
          // No frontend package.json found — skip
          return;
        }

        const devDeps = pkg.devDependencies ?? {};

        if (!devDeps["storybook"] && !devDeps["@storybook/react-vite"]) {
          ctx.report.violation({
            message:
              'packages/frontend/package.json: Missing Storybook in devDependencies (expected "storybook" or "@storybook/react-vite")',
            file: "packages/frontend/package.json",
            fix: "Add storybook and @storybook/react-vite to devDependencies",
          });
        }
      },
    },

    "story-file-existence": {
      description:
        "Presentational component .tsx files must have corresponding colocated .stories.tsx files",
      async check(ctx) {
        const componentFiles = ctx.scopedFiles.filter(
          (f) =>
            f.endsWith(".tsx") &&
            (f.includes("/src/components/") || f.includes("\\src\\components\\")),
        );

        const filesToCheck = componentFiles.filter((file) => {
          if (file.includes(".stories.")) return false;
          if (file.includes(".test.")) return false;
          if (file.includes(".spec.")) return false;
          if (file.includes("/hooks/")) return false;
          if (file.includes("/queries/")) return false;
          if (file.includes("/atoms/")) return false;
          if (file.endsWith(".types.tsx") || file.endsWith("/types.tsx")) return false;
          return true;
        });

        await Promise.all(
          filesToCheck.map(async (file) => {
            const storyFile = file.replace(/\.tsx$/, ".stories.tsx");
            let storyExists = false;
            try {
              await ctx.readFile(storyFile);
              storyExists = true;
            } catch {
              // Story file doesn't exist
            }

            // For Connected components, also check if the base component has a story
            if (!storyExists && file.includes("Connected")) {
              const baseStoryFile = file.replace(/Connected\.tsx$/, ".stories.tsx");
              try {
                await ctx.readFile(baseStoryFile);
                storyExists = true;
              } catch {
                // Base story file doesn't exist either
              }
            }

            if (!storyExists) {
              ctx.report.violation({
                message: `${file}: Missing corresponding story file (expected ${storyFile})`,
                file,
                fix: `Create ${storyFile} with at least a Default story`,
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
