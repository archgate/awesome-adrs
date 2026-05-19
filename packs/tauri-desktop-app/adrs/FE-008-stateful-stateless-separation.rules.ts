/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "connected-wrapper-existence": {
      description: "Connected wrappers must have a corresponding presentational component file",
      async check(ctx) {
        const connectedFiles = await ctx.glob("packages/frontend/src/**/*Connected.tsx");

        for (const file of connectedFiles) {
          if (file.includes(".stories.")) continue;
          if (file.includes(".test.")) continue;

          const content = await ctx.readFile(file);

          // Support ignore directive
          if (/^\/\/\s*@no-presentational:/.test(content.trimStart())) continue;

          const presentationalFile = file.replace(/Connected\.tsx$/, ".tsx");

          try {
            await ctx.readFile(presentationalFile);
          } catch {
            ctx.report.violation({
              message: `${file}: Connected wrapper has no corresponding presentational component (expected ${presentationalFile}). Add "// @no-presentational: <reason>" as the first line to opt out.`,
              file,
              fix: `Create ${presentationalFile} as the presentational counterpart`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
