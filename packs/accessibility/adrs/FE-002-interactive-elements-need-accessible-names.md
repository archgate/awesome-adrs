---
id: FE-002
title: Interactive Elements Need Accessible Names
domain: frontend
rules: true
files: ["**/*.tsx", "**/*.jsx"]
---

## Context

Interactive elements — buttons, links, and form controls — without accessible names are unusable for screen reader users. A button with only an icon and no text content, `aria-label`, or `aria-labelledby` is announced as simply "button", giving no indication of its purpose. This violates WCAG 2.1 Level A (Success Criterion 4.1.2) and creates a poor experience for anyone using assistive technology.

## Decision

All interactive elements must have an accessible name. This can come from text content, `aria-label`, or `aria-labelledby`. Icon-only buttons must have an `aria-label` describing their action. Empty or self-closing interactive elements without accessible names are not allowed.

- Buttons must have visible text content or an `aria-label`.
- Links must have descriptive text content or an `aria-label`.
- Form inputs must have an associated `<label>` or `aria-label`.

## Do's and Don'ts

### Do

- Give buttons visible text: `<button>Save</button>`.
- Add `aria-label` to icon-only buttons: `<button aria-label="Close dialog"><CloseIcon /></button>`.
- Associate labels with form inputs using `htmlFor` or wrapping.
- Use `aria-labelledby` to reference visible labels when appropriate.

### Don't

- Create empty buttons: `<button></button>` or `<button />`.
- Use icon-only buttons without `aria-label`.
- Rely on `title` attributes as the sole accessible name.
- Use non-descriptive text like "Click here" for links.

## Consequences

### Positive

- All interactive elements are usable by screen reader users.
- Meets WCAG 2.1 Level A accessibility requirements.
- Improves usability for voice navigation users.

### Negative

- Icon-only buttons require maintaining `aria-label` alongside visual design.
- Accessible names must be kept in sync with visual labels.
