---
id: GEN-002
title: Plain Document Structure
domain: general
rules: true
files: ["**/*.md", "**/*.mdx"]
---

## Context

Language models format documents the way a chat window rewards: every section gets a Title Case heading, list items open with a bold label, emoji mark each bullet, horizontal rules separate every section, and heading levels are chosen for visual weight rather than hierarchy. Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) lists these under "style and formatting", and reviewers recognise the shape before they read a word.

None of these choices is wrong on its own. A single bold label is fine; a table of contents with emoji is a taste. The signal is density and uniformity: a document where every list item, heading and section break carries the same decoration reads as generated, whatever its origin. That density is measurable, so a rule can flag it while leaving individual choices alone.

This tier is advisory. Each rule runs at `warning` or `info`, so a project decides through `archgate check --strict` whether formatting shape blocks a merge.

## Decision

Markdown documents SHOULD keep a plain, hierarchical structure:

- Section headings (`##` and deeper) use sentence case. Only the first word, proper nouns, and acronyms are capitalised. The document title (`#` or the frontmatter `title`) is exempt because title case is conventional there.
- Heading levels descend one step at a time. A `#` may be followed by `##`, not by `###`.
- Every heading introduces some content of its own before the next heading at the same or a shallower level. A heading whose only content is a subheading is fine (an ADR's `Consequences` holding `Positive` and `Negative`); a heading followed by nothing, or by a sibling heading, is an empty section.
- Emoji are not used as structure: not in headings, not as bullet markers, not as the first character of a line.
- Bold marks the occasional term, not a rhythm. A document with more than two bold spans per hundred words (and at least eight in total) is over-emphasised. Four or more consecutive list items that each open with a bold label are reported at `info` as the "inline-header list" pattern.
- Horizontal rules do not separate ordinary sections; headings already do that. Two or more rules each directly followed by a heading are reported.

Files that declare `@generated` in their first lines are skipped entirely; nobody authored their structure.

The thresholds come from measuring Markdown in the archgate repositories: hand-edited guide pages sit at 0 to 2 bold spans per hundred words, while model-drafted ADRs run 2 to 5 with dozens of bold-led list items. Numbers are in the companion rules file and are meant to be tuned per project, not treated as truth.

## Do's and Don'ts

### Do

- Write `## Getting started`, not `## Getting Started`.
- Nest headings one level at a time and give each one at least a sentence of its own.
- Use plain bullets; if every item in a list needs a label, it probably wants to be a table or a definition list.
- Reserve bold for a term the reader must not miss on a skim.
- Let headings separate sections; delete decorative `---` lines between them.

### Don't

- Capitalise `And`, `Of`, `The`, `With` in the middle of a section heading.
- Jump from `#` to `###` because the intermediate level "looked too big".
- Leave a heading with no body, or a heading whose only content is a sibling heading.
- Open bullets with an emoji, or put an emoji in a heading.
- Bold the first phrase of every list item and every paragraph.
- Put a `---` between every section.

## Consequences

### Positive

- Documents look like the rest of the repository rather than like a chat transcript pasted in.
- Structural checks (heading levels, empty sections) double as ordinary Markdown hygiene that renderers and accessibility tools reward.
- Density thresholds tolerate individual bold terms and the odd emoji, so authors are not forced into an austere style.

### Negative

- Title-case detection is a heuristic on capitalised stopwords and long runs of capitalised words; headings dense in proper nouns can trip it and headings in Chicago-style title case (lowercase stopwords, two capitalised content words) can pass. It runs at `warning` for that reason.
- The bold and horizontal-rule thresholds are calibrated on one organisation's documents; a project whose house style is bold-heavy should raise the numbers in its imported copy of the rules file.
- The empty-section rule flags freshly generated ADR templates whose sections are not yet filled in, which is the intended nudge but can be noisy on a draft branch.
