# Contributing to Awesome ADRs

There are two ways to contribute to the Archgate ADR Registry.

---

## Path 1: Curated Pack Submission

Curated packs live under `packs/` and are reviewed by Archgate maintainers. A curated pack earns a **"Curated"** badge once it passes all checks.

### How to submit

1. Fork this repository.
2. Create a directory under `packs/` with your pack name (e.g. `packs/my-pack/`).
3. Include the following files:

```
packs/my-pack/
  archgate-pack.yaml   # Pack metadata (required)
  README.md            # Pack overview and ADR listing (required)
  rules.d.ts           # Ambient type definitions for rules (required)
  adrs/
    ADR-001-*.md       # ADR documents (at least one)
    ADR-001-*.rules.ts # Corresponding rule file (at least one)
```

4. Open a pull request using the [curated pack PR template](.github/PULL_REQUEST_TEMPLATE/curated-pack.md).

### archgate-pack.yaml format

```yaml
name: my-pack
version: 0.1.0
description: Short description of what this pack covers.
maintainers:
  - github: your-github-username
tags:
  - language:typescript
  - concern:security
```

### ADR format

Each ADR uses YAML frontmatter with these fields:

```yaml
---
id: ADR-001
title: My Decision
domain: architecture
rules: true
files: ["**/*.ts"]
---
```

Followed by these sections: `## Context`, `## Decision`, `## Do's and Don'ts`, `## Consequences`.

### Rule file format

Every `.rules.ts` file must:

1. Start with `/// <reference path="../rules.d.ts" />`
2. Export a default object with `satisfies RuleSet`
3. Use only the `RuleContext` API: `glob()`, `grep()`, `grepFiles()`, `readFile()`, `readJSON()`, `report.violation()`, `report.warning()`, `report.info()`
4. Be async

### Requirements for the "Curated" badge

- All rules compile without errors.
- CI validation passes (YAML structure, rule file format).
- A maintainer has reviewed and approved the PR.

### Badge revocation and abandonment

- Badges may be revoked if a pack's rules break after upstream changes and the maintainer does not respond within 30 days.
- Packs abandoned for more than 6 months (no response to issues or PRs) may be archived.

---

## Path 2: Community Link Submission

Community links live in `community/links.yaml`. These are pointers to external repositories that contain archgate-compatible ADRs.

### How to submit

1. Fork this repository.
2. Add an entry to `community/links.yaml` following the schema below.
3. Open a pull request using the [community link PR template](.github/PULL_REQUEST_TEMPLATE/community-link.md).

### Entry schema

```yaml
- title: "My ADR Collection"
  url: "https://github.com/user/my-adrs"
  tags:
    - language:typescript
    - concern:testing
  description: "Short description of what this collection covers."
  submittedBy: your-github-username
  submittedAt: "2025-01-15"
```

### Requirements

The target repository must be archgate-compatible, meaning it has either:

- An `archgate-pack.yaml` at the root or pack directory, **or**
- ADR + rule file pairs that follow the archgate format.

### Curation criteria

The bar for community links is lower than curated packs:

- Is this a real, maintained repository?
- Is it archgate-compatible (has the right file structure)?
- Is it not spam?

Links that go dead are removed after 30 days of being unreachable. You can report a broken link using the [broken link issue template](.github/ISSUE_TEMPLATE/report-broken-link.yml).
