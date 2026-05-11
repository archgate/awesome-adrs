# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in an ADR rule published in this registry, please report it responsibly.

**Do NOT open a public issue.** Instead, email [security@archgate.dev](mailto:security@archgate.dev) with:

- The pack and ADR affected (e.g., `packs/security/adrs/SEC-001-no-secrets-in-code`)
- A description of the vulnerability
- Steps to reproduce (if applicable)
- The potential impact

We will acknowledge receipt within 48 hours and provide an initial assessment within 5 business days.

## Scope

This policy covers:

- **Rules (`.rules.ts` files)** — executable code that runs during `archgate check`. A malicious or buggy rule could produce false negatives (miss real issues) or exploit the rule sandbox.
- **ADR content (`.md` files)** — guidance that developers follow. Incorrect security advice (e.g., recommending an insecure pattern) is treated as a content bug, not a security vulnerability, unless it was intentionally deceptive.
- **Community links (`community/links.yaml`)** — external URLs. A link pointing to a compromised repository is a security concern.

## Supported Versions

Only the latest version of each curated pack on the `main` branch is supported. Older versions (accessible via git tags or history) are not actively monitored.

## Disclosure Policy

We follow coordinated disclosure. After a fix is merged, we will:

1. Credit the reporter (unless they prefer anonymity)
2. Publish a brief advisory in the affected pack's changelog
3. Notify users who imported the affected ADR via the `archgate adr update --check` mechanism (once available)
