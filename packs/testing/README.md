# testing

Testing conventions — colocated tests, no .only/.skip committed, descriptive names.

## Included ADRs

| ID       | Title                                  |
| -------- | -------------------------------------- |
| TEST-001 | Colocated Test Files                   |
| TEST-002 | No .only() or .skip() in Committed Tests |
| TEST-003 | Descriptive Test Names                 |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/testing
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/testing/adrs/TEST-002-no-only-skip
```
