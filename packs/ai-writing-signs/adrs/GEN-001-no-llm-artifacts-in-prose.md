---
id: GEN-001
title: No LLM Artifacts in Prose
domain: general
rules: true
files:
  - "**/*.md"
  - "**/*.mdx"
  - "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,java,kt,kts,go,rs,c,h,cpp,hpp,cc,cs,swift,scala,dart,php,groovy}"
  - "**/*.{py,rb,sh,bash,zsh,pl,r,yml,yaml,toml,tf,ps1,sql,lua}"
---

## Context

Text drafted with a language model and pasted into a repository often carries residue that no human types: citation tokens from the model's browsing tool (`oaicite`, `turn0search0`, `[cite: 3]`, `grok_card`, `ppl-ai-file-upload`), chat-turn framing (`Certainly! Here is`, `I hope this helps`, `As an AI language model`), unfilled template slots (`[Insert project name]`), and marketing tracking parameters copied from a model's link output (`?utm_source=chatgpt.com`). The same residue turns up in code comments, where a pasted explanation keeps its `I hope this helps!` sign-off or its `[cite: 2]` marker.

Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) treats these as the highest-confidence indicators because they are deterministic strings, not stylistic tendencies. A reader who spots one stops trusting the rest of the document, and a search engine that indexes `oaicite` in a README is indexing a paste error.

These strings are also the easiest class to check by machine: an exact-token match has essentially no false positives in ordinary prose, so a rule can block on them without slowing anyone down. This ADR is the strict tier of the pack; the structural and wording tiers ([GEN-002](./GEN-002-plain-document-structure.md), [GEN-003](./GEN-003-human-register-wording.md)) are advisory because they measure tendencies rather than tokens.

## Decision

Prose in the repository, whether a Markdown document or a comment in source code, MUST NOT contain machine artifacts left behind by a language model or its tools. Concretely:

- No citation-tool residue. Tokens emitted by ChatGPT (`contentReference`, `oaicite`, `oai_citation`, `turn0search0`-style markers, `attributableIndex`, `【4†source】` lenticular citations), Gemini (`[cite: 1]`, `[span_1](start_span)`), Grok (`grok_card`, `grok_render_citation_card_json`), Perplexity (`attached_file`, `ppl-ai-file-upload`), and the unattributed `:::writing` fence are removed before commit.
- No chat residue. Turn-opening and turn-closing phrases addressed to a chat user (`Certainly!`, `Great question`, `I hope this helps`, `Let me know if you'd like`, `Would you like me to`, `Feel free to reach out`) and capability disclaimers (`As an AI language model`, `as of my last knowledge update`, `I cannot browse the internet`) do not belong in a document.
- No unfilled placeholders. Bracketed template slots such as `[Insert description here]`, `[Your Name]`, or `[Add link]` are filled in or deleted.
- No tracking parameters in links. URLs carrying `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, or `utm_content` are stripped to the canonical address.

In Markdown, fenced code blocks, inline code spans, and HTML comments are exempt because they may legitimately document these tokens (this ADR does). In source files only comments are read: `//` and `/* */` in C-family languages, `#` in script languages and YAML/TOML, `--` in SQL and Lua. String literals, docstrings and heredocs are code, not prose, and are left alone. Files that declare `@generated` in their first lines are skipped entirely; nobody authored their prose.

## Do's and Don'ts

### Do

- Read the pasted text once before committing; artifacts cluster at the ends of sentences and paragraphs where citations and sign-offs were.
- Strip query strings down to what the target site needs; a link to `https://example.com/docs` does not need `?utm_source=chatgpt.com`.
- Replace a template slot with real content, or remove the sentence that needed it.
- Wrap a token in backticks when a document must mention it, for example when explaining what to look for.

### Don't

- Commit `oaicite`, `turn0search`, `[cite: N]`, `grok_card`, or `ppl-ai-file-upload` anywhere in prose.
- Leave `Certainly!`, `I hope this helps`, or `As an AI` in a README, changelog, ADR, or code comment.
- Ship `[Insert X here]` or `[Your Name]` in a published document.
- Suppress a finding from this ADR; the fix is a deletion and takes seconds.

## Consequences

### Positive

- Readers do not lose confidence in a document over a paste error.
- The check is deterministic, so it runs at `error` severity without slowing anyone down.
- Search indexes and package registries never see citation-tool tokens in a project's public text.

### Negative

- The token list tracks specific vendors' current tooling and needs updating as they change; a new artifact goes uncaught until someone adds it.
- A README that intentionally documents these tokens must put them in code spans, which is a small formatting constraint.
- The placeholder rule cannot tell a forgotten `[Your Name]` from a deliberate template file, so it runs at `warning`; template repositories may want to exclude their template directory in `files`.
- Comment extraction is line-based, not a parser. A marker counts as a comment when the code before it has balanced quotes, which handles `"http://x"` and `'#'` but not a string that spans lines or a comment marker inside a template literal. The usual failure direction is a missed comment rather than a false report against code, and the token lists are specific enough that a stray match inside a regex literal is unlikely.
