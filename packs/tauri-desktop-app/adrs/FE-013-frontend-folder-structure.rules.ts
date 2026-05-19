/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "required-src-directories": {
      description:
        "packages/frontend/src/ must contain at least routes/, components/, and pages/ directories",
      async check(ctx) {
        const requiredDirs = ["routes", "components", "pages"];

        for (const dir of requiredDirs) {
          const dirGlob = `packages/frontend/src/${dir}/**/*`;
          const files = await ctx.glob(dirGlob);

          if (files.length === 0) {
            // Also check if the directory simply exists but is empty
            // by looking for any file type
            const anyFile = await ctx.glob(
              `packages/frontend/src/${dir}/*`,
            );

            if (anyFile.length === 0) {
              ctx.report.violation({
                message: `packages/frontend/src/${dir}/ directory is missing or empty`,
                file: "packages/frontend/src",
                fix: `Create the packages/frontend/src/${dir}/ directory with appropriate files`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
