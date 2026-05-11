/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "use-client-directive-only-when-needed": {
      description:
        'Components must not use "use client" unless they use browser APIs, hooks, or event handlers',
      async check(ctx) {
        const sourceGlob = "**/*.{tsx,ts,jsx}";

        const useClientMatches = await ctx.grepFiles(
          /["']use client["']/u,
          sourceGlob
        );

        // Get unique files with "use client"
        const files = new Set(useClientMatches.map((m) => m.file));

        for (const file of files) {
          if (
            file.includes(".test.") ||
            file.includes(".spec.") ||
            file.includes("__tests__")
          ) {
            continue;
          }

          const content = await ctx.readFile(file);

          const needsClient =
            /\buseState\b|\buseEffect\b|\buseRef\b|\buseContext\b|\buseReducer\b|\buseCallback\b|\buseMemo\b/u.test(
              content
            ) ||
            /\bonClick\b|\bonChange\b|\bonSubmit\b|\bonBlur\b|\bonFocus\b|\bonKeyDown\b|\bonKeyUp\b/u.test(
              content
            ) ||
            /\bwindow\.\b|\bdocument\.\b/u.test(content);

          if (!needsClient) {
            ctx.report.warning({
              message:
                '`"use client"` directive found but no hooks, event handlers, or browser APIs detected — this component may not need to be a Client Component.',
              file,
              fix: 'Remove `"use client"` if the component does not use hooks, event handlers, or browser APIs.',
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
