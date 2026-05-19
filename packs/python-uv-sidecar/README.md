# python-uv-sidecar

Python data pipeline toolchain — UV package management, ty type checking, and sidecar data import jobs.

## Included ADRs

### Architecture

| ID        | Title                           |
| --------- | ------------------------------- |
| ARCH-001  | Python for Data-Related Tasks   |
| ARCH-002  | UV as Python Package Manager    |
| ARCH-003  | ty as Python Type Checker       |

### Data Layer

| ID        | Title                       |
| --------- | --------------------------- |
| DATA-001  | Sidecar Data Import Jobs    |

## Quick Start

Import the full pack:

```bash
archgate adr import packs/python-uv-sidecar
```

Cherry-pick a single ADR:

```bash
archgate adr import packs/python-uv-sidecar/adrs/ARCH-001-python-data-tasks
```
