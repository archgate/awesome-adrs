---
id: FE-001
title: Images Require Alt Text
domain: frontend
rules: true
files: ["**/*.tsx", "**/*.jsx"]
---

## Context

Images without alternative text are invisible to screen readers, making content inaccessible to users who rely on assistive technology. Missing `alt` attributes also cause accessibility audit failures (WCAG 2.1 Level A, Success Criterion 1.1.1). Every `<img>` element and framework Image component must have an `alt` attribute — either descriptive text for meaningful images or an empty `alt=""` for purely decorative ones.

## Decision

All `<img>` elements and Image components (e.g. Next.js `<Image>`) must have an `alt` attribute. Meaningful images must have descriptive alt text that conveys the content or function of the image. Decorative images that add no information must use `alt=""` to be skipped by screen readers.

- Every `<img>` and `<Image>` must include an `alt` attribute.
- Alt text should describe the content or purpose, not the appearance (e.g. "Download report" not "blue arrow icon").
- Decorative images use `alt=""` — never omit the attribute entirely.

## Do's and Don'ts

### Do

- Add descriptive `alt` text to all meaningful images: `<img alt="Company logo" src="..." />`.
- Use `alt=""` for purely decorative images: `<img alt="" src="decorative-border.png" />`.
- Write alt text that conveys the function, not just the appearance.
- Review alt text for accuracy when updating images.

### Don't

- Omit the `alt` attribute entirely on `<img>` or `<Image>` components.
- Use generic alt text like "image", "photo", or "icon".
- Include "image of" or "picture of" in alt text — screen readers already announce it as an image.
- Use the filename as alt text.

## Consequences

### Positive

- Content is accessible to screen reader users.
- Passes WCAG 2.1 Level A requirements for non-text content.
- Improves SEO through descriptive image metadata.

### Negative

- Developers must write meaningful alt text for every image, adding effort.
- Alt text quality depends on the author and is hard to validate automatically.
