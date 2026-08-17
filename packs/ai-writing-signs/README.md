# ai-writing-signs

Keep Markdown prose free of the tells catalogued in Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing): leftover model artifacts, machine-shaped document structure, and AI-register wording.

The pack is tiered by confidence. Deterministic artifacts block; structure and wording are advisory and become blocking only under `archgate check --strict`.

## Included ADRs

| ID      | Title                     | Tier                                                                                                                                                                         |
| ------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GEN-001 | No LLM Artifacts in Prose | `error`: citation-tool tokens, chat residue, `utm_*` links; `warning`: unfilled placeholders                                                                                 |
| GEN-002 | Plain Document Structure  | `warning`/`info`: title-case headings, skipped levels, empty sections, emoji, bold density, `---` separators                                                                 |
| GEN-003 | Human-Register Wording    | `warning`/`info`: AI vocabulary, significance inflation, promotional language, participial tails, negative parallelism, formulaic phrases, em-dash and rule-of-three density |

## What it does not do

The rules read tokens and frequencies, not meaning. Vague attribution, superficial analysis, and unearned emphasis are on Wikipedia's list and still need a reviewer. Passing the check is not evidence of authorship, only the absence of the cheapest tells.

## Quick Start

Import the full pack:

```bash
archgate adr import packs/ai-writing-signs
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/ai-writing-signs/adrs/GEN-001-no-llm-artifacts-in-prose
```

Density thresholds and phrase lists live at the top of each `.rules.ts`; tune them in your imported copy if your house style differs.
