# security

Security baseline — no secrets in code, no eval, dependency review.

## Included ADRs

| ID      | Title                |
| ------- | -------------------- |
| SEC-001 | No Secrets in Code   |
| SEC-002 | No eval() or new Function() |
| SEC-003 | Dependency Review    |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/security
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/security/adrs/SEC-001-no-secrets-in-code
```
