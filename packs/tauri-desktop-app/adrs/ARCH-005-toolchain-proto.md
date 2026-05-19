---
id: ARCH-005
title: Toolchain Version Management with Proto
domain: architecture
rules: true
files: [".prototools"]
---

## Context

The project's technology stack is composed of multiple, independent tools, each with its own release cycle: `bun` (package manager and runtime), `node` (as a peer runtime for incompatible development tools), and `python` (for data-related tasks). This polyglot environment creates a significant risk of version mismatch. Without a standard, one developer might use `bun` v1.1.0 while another uses `bun` v1.2.0, leading to "it works on my machine" bugs, lockfile conflicts, and non-reproducible builds.

Manually managing versions (e.g., via README instructions) is not scalable. Using tool-specific version managers (like `nvm` or `pyenv`) creates configuration drift and requires developers to manage multiple tools. We need a single, unified, cross-platform tool to manage all toolchain versions from a single, version-controlled file.

## Decision

**Proto** (from moonrepo) is the official and mandatory tool for managing and synchronizing toolchain versions across all developers and CI/CD environments.

- A single `.prototools` file must be created at the root of the repository, defining the exact, pinned versions of all required development tools.
- This file must be committed to version control.
- All developers and CI/CD pipelines will use `proto` to read this file, automatically download the specified versions, and configure the environment `PATH`.
- Tool version updates are made by changing the version in `.prototools` and committing the change.

Example `.prototools` file:
```toml
bun = "1.2.0"
node = "22.0.0"
python = "3.12.0"
```

## Do's and Don'ts

### Do

- Install `proto` as the first prerequisite for all local development setup.
- Define all required tools for the project in the root `.prototools` file with exact versions.
- Commit the `.prototools` file to Git.
- Trust `proto` to manage the installation and shimming of your tools.
- Configure CI/CD pipelines to install `proto` and use it to set up the toolchain.
- Update a tool's version by changing it in `.prototools` and committing the change.

### Don't

- Install bun, node, python, or other tools manually (e.g., via brew, apt-get, or official installers). This will conflict with `proto`.
- Use other version managers like `nvm`, `asdf`, `pyenv`, or `virtualenv`. `proto` replaces all of them.
- Rely on a README file to list tool versions. The `.prototools` file is the single source of truth.

## Consequences

### Positive

- Every developer and every CI run uses the exact same tool versions, eliminating environment-based bugs.
- Upgrading a tool is a single-line change in a version-controlled file, which can be reviewed and rolled back.
- A new developer only needs to install `proto` and run one command to get the project's entire toolchain.
- Proto is designed to manage tools from many ecosystems (Node, Python, etc.) with a single interface.

### Negative

- Proto itself becomes a new, mandatory prerequisite that everyone must install.
- Some IDEs or scripts may not be "aware" of proto's shims and may need configuration to find the proto-managed binaries.
