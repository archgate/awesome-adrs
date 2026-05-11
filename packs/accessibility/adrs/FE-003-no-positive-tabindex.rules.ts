/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-positive-tabindex": {
      description:
        "tabIndex values greater than 0 are not allowed — only 0 and -1 are acceptable",
      async check(ctx) {
        const sourceGlob = "**/*.{tsx,jsx}";

        // Match tabIndex with a positive integer value (1 or greater)
        // Handles tabIndex={1}, tabIndex={5}, tabIndex={99}, etc.
        const matches = await ctx.grepFiles(
          /tabIndex=\{([1-9]\d*)\}/u,
          sourceGlob
        );

        for (const m of matches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.violation({
            message:
              "Positive `tabIndex` value disrupts natural tab order — only `tabIndex={0}` and `tabIndex={-1}` are allowed.",
            file: m.file,
            line: m.line,
            fix: "Remove the `tabIndex` attribute or use `tabIndex={0}` (natural order) or `tabIndex={-1}` (programmatic focus only). Fix the DOM order if tab sequence needs adjustment.",
          });
        }

        // Also check string-style tabIndex="N"
        const stringMatches = await ctx.grepFiles(
          /tabIndex="([1-9]\d*)"/u,
          sourceGlob
        );

        for (const m of stringMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.violation({
            message:
              "Positive `tabIndex` value disrupts natural tab order — only `tabIndex={0}` and `tabIndex={-1}` are allowed.",
            file: m.file,
            line: m.line,
            fix: "Remove the `tabIndex` attribute or use `tabIndex={0}` (natural order) or `tabIndex={-1}` (programmatic focus only).",
          });
        }
      },
    },
  },
} satisfies RuleSet;
