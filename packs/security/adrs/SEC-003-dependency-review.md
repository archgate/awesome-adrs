---
id: SEC-003
title: Dependency Review
domain: architecture
rules: true
files: ["package.json"]
---

## Context

Every dependency added to a project expands its attack surface. Supply chain attacks — where a malicious actor compromises an npm package — are increasingly common. Packages with `postinstall` scripts can execute arbitrary code during installation. New dependencies should be reviewed for necessity, maintenance status, and security posture before being added.

## Decision

New dependencies must be reviewed before being added to the project. The review should consider whether the dependency is necessary, well-maintained, and free of known vulnerabilities. As an automated baseline, we flag packages with `postinstall` scripts since those can execute arbitrary code at install time. This is a warning-level rule.

- Review new dependencies for necessity — can the functionality be implemented in a few lines?
- Check the package's maintenance status, download count, and known vulnerabilities.
- Be cautious of packages with lifecycle scripts (`postinstall`, `preinstall`).

## Do's and Don'ts

### Do

- Review new dependencies in a dedicated PR comment.
- Check https://socket.dev or `npm audit` for known vulnerabilities.
- Prefer well-maintained packages with active security response.
- Pin dependency versions or use a lockfile.

### Don't

- Add dependencies without team review.
- Ignore `postinstall` scripts that download or execute external code.
- Add large frameworks when a small utility would suffice.
- Skip `npm audit` or equivalent checks in CI.

## Consequences

### Positive

- Reduces exposure to supply chain attacks.
- Keeps the dependency tree lean and maintainable.
- Team awareness of what third-party code runs in the project.

### Negative

- Adding a new dependency requires an extra review step.
- Some legitimate packages use `postinstall` for native compilation.
