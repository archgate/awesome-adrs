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

/** Generated files carry an `@generated` marker in their first lines; nobody authored their prose. */
function isGenerated(content: string): boolean {
  return /@generated\b/u.test(content.slice(0, 300));
}

async function scanMarkdown(
  ctx: RuleContext,
  visit: (file: string, lines: ProseLine[]) => void,
): Promise<void> {
  const files = ctx.scopedFiles.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  await Promise.all(
    files.map(async (file) => {
      let content: string;
      try {
        content = await ctx.readFile(file);
      } catch {
        return;
      }
      if (isGenerated(content)) return;
      visit(file, proseLines(content));
    }),
  );
}

/** Prose word count of blanked lines (tokens containing a letter or digit). */
function countWords(lines: ProseLine[]): number {
  let n = 0;
  for (const { words } of lines) {
    for (const token of words.split(/\s+/u)) {
      if (/[A-Za-z0-9]/u.test(token)) n++;
    }
  }
  return n;
}

// ---------- Structure helpers ----------

interface Heading {
  line: number;
  level: number;
  text: string;
}

const ATX_HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/u;

function parseHeading(l: ProseLine): Heading | null {
  const m = ATX_HEADING.exec(l.words);
  if (!m) return null;
  return { line: l.line, level: m[1].length, text: m[2] };
}

/** `---`, `***`, `___` (three or more, optionally spaced). */
const THEMATIC_BREAK = /^ {0,3}([-*_])(?: *\1){2,} *$/u;

/** Words that stay lowercase in title case; capitalised mid-heading they give it away. */
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "nor",
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "by",
  "with",
  "from",
  "as",
  "vs",
  "via",
  "per",
  "into",
  "onto",
  "over",
  "than",
  "is",
  "are",
]);

/** Ordinary capitalised word: not an acronym, not CamelCase, no digits. */
const PLAIN_CAPITALISED = /^[A-Z][a-z'’]+$/u;

/**
 * Title-case heuristic. Flags a heading when a stopword after the first word
 * is capitalised, or when four or more ordinary capitalised words follow the
 * first word with no lowercase content word among them.
 */
function looksTitleCase(text: string): string | null {
  const tokens = text
    .split(/\s+/u)
    .map((t) => t.replace(/^[^\w'’]+|[^\w'’]+$/gu, ""))
    .filter((t) => t.length > 0);
  if (tokens.length < 3) return null;

  let plainCapitalised = 0;
  let lowercaseContent = 0;
  for (const token of tokens.slice(1)) {
    const lower = token.toLowerCase();
    if (STOPWORDS.has(lower)) {
      if (token !== lower) return `"${token}" is capitalised mid-heading (title case)`;
      continue;
    }
    if (PLAIN_CAPITALISED.test(token)) plainCapitalised++;
    else if (/^[a-z]/u.test(token)) lowercaseContent++;
  }
  if (plainCapitalised >= 4 && lowercaseContent === 0)
    return "every word is capitalised (title case)";
  return null;
}

// Colour emoji, plus text-style pictographs forced to emoji by U+FE0F.
// Excludes ©, ®, ™ and similar symbols that are pictographic but not emoji.
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F/u;
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/u;
const BOLD_SPAN = /\*\*[^*\n]+?\*\*|__[^_\n]+?__/gu;
const BOLD_LED_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+(?:\*\*[^*\n]+?\*\*|__[^_\n]+?__)/u;

// Density thresholds (per 100 prose words) and minimum counts; tune per project.
const BOLD_PER_100_WORDS = 2;
const BOLD_MIN_SPANS = 8;
const BOLD_LED_RUN = 4;
const HR_BEFORE_HEADING_MIN = 2;

// ---------- Rules ----------

export default {
  rules: {
    "no-title-case-headings": {
      description: "Section headings (## and deeper) use sentence case, not Title Case",
      severity: "warning",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          for (const l of lines) {
            const h = parseHeading(l);
            if (!h || h.level < 2) continue;
            const reason = looksTitleCase(h.text);
            if (!reason) continue;
            ctx.report.warning({
              message: `Heading "${h.text}" ${reason}.`,
              file,
              line: h.line,
              fix: "Capitalise only the first word, proper nouns and acronyms.",
            });
          }
        });
      },
    },

    "no-skipped-heading-levels": {
      description: "Heading levels descend one step at a time (no # followed directly by ###)",
      severity: "warning",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          let previous: Heading | null = null;
          for (const l of lines) {
            const h = parseHeading(l);
            if (!h) continue;
            if (previous && h.level > previous.level + 1) {
              ctx.report.warning({
                message: `Heading level jumps from ${"#".repeat(previous.level)} to ${"#".repeat(h.level)} at "${h.text}".`,
                file,
                line: h.line,
                fix: `Use ${"#".repeat(previous.level + 1)} here, or add the intermediate heading.`,
              });
            }
            previous = h;
          }
        });
      },
    },

    "no-empty-sections": {
      description:
        "Every heading has content of its own before the next same-level or shallower heading",
      severity: "warning",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          let open: Heading | null = null;
          let hasBody = false;
          const flush = (next: Heading | null) => {
            if (open && !hasBody && (!next || next.level <= open.level)) {
              ctx.report.warning({
                message: `Section "${open.text}" has no content of its own.`,
                file,
                line: open.line,
                fix: "Write at least a sentence under the heading, or remove the heading.",
              });
            }
          };
          for (const l of lines) {
            const h = parseHeading(l);
            if (h) {
              flush(h);
              open = h;
              hasBody = false;
              continue;
            }
            if (l.code || l.text.trim() !== "") hasBody = true;
          }
          flush(null);
        });
      },
    },

    "no-emoji-decoration": {
      description:
        "Emoji are not used as structure: not in headings, not as bullet markers, not opening a line",
      severity: "warning",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          for (const l of lines) {
            const h = parseHeading(l);
            const target = h ? h.text : l.words.replace(LIST_ITEM, "");
            const lead = target.trimStart().slice(0, 4);
            const inHeading = h !== null && EMOJI.test(h.text);
            if (!inHeading && !EMOJI.test(lead)) continue;
            ctx.report.warning({
              message: h
                ? `Heading "${h.text}" contains an emoji.`
                : "Line opens with an emoji used as a marker.",
              file,
              line: l.line,
              fix: "Remove the emoji; let the heading or bullet carry the structure.",
            });
          }
        });
      },
    },

    "no-bold-overuse": {
      description:
        "Bold marks the occasional term; more than 2 bold spans per 100 words (min 8) is over-emphasis",
      severity: "warning",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          const words = countWords(lines);
          if (words === 0) return;
          let spans = 0;
          for (const l of lines) spans += (l.words.match(BOLD_SPAN) ?? []).length;
          const per100 = (spans / words) * 100;
          if (spans < BOLD_MIN_SPANS || per100 <= BOLD_PER_100_WORDS) return;
          ctx.report.warning({
            message: `${spans} bold spans in ${words} words (${per100.toFixed(1)} per 100 words; threshold ${BOLD_PER_100_WORDS}).`,
            file,
            line: 1,
            fix: "Un-bold labels and list-item leads; keep bold for the few terms a skimming reader must not miss.",
          });
        });
      },
    },

    "no-inline-header-lists": {
      description:
        "Four or more consecutive list items opening with a bold label form an inline-header list",
      severity: "info",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          let run = 0;
          let start = 0;
          const flush = () => {
            if (run >= BOLD_LED_RUN) {
              ctx.report.info({
                message: `${run} consecutive list items open with a bold label.`,
                file,
                line: start,
                fix: "Drop the bold leads, or turn the list into a table or definition list if every item really needs a label.",
              });
            }
            run = 0;
          };
          for (const l of lines) {
            if (BOLD_LED_ITEM.test(l.words)) {
              if (run === 0) start = l.line;
              run++;
            } else if (l.code || (l.text.trim() !== "" && !/^\s+\S/u.test(l.text))) {
              // A blank line or an indented continuation keeps the run alive.
              flush();
            }
          }
          flush();
        });
      },
    },

    "no-thematic-break-separators": {
      description:
        "Horizontal rules do not separate ordinary sections; two or more directly before a heading are reported",
      severity: "info",
      async check(ctx) {
        await scanMarkdown(ctx, (file, lines) => {
          const hits: number[] = [];
          for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            if (!THEMATIC_BREAK.test(l.text)) continue;
            // A `---` directly under a paragraph line is a setext heading, not a rule.
            const prev = lines[i - 1];
            if (prev && prev.text.trim() !== "" && l.text.trim().startsWith("-")) continue;
            let j = i + 1;
            while (j < lines.length && !lines[j].code && lines[j].text.trim() === "") j++;
            if (j < lines.length && parseHeading(lines[j])) hits.push(l.line);
          }
          if (hits.length < HR_BEFORE_HEADING_MIN) return;
          ctx.report.info({
            message: `${hits.length} horizontal rules sit directly before headings (lines ${hits.join(", ")}).`,
            file,
            line: hits[0],
            fix: "Delete the rules; the headings already separate the sections.",
          });
        });
      },
    },
  },
} satisfies RuleSet;
