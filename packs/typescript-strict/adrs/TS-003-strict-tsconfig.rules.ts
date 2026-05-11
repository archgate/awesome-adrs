/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "strict-tsconfig": {
      description: 'tsconfig.json must have "strict": true in compilerOptions',
      async check(ctx) {
        const tsconfig = (await ctx.readJSON("tsconfig.json")) as {
          compilerOptions?: { strict?: boolean };
        } | null;

        if (!tsconfig) {
          ctx.report.violation({
            message: "No tsconfig.json found in the project root.",
            file: "tsconfig.json",
            fix: 'Create a tsconfig.json with `"strict": true` in compilerOptions.',
          });
          return;
        }

        if (!tsconfig.compilerOptions) {
          ctx.report.violation({
            message:
              "tsconfig.json is missing compilerOptions — strict mode is not enabled.",
            file: "tsconfig.json",
            fix: 'Add `"compilerOptions": { "strict": true }` to tsconfig.json.',
          });
          return;
        }

        if (tsconfig.compilerOptions.strict !== true) {
          ctx.report.violation({
            message:
              'tsconfig.json does not have "strict": true — strict type checking is disabled.',
            file: "tsconfig.json",
            fix: 'Set `"strict": true` in compilerOptions.',
          });
        }
      },
    },
  },
} satisfies RuleSet;
