## Summary

<!-- Briefly describe what this PR adds or changes -->

## Type

<!-- Check the one that applies -->

- [ ] Curated pack submission
- [ ] Community link submission
- [ ] Other (docs, CI, fix)

## Checklist (curated pack)

<!-- Skip if not a pack submission -->

- [ ] Pack has `archgate-pack.yaml` with `name`, `version`, `description`, `maintainers`, and `tags`
- [ ] Pack has `README.md` listing all included ADRs
- [ ] Pack has `rules.d.ts` with ambient type definitions
- [ ] All ADRs are in `adrs/` and follow the frontmatter format (`id`, `title`, `domain`, `rules`, `files`)
- [ ] All ADRs have corresponding `.rules.ts` files (if `rules: true`)
- [ ] Rule files start with `/// <reference path="../rules.d.ts" />`
- [ ] Rule files export a default object with `satisfies RuleSet`
- [ ] CI validation passes

## Checklist (community link)

<!-- Skip if not a link submission -->

- [ ] Entry in `community/links.yaml` follows the schema
- [ ] URL resolves and target is archgate-compatible
- [ ] Entry is not a duplicate
