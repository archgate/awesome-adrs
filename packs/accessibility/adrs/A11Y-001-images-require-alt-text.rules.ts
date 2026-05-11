/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "images-require-alt-text": {
      description:
        "All <img> elements and Image components must have an alt attribute",
      async check(ctx) {
        const sourceGlob = "**/*.{tsx,jsx}";

        // Find <img or <Image tags without alt attribute
        // Match self-closing img/Image tags without alt
        const imgMatches = await ctx.grepFiles(
          /<(?:img|Image)\s+(?!.*\balt\b)[^>]*\/?>/u,
          sourceGlob
        );

        for (const m of imgMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.violation({
            message:
              "`<img>` or `<Image>` element is missing an `alt` attribute — all images must have alt text (use `alt=\"\"` for decorative images).",
            file: m.file,
            line: m.line,
            fix: 'Add an `alt` attribute with descriptive text, or `alt=""` if the image is purely decorative.',
          });
        }
      },
    },
  },
} satisfies RuleSet;
