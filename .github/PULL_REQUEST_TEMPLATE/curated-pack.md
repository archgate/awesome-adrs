## Curated Pack Submission

### Pack details

- **Pack name**: `packs/___`
- **Description**: ___

### Checklist

- [ ] Pack has `archgate-pack.yaml` with `name`, `version`, `description`, `maintainers`, and `tags`
- [ ] Pack has `README.md` listing all included ADRs
- [ ] Pack has `rules.d.ts` with ambient type definitions
- [ ] All ADRs are in `adrs/` and follow the frontmatter format (`id`, `title`, `domain`, `rules`, `files`)
- [ ] All ADRs have corresponding `.rules.ts` files
- [ ] Rule files start with `/// <reference path="../rules.d.ts" />`
- [ ] Rule files export a default object with `satisfies RuleSet`
- [ ] Rules compile without errors
- [ ] CI validation passes
