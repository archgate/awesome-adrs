/// <reference path="../rules.d.ts" />

function stripJsonComments(text: string): string {
  let result = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      result += ch;
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escape = true;
      if (ch === '"') inString = false;
      result += ch;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      result += "\n";
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
      continue;
    }
    if (ch === '"') inString = true;
    result += ch;
  }
  return result;
}

export default {
  rules: {
    "no-path-aliases": {
      description:
        "No convenience path aliases allowed in tsconfig — only workspace package name mappings are permitted",
      async check(ctx) {
        const tsconfigFiles = [
          ...(await ctx.glob("packages/*/tsconfig.json")),
          ...(await ctx.glob("packages/*/*/tsconfig.json")),
        ];

        for (const file of tsconfigFiles) {
          const text = await ctx.readFile(file);
          const tsconfig = JSON.parse(stripJsonComments(text));
          const paths = tsconfig.compilerOptions?.paths;
          if (!paths) continue;

          for (const alias of Object.keys(paths)) {
            // Allow workspace package name mappings (e.g., @project/*)
            // Reject convenience aliases like @/, ~/, @components/, etc.
            if (
              alias === "@/*" ||
              alias === "~/*" ||
              alias.startsWith("@/") ||
              alias.startsWith("~/") ||
              (!alias.includes("/") && alias.endsWith("/*"))
            ) {
              ctx.report.violation({
                message: `${file}: path alias "${alias}" is not allowed — only workspace package name mappings are permitted`,
                file,
                fix: `Remove the "${alias}" path alias and use relative imports instead`,
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
