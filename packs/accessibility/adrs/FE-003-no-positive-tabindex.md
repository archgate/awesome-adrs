---
id: FE-003
title: No Positive tabIndex
domain: frontend
rules: true
files: ["**/*.tsx", "**/*.jsx"]
---

## Context

Using `tabIndex` values greater than 0 overrides the natural DOM tab order, creating a confusing and unpredictable navigation experience for keyboard users. Elements with positive `tabIndex` values receive focus before all elements with `tabIndex={0}` or no `tabIndex`, regardless of their position in the DOM. This makes the page navigation order differ from the visual order, violating WCAG 2.1 Level A (Success Criterion 2.4.3) and causing accessibility barriers.

## Decision

Only `tabIndex={0}` and `tabIndex={-1}` are allowed. `tabIndex={0}` makes a non-interactive element focusable in the natural DOM order. `tabIndex={-1}` makes an element programmatically focusable (via `element.focus()`) but removes it from the tab order. Positive values (`tabIndex={1}`, `tabIndex={5}`, etc.) are banned.

- `tabIndex={0}` — element is focusable in natural DOM order.
- `tabIndex={-1}` — element is programmatically focusable only.
- `tabIndex` with any positive value is not allowed.

## Do's and Don'ts

### Do

- Use `tabIndex={0}` to make custom interactive elements keyboard accessible.
- Use `tabIndex={-1}` for elements that should receive programmatic focus (e.g. modal containers, error summaries).
- Rely on natural DOM order for tab navigation.
- Use semantic HTML elements (`<button>`, `<a>`, `<input>`) that are focusable by default.

### Don't

- Use `tabIndex={1}` or any positive value to force tab order.
- Use `tabIndex` to "fix" tab order problems — fix the DOM order instead.
- Add `tabIndex={0}` to elements that are already focusable (buttons, links, inputs).
- Use positive `tabIndex` values to create a custom focus sequence.

## Consequences

### Positive

- Tab order matches the visual layout, meeting user expectations.
- Keyboard navigation is predictable and consistent.
- Compliant with WCAG 2.1 Level A focus order requirements.

### Negative

- Fixing tab order issues requires restructuring DOM rather than using a quick `tabIndex` override.
- Custom widgets may need more careful DOM ordering.
