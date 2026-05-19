/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "i18next-in-deps": {
      description: "i18next and react-i18next must be listed in frontend dependencies",
      async check(ctx) {
        let pkg: {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        try {
          pkg = (await ctx.readJSON("packages/frontend/package.json")) as typeof pkg;
        } catch {
          // No frontend package.json found — skip
          return;
        }

        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        if (!allDeps["i18next"]) {
          ctx.report.violation({
            message: "packages/frontend/package.json: Missing i18next in dependencies",
            file: "packages/frontend/package.json",
            fix: "Add i18next to dependencies",
          });
        }

        if (!allDeps["react-i18next"]) {
          ctx.report.violation({
            message: "packages/frontend/package.json: Missing react-i18next in dependencies",
            file: "packages/frontend/package.json",
            fix: "Add react-i18next to dependencies",
          });
        }
      },
    },

    "translation-key-consistency": {
      description:
        "All translation JSON files must have identical key structures across supported languages",
      async check(ctx) {
        const translationFiles = await ctx.glob(
          "packages/frontend/src/i18n/locales/*/translation.json",
        );

        if (translationFiles.length < 2) {
          // Nothing to compare if there's fewer than two languages
          return;
        }

        function extractKeys(obj: Record<string, unknown>, prefix = ""): Set<string> {
          const keys = new Set<string>();
          for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
              for (const subKey of extractKeys(value as Record<string, unknown>, fullKey)) {
                keys.add(subKey);
              }
            } else {
              keys.add(fullKey);
            }
          }
          return keys;
        }

        function langFromPath(path: string): string {
          const match = path.match(/locales[\\/]([^\\/]+)[\\/]translation\.json$/);
          return match ? match[1] : path;
        }

        const langKeys = new Map<string, Set<string>>();
        const langPaths = new Map<string, string>();

        for (const filePath of translationFiles) {
          const lang = langFromPath(filePath);
          langPaths.set(lang, filePath);
          try {
            const content = await ctx.readFile(filePath);
            const json = JSON.parse(content) as Record<string, unknown>;
            langKeys.set(lang, extractKeys(json));
          } catch {
            ctx.report.violation({
              message: `${filePath}: Could not read or parse translation file for "${lang}"`,
              file: filePath,
              fix: `Ensure ${filePath} exists and contains valid JSON`,
            });
            return;
          }
        }

        // Build union of all keys
        const allKeys = new Set<string>();
        for (const keys of langKeys.values()) {
          for (const key of keys) {
            allKeys.add(key);
          }
        }

        // Check each key exists in all languages
        for (const key of allKeys) {
          const missingLangs: string[] = [];
          for (const [lang, keys] of langKeys) {
            if (!keys.has(key)) {
              missingLangs.push(lang);
            }
          }

          if (missingLangs.length > 0) {
            const presentLangs = [...langKeys.entries()]
              .filter(([, keys]) => keys.has(key))
              .map(([lang]) => lang);

            const firstMissingLang = [...langKeys.entries()].find(([, keys]) => !keys.has(key));
            const file = firstMissingLang
              ? (langPaths.get(firstMissingLang[0]) ?? translationFiles[0])
              : translationFiles[0];

            ctx.report.violation({
              message: `Translation key "${key}" exists in ${presentLangs.join(", ")} but is missing from ${missingLangs.join(", ")}`,
              file,
              fix: `Add the key "${key}" to the missing translation file(s)`,
            });
          }
        }
      },
    },
  },
} satisfies RuleSet;
