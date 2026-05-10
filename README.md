# Awesome ADRs — The Archgate ADR Registry

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A curated collection of Architecture Decision Records you can import into any project via [`archgate adr import`](https://github.com/archgate/archgate).

## Directory Layout

```
packs/             # Curated packs — reviewed by Archgate maintainers
  typescript-strict/
  testing/
  security/
  ...
community/         # Community links — pointers to external ADR repos
  links.yaml
```

## Quick Start

Import an entire curated pack:

```bash
archgate adr import packs/typescript-strict
```

Cherry-pick a single ADR and its rule:

```bash
archgate adr import packs/security/adrs/SEC-001-no-secrets-in-code
```

Browse and build a custom set in the web builder (coming soon): **[adrs.archgate.dev](https://adrs.archgate.dev)**

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to:

- Submit a **curated pack** (reviewed by maintainers, earns a "Curated" badge)
- Add a **community link** (pointer to an external archgate-compatible ADR repo)

## License

This project is licensed under the Apache License 2.0 — see [LICENSE](LICENSE) for details.
