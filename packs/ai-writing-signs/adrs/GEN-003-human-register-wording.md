---
id: GEN-003
title: Human-Register Wording
domain: general
rules: true
files: ["**/*.md", "**/*.mdx"]
---

## Context

Language models have a recognisable register. Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) catalogues it: a vocabulary that inflates significance (`testament`, `pivotal`, `underscores`, `evolving landscape`), copula avoidance (`serves as` for `is`), promotional adjectives (`vibrant`, `robust`, `seamless`), sentences that end in a participial clause explaining why the previous clause matters (`..., highlighting the importance of ...`), negative parallelisms (`not just X, but Y`), formulaic openers and closers (`It is worth noting`, `In conclusion`), heavy em-dash use, and lists of three.

None of these is forbidden English. Humans write `crucial` and use em dashes. The tell is frequency and clustering, which is why this tier is advisory: every rule runs at `warning` or `info`, and a project opts into blocking with `archgate check --strict`. What the rules buy is a second reader that never gets tired: they point at the sentence, name the pattern, and suggest the plainer form, so the author can decide.

The lists follow Wikipedia's page closely rather than every "AI word" list on the internet, because that page is maintained against real detections and prunes words that turned out to be ordinary. Words that are ordinary in software documentation (`robust`, `leverage`, `key`) are deliberately left out even where Wikipedia mentions them, since a documentation pack that flags `robust` on every page trains people to ignore it.

## Decision

Markdown prose SHOULD read in a plain human register. Specifically:

- Prefer the plain word. `use` over `utilize` and `leverage`, `is` over `serves as` and `stands as`, `shows` over `showcases`, `look at` over `delve into`. The companion rule lists the vocabulary it flags; each entry names the plainer alternative.
- State facts, not significance. Do not tell the reader something `plays a pivotal role`, `is a testament to`, `underscores the importance of`, `marks a key turning point`, or `sets the stage for`; say what it does and let the reader weigh it.
- No promotional adjectives. `vibrant`, `groundbreaking`, `renowned`, `nestled`, `rich tapestry`, `diverse array`, `boasts a` describe brochures, not software.
- No participial tails. A sentence does not end in `, highlighting ...`, `, underscoring ...`, `, showcasing ...`, `, ensuring ...`, `, reflecting ...`. If the second clause is true, it deserves its own sentence; usually it is padding.
- No negative parallelism as a rhythm. `Not just X, but Y`, `It's not X, it's Y`, `no X, no Y, just Z` are flagged; used once for real contrast they can stay, and the finding is advisory.
- No formulaic openers and closers. `It is worth noting that`, `It is important to note`, `In conclusion`, `In summary`, `Overall,`, `Ultimately,`, `In today's fast-paced world`, `Let's dive in`.
- Em dashes are occasional. A document with more than 1.5 em dashes per hundred words (and at least four in total) is reported. Spaced en dashes and double hyphens count.
- Lists of three are occasional. More than 0.75 `A, B, and C` triads per hundred words (and at least three) is reported at `info`.

Thresholds were calibrated on the archgate repositories: hand-edited guide pages sit at 0.3 to 1.5 em dashes and under 0.5 triads per hundred words; model-drafted ADRs run 2 to 4.4 em dashes. Numbers live in the companion rules file and are meant to be tuned per project.

## Do's and Don'ts

### Do

- Say `is`, `has`, `uses`, `shows`; the plain verb is almost always available.
- Cut the clause that tells the reader how to feel about the previous clause.
- Split a sentence with an em dash into two sentences, or use a comma or parentheses.
- Read a flagged sentence aloud; if it sounds like a press release, rewrite it.
- Keep a finding when the flagged phrase is quoted from a source (blockquotes are skipped by the rules) or is a proper name.

### Don't

- Write `delve`, `tapestry`, `testament`, `pivotal`, `meticulous`, `intricate`, `showcase`, `foster`, `garner`, `bolster`, `underscore` (as a verb) in prose without a reason.
- End a sentence with `, highlighting the importance of ...` or `, ensuring that ...`.
- Build paragraphs out of `not only ... but also` and `It's not about X, it's about Y`.
- Open with `It's worth noting that` or close with `In conclusion`.
- Reach for an em dash where a full stop would do.
- Suppress a finding without reading the sentence first; the rule is a prompt to reread, not a verdict.

## Consequences

### Positive

- Reviewers get a consistent second opinion on register without reading every document themselves.
- Each finding names the plainer form, so fixing it is a small edit rather than a rewrite.
- Because the lists are short and Wikipedia-derived, false positives are rare enough that people keep reading the findings.

### Negative

- Vocabulary lists cannot see intent: `pivotal` in a sentence about a pivot table, `landscape` in a mapping project, `foster` as a surname will all be flagged. Suppress those with a reason, or trim the list in the imported copy of the rules file.
- The rules read register, not meaning. Vague attribution (`experts argue`), superficial analysis, and unearned emphasis on broader significance are on Wikipedia's list and are not detected here; a reviewer still has to read.
- Prose that avoids every listed pattern can still read as generated. Passing the check is not evidence of authorship, only the absence of the cheapest tells.
- Markdown offers no comment-style suppression today (`archgate-ignore` needs a `//` or `#` line, which renders visibly), so a project with many deliberate exceptions should lower severities in its copy rather than annotate documents.
