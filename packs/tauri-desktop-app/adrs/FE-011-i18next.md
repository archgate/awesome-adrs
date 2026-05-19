---
id: FE-011
title: i18next for Internationalization
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Desktop applications often need to support multiple languages for their user interface. A standardized approach to internationalization (i18n) is needed to translate all UI strings, persist language preferences across sessions, and ensure type-safe translation keys. For Tauri-based desktop apps, translations should be bundled with the application rather than loaded remotely, ensuring offline availability and synchronous access.

The separation between Connected and Presentational components creates a natural boundary for i18n: Connected components handle translation lookups and pass translated strings to Presentational components as props, keeping Presentational components pure and testable without i18n dependencies.

## Decision

Use **i18next with react-i18next** as the internationalization library for the frontend.

- **Bundled translations:** JSON translation files are statically imported (no HTTP backend), ensuring synchronous availability suitable for desktop apps.
- **Type-safe translation keys:** Use `CustomTypeOptions` augmentation to provide type-safe `t()` keys.
- **Connected/Presentational pattern:** Connected components call `useTranslation()` and build typed `labels` objects that are passed to Presentational components via a `labels` prop.
- **No hardcoded strings:** Presentational components must not contain hardcoded user-facing strings in JSX; all text comes through the `labels` prop.
- **Single namespace:** All strings live in one `translation` namespace per language under `src/i18n/locales/{lang}/translation.json`.
- **Pluralization:** Use `_one`/`_other` key suffixes with the `count` parameter.
- **Interpolation:** Use `{{variable}}` syntax for dynamic values.
- **Presentational pluralization:** Pass pluralized strings as function props (e.g., `formatCount: (count: number) => string`) from Connected components.

## Do's and Don'ts

### Do

- Call `useTranslation()` only in Connected components.
- Pass all translated strings as typed `labels` props to Presentational components.
- Use factory functions for validation schemas that need translated messages.
- Use `i18n.t()` (direct import) for code outside React components (utilities, module-level).
- Use `_one`/`_other` key suffixes for pluralization.
- Add new translation keys to all language files simultaneously.
- Provide English literal strings in Storybook story `labels` args.

### Don't

- Call `useTranslation()` in Presentational components.
- Hardcode user-facing strings in Presentational component JSX.
- Use `t()` at module scope in non-factory contexts (translations may not be initialized).
- Create multiple namespaces; use the single `translation` namespace.
- Use HTTP backends for loading translations; bundle them statically.
- Introduce alternative i18n libraries (react-intl, lingui, etc.).

## Consequences

### Positive

- Full type safety for translation keys via TypeScript augmentation.
- Synchronous initialization with no loading states needed for translations.
- Clean separation: translations flow through the Connected/Presentational boundary via typed `labels` props.
- Persistent language preference via localStorage survives app restarts.
- Bundled translations work reliably offline in desktop environments.

### Negative

- Connected components become more verbose, building complete `labels` objects for each Presentational child.
- All language files must be kept in sync when adding new translation keys.
- Factory function overhead for schemas and module-level constants that reference translations.
