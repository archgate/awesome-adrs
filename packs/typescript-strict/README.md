# typescript-strict

Strict TypeScript baseline — no any, explicit return types, strict tsconfig, no non-null assertions.

## Included ADRs

| ID     | Title                                   |
| ------ | --------------------------------------- |
| TS-001 | No Any Types                            |
| TS-002 | Explicit Return Types on Exported Functions |
| TS-003 | Strict tsconfig                         |
| TS-004 | No Non-Null Assertions                  |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/typescript-strict
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/typescript-strict/adrs/TS-001-no-any
```
