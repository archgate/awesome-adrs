---
id: ARCH-003
title: Monorepo with Moonrepo
domain: architecture
rules: true
files: [".moon/**", "**/moon.yml"]
---

## Context

A Tauri desktop application is inherently composed of multiple discrete components: frontends, backends, data models, shared libraries, and potentially data jobs. Managing these components in separate repositories introduces significant friction related to dependency management, code sharing, and consistent tooling. A monorepo approach collocates all code, simplifies atomic changes across components, and streamlines dependency management.

However, a monorepo without a specialized tool becomes unmanageable at scale. Developers lose time running `build` and `test` commands for the entire repository, even for small changes, and CI/CD pipelines become slow. We require a tool that can understand the dependency graph between projects, run tasks only on affected projects, cache task outputs to avoid redundant work, orchestrate complex task pipelines efficiently, and scale with the codebase.

## Decision

**Moonrepo (moon)** is the official monorepo orchestrator, task runner, and build system for the project.

- All new projects will be scaffolded as a Moon-managed monorepo.
- All project-level tasks (e.g., `build`, `test`, `lint`, `dev`) must be defined within Moon's configuration (project-level `moon.yml` files).
- The dependency graph between projects must be explicitly declared in Moon's configuration.
- CI/CD pipelines will use `moon ci` and `moon run` commands, leveraging Moon's remote caching to accelerate builds.
- Moon's toolchain management (`.moon/toolchain.yml`) will be used to enforce consistent tool versions.

## Do's and Don'ts

### Do

- Define all project tasks in project-level `moon.yml` files or workspace-level `.moon/tasks/*.yml` files.
- Use `moon run <project>:<task>` or `moon check <project>` as the primary method for running tasks.
- Explicitly declare all `dependsOn` relationships between projects in their `moon.yml` configuration.
- Utilize Moon's toolchain (`.moon/toolchain.yml`) to pin versions of standard stack tools.
- Configure and enable remote caching for all CI/CD pipelines.
- Use `moon ci` as the primary command in CI environments to run all checks on affected projects.
- Rely on Moon's automatic dependency resolution rather than manually running prerequisite tasks.

### Don't

- Use other monorepo management tools like Lerna, Nx, or Turborepo.
- Bypass Moon by writing custom shell scripts for task orchestration.
- Use `package.json` scripts for any task logic. All tasks must be defined through Moon's configuration.
- Create implicit dependencies between projects without declaring them in `moon.yml`.
- Commit the Moon cache (`.moon/cache`) to source control.
- Manually run dependent tasks before running a task that depends on them.

## Consequences

### Positive

- Moon is written in Rust and designed for speed; its local and remote caching dramatically reduces build and test times.
- Intelligent task orchestration runs only tasks on projects affected by code changes, saving developer and CI time.
- A single interface (`moon run`, `moon check`) for all tasks simplifies developer experience and onboarding.
- First-class support for Bun, Python, and other tools makes it an ideal orchestrator for polyglot projects.
- Language-aware "platform" support automatically infers tasks and configurations, reducing boilerplate.

### Negative

- Moon is a newer and less-known tool compared to Nx or Turborepo. Developers must invest time to learn its concepts and YAML-based configuration.
- Moon's power comes from its explicit dependency graph, requiring diligence in declaring dependencies.
- The community and third-party tooling around Moon are not as extensive as more established competitors.
