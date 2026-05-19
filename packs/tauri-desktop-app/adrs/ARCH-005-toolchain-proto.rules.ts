/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "prototools-present": {
      description: ".prototools must exist and define bun, node, and python versions",
      async check(ctx) {
        let content: string;
        try {
          content = await ctx.readFile(".prototools");
        } catch {
          ctx.report.violation({
            message: ".prototools file is missing",
            file: ".prototools",
            fix: "Create a .prototools file with version pins for bun, node, and python",
          });
          return;
        }

        const requiredTools = ["bun", "node", "python"];
        for (const tool of requiredTools) {
          const pattern = new RegExp(`^${tool}\\s*=`, "m");
          if (!pattern.test(content)) {
            ctx.report.violation({
              message: `.prototools is missing required tool: ${tool}`,
              file: ".prototools",
              fix: `Add "${tool} = <version>" to .prototools`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
