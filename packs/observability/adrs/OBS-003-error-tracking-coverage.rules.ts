/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "error-tracking-coverage": {
      description:
        "Catch blocks must report errors to the error tracking system, not silently swallow them",
      async check(ctx) {
        const sourceGlob = "**/*.{ts,tsx,js,jsx}";

        // Find empty catch blocks: catch (err) {} or catch {}
        const emptyCatchMatches = await ctx.grepFiles(
          /catch\s*(?:\([^)]*\))?\s*\{\s*\}/u,
          sourceGlob
        );

        for (const m of emptyCatchMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }
          ctx.report.warning({
            message:
              "Empty catch block silently swallows errors — report the error to the error tracking system.",
            file: m.file,
            line: m.line,
            fix: "Add error reporting: `Sentry.captureException(err)` or `logger.error({ err }, \"message\")`.",
          });
        }

        // Find catch blocks that only use console.* without error tracking
        // This is a heuristic: find files with catch blocks that have console but no
        // common error tracking calls
        const catchConsoleMatches = await ctx.grepFiles(
          /catch\s*\([^)]*\)\s*\{[^}]*console\.(log|warn|error)/u,
          sourceGlob
        );

        for (const m of catchConsoleMatches) {
          if (
            m.file.includes(".test.") ||
            m.file.includes(".spec.") ||
            m.file.includes("__tests__")
          ) {
            continue;
          }

          // Check if the catch block also has error tracking
          const hasTracking =
            /Sentry|captureException|captureMessage|Bugsnag|trackError|reportError|errorTracker/u.test(
              m.content
            );

          if (!hasTracking) {
            ctx.report.warning({
              message:
                "Catch block uses `console` logging without error tracking — report errors to the error tracking system in addition to logging.",
              file: m.file,
              line: m.line,
              fix: "Add error reporting alongside logging: `Sentry.captureException(err)` or equivalent.",
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
