/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "interactive-elements-need-accessible-names": {
      description:
        "Buttons and interactive elements must have accessible text or aria-label",
      async check(ctx) {
        const sourceGlob = "**/*.{tsx,jsx}";

        // Find self-closing buttons (no children, no aria-label)
        const selfClosingButtons = await ctx.grepFiles(
          /<button\s*\/>/u,
          sourceGlob
        );

        for (const m of selfClosingButtons) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.warning({
            message:
              "Self-closing `<button />` has no accessible name — add text content or `aria-label`.",
            file: m.file,
            line: m.line,
            fix: 'Add text content: `<button>Label</button>` or an aria-label: `<button aria-label="Action"><Icon /></button>`.',
          });
        }

        // Find empty buttons: <button></button> without aria-label
        const emptyButtons = await ctx.grepFiles(
          /<button\s*>\s*<\/button>/u,
          sourceGlob
        );

        for (const m of emptyButtons) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.warning({
            message:
              "Empty `<button></button>` has no accessible name — add text content or `aria-label`.",
            file: m.file,
            line: m.line,
            fix: 'Add text content: `<button>Label</button>` or an aria-label: `<button aria-label="Action"><Icon /></button>`.',
          });
        }

        // Find buttons with only an aria-label={undefined} or missing aria-label
        const buttonsNoLabel = await ctx.grepFiles(
          /<button\s+(?!.*(?:aria-label|aria-labelledby|children))[^>]*>[^<]*<[^/]/u,
          sourceGlob
        );

        // This is best-effort — the grep-based approach catches the most obvious cases
      },
    },
  },
} satisfies RuleSet;
