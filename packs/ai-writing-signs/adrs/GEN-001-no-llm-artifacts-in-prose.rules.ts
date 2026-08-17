/// <reference path="../rules.d.ts" />

// ---------- Markdown prose extraction (duplicated per rules file; rule files
// cannot import each other) ----------

interface ProseLine {
  /** 1-based line number in the source file. */
  line: number;
  /** Line with HTML comments and inline code spans blanked to spaces. */
  text: string;
  /** `text` with link targets and bare URLs blanked as well. */
  words: string;
  /** Inside a fenced code block: content of its own, never prose. */
  code: boolean;
}

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/u;
const FRONTMATTER_DELIMITER = /^---\s*$/u;

/** Same-length run of spaces, so columns of later matches stay stable. */
function blank(s: string): string {
  return " ".repeat(s.length);
}

/**
 * Prose lines of a Markdown document: YAML frontmatter, fenced code blocks and
 * HTML comments are dropped; inline code spans, link targets and bare URLs are
 * blanked so their contents never match a prose pattern.
 */
function proseLines(content: string): ProseLine[] {
  const out: ProseLine[] = [];
  const lines = content.split(/\r?\n/u);
  let inFrontmatter = FRONTMATTER_DELIMITER.test(lines[0] ?? "");
  let fence: { marker: string; length: number } | null = null;
  let inComment = false;

  for (const [index, raw] of lines.entries()) {
    if (inFrontmatter) {
      if (index > 0 && FRONTMATTER_DELIMITER.test(raw)) inFrontmatter = false;
      continue;
    }

    const fenceMatch = FENCE.exec(raw);
    if (fence) {
      const closes =
        fenceMatch !== null &&
        fenceMatch[1][0] === fence.marker &&
        fenceMatch[1].length >= fence.length &&
        fenceMatch[2].trim() === "";
      if (closes) fence = null;
      out.push({ line: index + 1, text: "", words: "", code: true });
      continue;
    }
    if (fenceMatch) {
      fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length };
      out.push({ line: index + 1, text: "", words: "", code: true });
      continue;
    }

    let text = raw;
    if (inComment) {
      const end = text.indexOf("-->");
      if (end === -1) continue;
      text = blank(text.slice(0, end + 3)) + text.slice(end + 3);
      inComment = false;
    }
    text = text.replace(/<!--[\s\S]*?-->/gu, blank);
    const open = text.indexOf("<!--");
    if (open !== -1) {
      text = text.slice(0, open) + blank(text.slice(open));
      inComment = true;
    }
    text = text.replace(/(`+)[\s\S]*?\1/gu, blank);

    const words = text
      .replace(/\]\(([^)]*)\)/gu, (_m, target: string) => `](${blank(target)})`)
      .replace(/<https?:\/\/[^>]*>/gu, blank)
      .replace(/https?:\/\/\S+/gu, blank);

    out.push({ line: index + 1, text, words, code: false });
  }
  return out;
}

// ---------- Source-comment extraction ----------

/** Double-slash line comments and slash-star block comments. */
const SLASH_COMMENT_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "mts",
  "cts",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "java",
  "kt",
  "kts",
  "go",
  "rs",
  "c",
  "h",
  "cpp",
  "hpp",
  "cc",
  "cs",
  "swift",
  "scala",
  "dart",
  "php",
  "groovy",
]);
/** `#` line comments. */
const HASH_COMMENT_EXTENSIONS = new Set([
  "py",
  "rb",
  "sh",
  "bash",
  "zsh",
  "pl",
  "r",
  "yml",
  "yaml",
  "toml",
  "tf",
  "ps1",
]);
/** `--` line comments. */
const DASH_COMMENT_EXTENSIONS = new Set(["sql", "lua"]);

function extensionOf(file: string): string {
  const dot = file.lastIndexOf(".");
  return dot === -1 ? "" : file.slice(dot + 1).toLowerCase();
}

/**
 * Heuristic string check: a comment marker counts only when the code before it
 * has balanced quotes, so `"http://x"` and `'#'` are not read as comments.
 */
function outsideString(prefix: string): boolean {
  let dq = 0;
  let sq = 0;
  let bt = 0;
  for (let i = 0; i < prefix.length; i++) {
    const c = prefix[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === '"') dq++;
    else if (c === "'") sq++;
    else if (c === "`") bt++;
  }
  return dq % 2 === 0 && sq % 2 === 0 && bt % 2 === 0;
}

/** Earliest comment marker on a line that sits outside a string literal. */
function findMarker(
  line: string,
  slash: boolean,
  hash: boolean,
  dash: boolean,
): { at: number; marker: "//" | "/*" | "#" | "--" } | null {
  let best: { at: number; marker: "//" | "/*" | "#" | "--" } | null = null;
  const consider = (re: RegExp, marker: "//" | "/*" | "#" | "--") => {
    for (const m of line.matchAll(re)) {
      const at = m.index + (m[1]?.length ?? 0);
      if (best && at >= best.at) break;
      if (outsideString(line.slice(0, at))) {
        best = { at, marker };
        break;
      }
    }
  };
  if (slash) {
    consider(/(^|[^:])\/\//gu, "//");
    consider(/()\/\*/gu, "/*");
  }
  if (hash) consider(/(^|\s)#/gu, "#");
  if (dash) consider(/(^|\s)--/gu, "--");
  return best;
}

/**
 * Comment text of a source file as prose lines, everything else blanked so
 * columns hold. Covers slash-style line and block comments (C-family), `#` (script languages) and
 * `--` (SQL, Lua). Docstrings and heredocs are not comments and are skipped.
 */
function commentLines(content: string, ext: string): ProseLine[] {
  const slash = SLASH_COMMENT_EXTENSIONS.has(ext);
  const hash = HASH_COMMENT_EXTENSIONS.has(ext);
  const dash = DASH_COMMENT_EXTENSIONS.has(ext);
  if (!slash && !hash && !dash) return [];

  const out: ProseLine[] = [];
  let inBlock = false;
  for (const [index, raw] of content.split(/\r?\n/u).entries()) {
    if (index === 0 && raw.startsWith("#!")) continue;
    let text: string;
    if (inBlock) {
      const end = raw.indexOf("*/");
      text = end === -1 ? raw : raw.slice(0, end) + blank(raw.slice(end));
      if (end !== -1) inBlock = false;
      // Blank the decorative leading `*` of a block-comment continuation line.
      text = text.replace(/^(\s*)\*(?!\/)/u, (_m, ws: string) => `${ws} `);
    } else {
      const found = findMarker(raw, slash, hash, dash);
      if (!found) continue;
      const { at, marker } = found;
      const start = at + marker.length;
      if (marker === "/*") {
        const end = raw.indexOf("*/", start);
        const body = end === -1 ? raw.slice(start) : raw.slice(start, end);
        text = blank(raw.slice(0, start)) + body.replace(/^\*+/u, blank);
        if (end === -1) inBlock = true;
        else text += blank(raw.slice(end));
      } else {
        text = blank(raw.slice(0, start)) + raw.slice(start);
      }
    }
    if (text.trim() === "") continue;

    text = text.replace(/(`+)[\s\S]*?\1/gu, blank);
    const words = text.replace(/<https?:\/\/[^>]*>/gu, blank).replace(/https?:\/\/\S+/gu, blank);
    out.push({ line: index + 1, text, words, code: false });
  }
  return out;
}

/** Generated files carry an `@generated` marker in their first lines; nobody authored their prose. */
function isGenerated(content: string): boolean {
  return /@generated\b/u.test(content.slice(0, 300));
}

/**
 * Visit every scoped file's prose: Markdown documents through `proseLines`,
 * source files through `commentLines`. Generated files and files of any other
 * kind are skipped.
 */
async function scanProse(
  ctx: RuleContext,
  visit: (file: string, lines: ProseLine[]) => void,
): Promise<void> {
  await Promise.all(
    ctx.scopedFiles.map(async (file) => {
      const ext = extensionOf(file);
      const markdown = ext === "md" || ext === "mdx";
      if (
        !markdown &&
        !SLASH_COMMENT_EXTENSIONS.has(ext) &&
        !HASH_COMMENT_EXTENSIONS.has(ext) &&
        !DASH_COMMENT_EXTENSIONS.has(ext)
      )
        return;
      let content: string;
      try {
        content = await ctx.readFile(file);
      } catch {
        return;
      }
      if (isGenerated(content)) return;
      visit(file, markdown ? proseLines(content) : commentLines(content, ext));
    }),
  );
}

// ---------- Patterns ----------

/** Tokens emitted by a model's browsing/citation tooling, keyed by vendor. */
const CITATION_RESIDUE: { pattern: RegExp; vendor: string }[] = [
  {
    pattern:
      /contentReference|oaicite|oai_citation|attributableIndex|\bturn\d+(?:search|view|news|image|fetch|file)\d+\b|【[^】]*†[^】]*】/u,
    vendor: "ChatGPT",
  },
  {
    pattern: /\[cite:\s*\d+\]?|\[span_\d+\]\(start_span\)|\(end_span\)/u,
    vendor: "Gemini",
  },
  { pattern: /grok_card|grok_render_citation_card_json/u, vendor: "Grok" },
  { pattern: /ppl-ai-file-upload|\battached_file\b/u, vendor: "Perplexity" },
  { pattern: /:::writing/u, vendor: "an unattributed model" },
];

/** Chat-turn framing and capability disclaimers addressed to a chat user. */
const CHAT_RESIDUE: RegExp[] = [
  /\bAs an AI(?: language model| assistant| model)?\b/iu,
  /\bas of my (?:last |latest )?(?:knowledge (?:cutoff|update)|training (?:data|cutoff))\b/iu,
  /\bI (?:cannot|can't|am unable to|don't have the ability to) (?:browse|access) (?:the internet|the web|real-time|external|live)/iu,
  /^\s*(?:>\s*)?(?:Certainly|Great question|Absolutely)[!,]/u,
  /^\s*(?:>\s*)?Sure!/u,
  /\bI hope this helps\b/iu,
  /\bLet me know if you(?:'d| would) like\b/iu,
  /\bWould you like me to\b/iu,
  /\bHere(?:'s| is) (?:a|an|the|your) (?:revised|updated|improved|polished|rewritten|refined|complete|full) (?:version|draft|text|document|README)\b/iu,
  /\bI(?:'ve| have) (?:updated|revised|rewritten|drafted) the (?:above|following|document|text)\b/iu,
];

/** Bracketed template slots that were never filled in. */
const PLACEHOLDERS: RegExp[] = [
  // A bare `[` (not a link, aside or reference) opening a slot such as
  // `[Insert X here]`, `[Your Name]`, `[Add link]`, `[Company Name]`, `[TBD here]`.
  /(?<![\w:\]])\[(?:insert|your|add|enter|placeholder|company name|[^\]\n]{0,40} here)\b[^\]\n]{0,60}\](?!\s*[([:])/iu,
  /\blorem ipsum\b/iu,
];

const TRACKING_PARAM = /[?&](utm_(?:source|medium|campaign|term|content))=/u;

// ---------- Rules ----------

export default {
  rules: {
    "no-llm-citation-residue": {
      description:
        "Prose must not contain citation-tool tokens left behind by a language model (oaicite, turn0search0, [cite: N], grok_card, ppl-ai-file-upload, ...)",
      severity: "error",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          for (const { line, text } of lines) {
            for (const { pattern, vendor } of CITATION_RESIDUE) {
              const m = pattern.exec(text);
              if (!m) continue;
              ctx.report.violation({
                message: `"${m[0]}" is a citation artifact from ${vendor}'s tooling, not text a person wrote.`,
                file,
                line,
                fix: "Delete the token. If the sentence needs a source, add a real link or footnote in its place.",
              });
              break;
            }
          }
        });
      },
    },

    "no-chat-residue": {
      description:
        "Prose must not carry chat-turn framing or capability disclaimers (Certainly!, I hope this helps, As an AI language model, ...)",
      severity: "error",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          for (const { line, text } of lines) {
            for (const pattern of CHAT_RESIDUE) {
              const m = pattern.exec(text);
              if (!m) continue;
              ctx.report.violation({
                message: `"${m[0].trim()}" addresses a chat user, not the reader of this document.`,
                file,
                line,
                fix: "Delete the sentence, or rewrite it as a statement about the subject rather than about the conversation.",
              });
              break;
            }
          }
        });
      },
    },

    "no-unfilled-placeholders": {
      description:
        "Prose must not ship bracketed template slots ([Insert X here], [Your Name], lorem ipsum)",
      severity: "warning",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          for (const { line, words } of lines) {
            for (const pattern of PLACEHOLDERS) {
              const m = pattern.exec(words);
              if (!m) continue;
              ctx.report.warning({
                message: `"${m[0]}" is an unfilled placeholder.`,
                file,
                line,
                fix: "Fill the slot with real content, or remove the sentence that needed it. If this file is a deliberate template, exclude its directory in the ADR's `files` globs.",
              });
              break;
            }
          }
        });
      },
    },

    "no-tracking-params-in-links": {
      description:
        "Links must not carry utm_* tracking parameters copied from a model's link output",
      severity: "error",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          for (const { line, text } of lines) {
            const m = TRACKING_PARAM.exec(text);
            if (!m) continue;
            ctx.report.violation({
              message: `Link carries the tracking parameter "${m[1]}", which identifies where the URL was copied from rather than what it points to.`,
              file,
              line,
              fix: "Remove the utm_* parameters (and the trailing `?` or `&` left behind) so the link is the canonical address.",
            });
          }
        });
      },
    },
  },
} satisfies RuleSet;
