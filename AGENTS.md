# AGENTS.md

Guidance for AI agents working in the **Awesome ADRs** (Archgate ADR Registry) repository.

## What this repo is

A curated registry of Architecture Decision Record (ADR) **packs** under `packs/` and community link metadata under `community/`. There is no application server, `package.json`, or Docker stack in-tree. Development means editing Markdown ADRs, `archgate-pack.yaml`, and TypeScript `.rules.ts` rule files, then validating with the same checks as CI.

## Cursor Cloud specific instructions

### Toolchain

- **Bun** is required for CI-parity validation (`bun -e` for YAML, `bunx` for oxlint/oxfmt). After VM startup, ensure `~/.bun/bin` is on `PATH` (the Bun installer adds this to `~/.bashrc`).
- **archgate CLI** (optional but recommended for end-to-end demos) installs globally: `bun install -g archgate`. Registry imports use GitHub paths like `archgate/awesome-adrs/packs/<pack-name>`, not local filesystem paths.

### Validate packs (local, all packs)

CI in `.github/workflows/pull-request.yml` only validates **packs changed in the PR**. To validate everything locally:

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd /workspace

# Structure + YAML (mirrors CI "Validate pack structure")
for pack in packs/*/; do
  pack="${pack%/}"
  bun -e "
    import { readFileSync } from 'fs';
    import { parse } from 'yaml';
    const doc = parse(readFileSync('$pack/archgate-pack.yaml', 'utf8'));
    if (!doc.name || !doc.version || !doc.description) throw new Error('invalid pack yaml');
  "
  find "$pack" -name '*.rules.ts' -print0 | while IFS= read -r -d '' f; do
    head -1 "$f" | grep -q '/// <reference path=' || exit 1
    grep -q 'satisfies RuleSet' "$f" || exit 1
  done
done

# Lint + format (all rule files)
rules_files=$(find packs -name '*.rules.ts')
bunx oxlint --deny-warnings --ignore-pattern='*.d.ts' --allow triple-slash-reference $rules_files
bunx oxfmt --check $rules_files
```

### Validate changed packs only (CI-equivalent)

```bash
packs=$(git diff --name-only origin/main...HEAD -- 'packs/' \
  | grep -v '.gitkeep' | cut -d'/' -f1-2 | sort -u)
# Then run the per-pack steps from pull-request.yml on $packs only
```

### Community links

`community/links.yaml` schema is validated in CI when that file changes. Empty `links: []` is valid.

### Consumer hello-world (archgate)

```bash
mkdir -p /tmp/archgate-demo && cd /tmp/archgate-demo
archgate init
archgate adr import archgate/awesome-adrs/packs/typescript-strict --yes
archgate adr list
archgate check path/to/your.ts
```

### Gotchas

- `archgate adr import packs/typescript-strict` from the README assumes running inside a clone of this repo **or** the `archgate/awesome-adrs/...` registry path; a bare local path like `/workspace/packs/...` is not supported.
- Full-repo `oxlint` / `oxfmt --check` may report issues on `main` that CI never runs (CI skips when no pack files changed). Use changed-pack validation when matching PR checks.
- No pre-commit hooks or root lint config; GitHub Actions is the source of truth for automated checks.
