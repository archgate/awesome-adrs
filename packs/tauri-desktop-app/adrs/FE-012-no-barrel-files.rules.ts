/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "no-barrel-files": {
      description:
        "No index.ts/index.tsx barrel files that re-export from other modules in the frontend",
      async check(ctx) {
        const indexFiles = ctx.scopedFiles.filter(
          (f) =>
            (f.endsWith("/index.ts") ||
              f.endsWith("\\index.ts") ||
              f.endsWith("/index.tsx") ||
              f.endsWith("\\index.tsx")) &&
            (f.includes("/src/") || f.includes("\\src\\")),
        );

        // Patterns that indicate a barrel / re-export file
        const RE_EXPORT_PATTERNS = [
          /export\s*\{[^}]*\}\s*from\s/,
          /export\s*\*\s*from\s/,
          /export\s*\{\s*default\s*\}\s*from\s/,
        ];

        const filesToCheck = indexFiles.filter(
          (file) => !file.includes("/routes/") && !file.includes("\\routes\\"),
        );

        await Promise.all(
          filesToCheck.map(async (file) => {
            let content: string;
            try {
              content = await ctx.readFile(file);
            } catch {
              return;
            }

            const isBarrel = RE_EXPORT_PATTERNS.some((pattern) => pattern.test(content));

            if (isBarrel) {
              ctx.report.violation({
                message: `${file}: Barrel file detected — index files must not re-export from other modules`,
                file,
                fix: "Remove the barrel file and update imports to reference the actual source files directly",
              });
            }
          }),
        );
      },
    },
  },
} satisfies RuleSet;
