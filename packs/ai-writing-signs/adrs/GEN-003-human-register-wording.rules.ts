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

/** Quoted material is someone else's register; wording rules skip it. */
const BLOCKQUOTE = /^\s*>/u;

// ---------- Patterns ----------

interface Phrase {
  pattern: RegExp;
  /** The plainer form, or why the phrase reads as generated. */
  plain: string;
}

/** Register vocabulary: single words that mark AI-drafted prose. */
const VOCABULARY: Phrase[] = [
  { pattern: /\bdelv(?:e|es|ed|ing)\b/iu, plain: "look at, examine, cover" },
  { pattern: /\btapestry\b/iu, plain: "drop the metaphor" },
  { pattern: /\btestament\b/iu, plain: "state the fact it is meant to prove" },
  { pattern: /\bpivotal\b/iu, plain: "important, or say why it matters" },
  { pattern: /\bmeticulous(?:ly)?\b/iu, plain: "careful, carefully" },
  { pattern: /\bintrica(?:te|cies|cy)\b/iu, plain: "detailed, complex" },
  { pattern: /\bshowcas(?:e|es|ed|ing)\b/iu, plain: "show" },
  { pattern: /\bfoster(?:s|ed|ing)?\b/iu, plain: "encourage, support" },
  { pattern: /\bgarner(?:s|ed|ing)?\b/iu, plain: "get, attract" },
  { pattern: /\bbolster(?:s|ed|ing)?\b/iu, plain: "support, strengthen" },
  {
    // Verb only; "hyphens or underscores" is the character.
    pattern:
      /\bunderscor(?:e|es|ed|ing) (?:the|its|their|his|her|our|how|that|this|a|an|why|what)\b/iu,
    plain: "show, stress",
  },
  { pattern: /\butili[sz](?:e|es|ed|ing)\b/iu, plain: "use" },
  { pattern: /\binterplay\b/iu, plain: "interaction" },
  { pattern: /\bmultifaceted\b/iu, plain: "say which facets" },
  { pattern: /\bparadigm shift\b/iu, plain: "say what changed" },
  { pattern: /\benduring\b/iu, plain: "lasting, or drop" },
  {
    pattern:
      /\b(?:ever-)?(?:evolving|changing|shifting|broader|competitive|digital|modern|current) landscape\b/iu,
    plain: "field, area, or say what changed",
  },
];

/** Phrases that assert significance instead of stating a fact. */
const SIGNIFICANCE_INFLATION: Phrase[] = [
  {
    pattern:
      /\b(?:is|are|was|were|stands? as|serves? as|remains?) a (?:\w+ )?(?:testament|reminder) (?:to|of)\b/iu,
    plain: "state the fact directly",
  },
  {
    pattern:
      /\bplay(?:s|ed|ing)? an? (?:pivotal|crucial|vital|key|significant|central|critical|essential|important) role\b/iu,
    plain: "name the function it performs",
  },
  {
    pattern: /\b(?:key|major|significant|pivotal|important|critical) turning point\b/iu,
    plain: "say what changed",
  },
  { pattern: /\bset(?:s|ting)? the stage for\b/iu, plain: "leads to, enables" },
  { pattern: /\bpav(?:e|es|ed|ing) the way for\b/iu, plain: "enables, allows" },
  { pattern: /\bindelible mark\b/iu, plain: "say what it changed" },
  { pattern: /\bdeeply rooted in\b/iu, plain: "based on, comes from" },
  {
    pattern: /\breflect(?:s|ed|ing)? (?:a |the )?broader\b/iu,
    plain: "say the specific point",
  },
  {
    pattern: /\bsymboli[sz](?:es|ed|ing) (?:its|the|their) (?:ongoing|enduring|continued)\b/iu,
    plain: "drop the symbolism",
  },
  {
    pattern: /\b(?:shap|mark)(?:es|ed|ing) the (?:future|course|trajectory) of\b/iu,
    plain: "say the effect",
  },
  { pattern: /\bfocal point\b/iu, plain: "centre, main part" },
  {
    pattern: /\b(?:serves|stands|functions|operates) as (?:a|an|the)\b/iu,
    plain: "is",
  },
  { pattern: /\bvaluable insights?\b/iu, plain: "say what was learned" },
  {
    pattern:
      /\balign(?:s|ed|ing)? with (?:the |our |its |their )?(?:values|vision|mission|goals|principles)\b/iu,
    plain: "say the concrete match",
  },
  {
    pattern: /\bresonat(?:e|es|ed|ing) with\b/iu,
    plain: "appeals to, matches",
  },
  {
    pattern:
      /\bnavigat(?:e|es|ed|ing) the (?:complexities|complexity|intricacies|challenges) of\b/iu,
    plain: "handle, deal with",
  },
];

/** Brochure adjectives and verbs. */
const PROMOTIONAL: Phrase[] = [
  { pattern: /\bvibrant\b/iu, plain: "describe it concretely" },
  { pattern: /\bgroundbreaking\b/iu, plain: "say what is new" },
  { pattern: /\brenowned\b/iu, plain: "well-known, or cite it" },
  { pattern: /\bnestled\b/iu, plain: "located, in" },
  { pattern: /\bbreathtaking\b/iu, plain: "describe it concretely" },
  { pattern: /\bworld-class\b/iu, plain: "say the measure" },
  { pattern: /\bcutting-edge\b/iu, plain: "recent, or name it" },
  { pattern: /\bgame-chang(?:er|ing)\b/iu, plain: "say what changed" },
  { pattern: /\bseamless(?:ly)?\b/iu, plain: "say what step is not needed" },
  { pattern: /\bmust-(?:have|visit|see|read)\b/iu, plain: "recommend plainly" },
  { pattern: /\bdiverse (?:array|range) of\b/iu, plain: "many, several" },
  {
    pattern: /\brich (?:tapestry|history|heritage|cultural)\b/iu,
    plain: "long, varied",
  },
  { pattern: /\bin the heart of\b/iu, plain: "in, in central" },
  { pattern: /\bboasts? (?:a|an|the|over|more than|\d)/iu, plain: "has" },
  {
    pattern: /\bcommitment to (?:excellence|quality|innovation)\b/iu,
    plain: "say what is done",
  },
  {
    pattern: /\belevat(?:e|es|ed|ing) (?:your|the|their)\b/iu,
    plain: "improve",
  },
  {
    pattern: /\bempower(?:s|ed|ing)? (?:users|developers|teams|you|your|people)\b/iu,
    plain: "lets, enables",
  },
  { pattern: /\bunparalleled\b/iu, plain: "say the measure" },
  { pattern: /\brevolutioni[sz](?:e|es|ed|ing)\b/iu, plain: "changes" },
  { pattern: /\btransformative\b/iu, plain: "say what it changes" },
  { pattern: /\bholistic\b/iu, plain: "whole, complete" },
  { pattern: /\bsynerg(?:y|ies|istic)\b/iu, plain: "say what combines" },
  { pattern: /\ba (?:myriad|plethora) of\b|\bmyriad of\b/iu, plain: "many" },
];

/** A trailing participial clause that explains why the sentence mattered. */
const PARTICIPIAL_TAIL =
  /,\s+(?:highlighting|underscoring|emphasi[sz]ing|reflecting|symboli[sz]ing|showcasing|demonstrating|solidifying|cementing|ensuring|fostering|reinforcing|signal(?:l)?ing|contributing to|paving the way for)\s+(?:the|its|their|a|an|that|how|both)\b/iu;

const NEGATIVE_PARALLELISM: Phrase[] = [
  {
    pattern:
      /\bit(?:['’]s| is) not (?:just |only |merely |simply |about )?[^.;:!?\n]{1,60}?[,;—–-]+\s*it(?:['’]s| is)\b/iu,
    plain: "It's not X, it's Y",
  },
  {
    pattern:
      /\bnot (?:just|only|merely|simply) [^.;:!?\n]{1,60}?[,;—–-]* but(?: also| rather| instead)?\b/iu,
    plain: "not just X, but Y",
  },
  {
    pattern: /\bno [^.;:!?\n]{1,30}?, no [^.;:!?\n]{1,30}?, (?:just|only|simply) \w/iu,
    plain: "no X, no Y, just Z",
  },
  {
    pattern: /\bmore than (?:just|merely|simply) (?:a|an)\b/iu,
    plain: "more than just a",
  },
];

const FORMULAIC: Phrase[] = [
  {
    pattern:
      /\bit(?:['’]s| is) (?:worth|important|essential|crucial|vital) to (?:note|remember|mention|highlight|emphasi[sz]e|understand)\b/iu,
    plain: "delete the frame; state the point",
  },
  {
    pattern: /\bit(?:['’]s| is) worth (?:noting|mentioning|remembering)\b/iu,
    plain: "delete the frame; state the point",
  },
  {
    pattern:
      /(?:^|[.!?]\s+)(?:In conclusion|In summary|To summari[sz]e|To sum up|Overall|Ultimately|All in all|At the end of the day|That being said|With that said|At its core|In essence)\b/u,
    plain: "delete the opener; the paragraph should stand without it",
  },
  {
    pattern:
      /\bin today['’]s (?:fast-paced|digital|ever-changing|rapidly evolving|competitive|modern|interconnected)\b/iu,
    plain: "delete; every day is today",
  },
  {
    pattern:
      /\bin the (?:ever-)?(?:changing|evolving) (?:world|landscape|field|nature) of\b|\bin an era (?:of|where)\b|\bin the (?:realm|world|age) of\b/iu,
    plain: "name the subject directly",
  },
  {
    pattern:
      /\b(?:let['’]s|we(?:['’]ll| will)) (?:dive|delve|jump) (?:in|into|deeper|right in)\b|\bdive (?:deep|deeper) into\b|\bwithout further ado\b/iu,
    plain: "start with the content",
  },
  {
    pattern: /\bwhether you['’]re (?:a|an|new|looking|building)\b/iu,
    plain: "address the reader you have",
  },
  {
    pattern:
      /\bharness(?:es|ing)? the power of\b|\bunlock(?:s|ing)? (?:the )?(?:full )?(?:potential|power|value) of\b/iu,
    plain: "use, enables",
  },
  {
    pattern: /\bembark(?:s|ed|ing)? on (?:a|an|the|this|your)\b/iu,
    plain: "start",
  },
];

/** Em dash, spaced en dash, or spaced double hyphen. */
const EM_DASH = /—|\s–\s|\s--\s/gu;
/** `A, B, and C` with single-word items. */
const TRIAD = /\b[\w'’-]+, [\w'’-]+,? (?:and|or) [\w'’-]+\b/gu;

// Density thresholds (per 100 prose words) and minimum counts; tune per project.
const EM_DASH_PER_100_WORDS = 1.5;
const EM_DASH_MIN = 4;
const TRIAD_PER_100_WORDS = 0.75;
const TRIAD_MIN = 3;

// ---------- Rule factory for phrase lists ----------

function phraseRule(
  description: string,
  phrases: Phrase[],
  severity: "warning" | "info",
  fixPrefix: string,
): RuleConfig {
  return {
    description,
    severity,
    async check(ctx) {
      await scanProse(ctx, (file, lines) => {
        for (const { line, words } of lines) {
          if (BLOCKQUOTE.test(words)) continue;
          for (const { pattern, plain } of phrases) {
            const m = pattern.exec(words);
            if (!m) continue;
            const detail = {
              message: `"${m[0].trim()}" reads as generated register.`,
              file,
              line,
              fix: `${fixPrefix}: ${plain}.`,
            };
            if (severity === "warning") ctx.report.warning(detail);
            else ctx.report.info(detail);
            break;
          }
        }
      });
    },
  };
}

// ---------- Rules ----------

export default {
  rules: {
    "no-ai-vocabulary": phraseRule(
      "Prose avoids the vocabulary that marks AI-drafted text (delve, tapestry, testament, pivotal, showcase, foster, ...)",
      VOCABULARY,
      "warning",
      "Prefer the plain word",
    ),

    "no-significance-inflation": phraseRule(
      "Prose states facts rather than asserting significance (plays a pivotal role, is a testament to, sets the stage for, serves as a ...)",
      SIGNIFICANCE_INFLATION,
      "warning",
      "Say what it does",
    ),

    "no-promotional-language": phraseRule(
      "Prose avoids brochure language (vibrant, groundbreaking, seamless, boasts a, diverse array of, ...)",
      PROMOTIONAL,
      "warning",
      "Describe, do not sell",
    ),

    "no-negative-parallelism": phraseRule(
      "Prose does not lean on negative parallelism (not just X but Y; it's not X, it's Y; no X, no Y, just Z)",
      NEGATIVE_PARALLELISM,
      "warning",
      "State the positive claim on its own",
    ),

    "no-formulaic-phrases": phraseRule(
      "Prose avoids formulaic openers and closers (It is worth noting, In conclusion, In today's fast-paced world, Let's dive in, ...)",
      FORMULAIC,
      "warning",
      "Rewrite",
    ),

    "no-participial-tails": {
      description:
        "Sentences do not end in a participial clause explaining why the previous clause matters (..., highlighting the importance of ...)",
      severity: "warning",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          for (const { line, words } of lines) {
            if (BLOCKQUOTE.test(words)) continue;
            const m = PARTICIPIAL_TAIL.exec(words);
            if (!m) continue;
            ctx.report.warning({
              message: `"${m[0].trim()}" tacks an evaluative clause onto the sentence.`,
              file,
              line,
              fix: "Delete the clause, or make it its own sentence with a subject and a verb.",
            });
          }
        });
      },
    },

    "em-dash-density": {
      description: "Em dashes are occasional: more than 1.5 per 100 words (min 4) is reported",
      severity: "warning",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          const words = countWords(lines);
          if (words === 0) return;
          let count = 0;
          let firstLine = 0;
          for (const l of lines) {
            if (BLOCKQUOTE.test(l.words)) continue;
            const n = (l.words.match(EM_DASH) ?? []).length;
            if (n > 0 && firstLine === 0) firstLine = l.line;
            count += n;
          }
          const per100 = (count / words) * 100;
          if (count < EM_DASH_MIN || per100 <= EM_DASH_PER_100_WORDS) return;
          ctx.report.warning({
            message: `${count} em dashes in ${words} words (${per100.toFixed(1)} per 100 words; threshold ${EM_DASH_PER_100_WORDS}).`,
            file,
            line: firstLine || 1,
            fix: "Split dashed sentences into two, or use commas, colons or parentheses; keep the dash for the one place it earns its keep.",
          });
        });
      },
    },

    "rule-of-three-density": {
      description:
        "Lists of three (A, B, and C) are occasional: more than 0.75 per 100 words (min 3) is reported",
      severity: "info",
      async check(ctx) {
        await scanProse(ctx, (file, lines) => {
          const words = countWords(lines);
          if (words === 0) return;
          let count = 0;
          let firstLine = 0;
          for (const l of lines) {
            if (BLOCKQUOTE.test(l.words)) continue;
            const n = (l.words.match(TRIAD) ?? []).length;
            if (n > 0 && firstLine === 0) firstLine = l.line;
            count += n;
          }
          const per100 = (count / words) * 100;
          if (count < TRIAD_MIN || per100 <= TRIAD_PER_100_WORDS) return;
          ctx.report.info({
            message: `${count} three-item lists in ${words} words (${per100.toFixed(2)} per 100 words; threshold ${TRIAD_PER_100_WORDS}).`,
            file,
            line: firstLine || 1,
            fix: "Vary the rhythm: two items, four items, or a plain sentence where the third item was filler.",
          });
        });
      },
    },
  },
} satisfies RuleSet;
