---
id: SEC-001
title: No Secrets in Code
domain: architecture
rules: true
files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

## Context

Hardcoded secrets, API keys, and tokens in source code are one of the most common security vulnerabilities. Once committed, secrets persist in git history even after removal. Automated scanners and attackers regularly scan public repositories for exposed credentials. A single leaked key can compromise entire systems.

## Decision

No secrets, API keys, passwords, or tokens may be hardcoded in source files. All sensitive values must come from environment variables or a secrets manager. Files like `.env.example` may contain placeholder values to document required variables.

- Use environment variables (`process.env.API_KEY`) for all secrets.
- Use a secrets manager for production credentials.
- Document required environment variables in `.env.example` with placeholder values.

## Do's and Don'ts

### Do

- Read secrets from environment variables: `process.env.DATABASE_URL`.
- Use `.env.example` files with placeholder values for documentation.
- Use a secrets manager (Vault, AWS Secrets Manager, etc.) in production.
- Add `.env` to `.gitignore`.

### Don't

- Hardcode API keys: `const API_KEY = "sk-live-abc123..."`.
- Hardcode passwords: `const password = "hunter2"`.
- Commit `.env` files with real values.
- Store secrets in configuration files checked into git.

## Consequences

### Positive

- Credentials cannot be leaked through source code or git history.
- Secrets can be rotated without code changes.
- Different environments use different credentials naturally.

### Negative

- Developers need local `.env` files or a secrets manager for development.
- Onboarding requires distributing secrets through a secure channel.
