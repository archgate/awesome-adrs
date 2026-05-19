---
id: FE-001
title: MUI as UI Component Library
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Building an application frontend requires a comprehensive component library that provides pre-built, accessible UI components for common patterns: buttons, forms, tables, dialogs, navigation, and data display. Without a standardized component library, teams build custom components for basic UI patterns, leading to inconsistent visual design, duplicated effort, and accessibility gaps.

MUI (Material UI) is the most widely adopted React component library, offering a complete set of production-ready components, a powerful theming system with CSS variable-based dark mode support, and a flexible layout system. MUI v7 introduces Grid, Stack, and Box as layout primitives with clear roles: Grid for horizontal layouts, Stack for vertical stacking, and Box for content containers. The theming system supports palette path strings in `sx` props that automatically resolve to CSS variables, enabling dark/light mode transitions without React re-renders.

## Decision

MUI (Material UI) v7 is the UI component library for the frontend.

- `@mui/material` is the primary component library. No other component libraries (`@chakra-ui/react`, `antd`, `@mantine/core`) are permitted alongside it.
- **Grid** is used for all horizontal (row) layouts. Every Grid child must have an explicit `size` prop.
- **Stack** is used for all vertical (column) layouts. `Stack direction="row"` is not permitted; use Grid instead.
- **Box** is used for content containers only (padding, borders, backgrounds). Box must never have `display: flex` or `display: grid` in its `sx` prop.
- Use theme palette path strings (e.g., `'primary.main'`, `'background.paper'`) in `sx` props for all theme-dependent colors. MUI resolves these to CSS variables automatically, enabling seamless dark/light mode transitions.
- Do not extract `theme.palette` values via `useTheme()` for MUI component styling; the values are static and will not switch with the color scheme. Use `theme.vars.palette` only for non-MUI contexts (e.g., chart libraries, canvas).
- CSS Modules are used for custom styling beyond what MUI components and `sx` props provide.

## Do's and Don'ts

### Do

- Use `Grid container` with `Grid` children for any horizontal arrangement of elements.
- Use `Stack` for vertical stacking (column direction only).
- Define explicit `size` prop on every Grid child (`size={12}`, `size="auto"`, `size="grow"`, or responsive breakpoints).
- Use palette path strings in `sx` props for colors: `sx={{ color: 'text.primary', bgcolor: 'background.paper' }}`.
- Use `theme.vars.palette` (with fallback pattern) when passing colors to non-MUI libraries.
- Use CSS Modules for custom styling beyond MUI's built-in options.

### Don't

- Use alternative component libraries (`@chakra-ui/react`, `antd`, `@mantine/core`) in the project.
- Use `Box` with `display: flex` or `display: grid` in `sx` props; use Grid or Stack instead.
- Use `Stack direction="row"`; use `Grid container` for horizontal layouts.
- Extract `theme.palette` values via `useTheme()` and pass them to MUI `sx` props; the values are static and will not switch with dark/light mode.
- Use hardcoded color values (e.g., `'#1976d2'`) in `sx` props; always reference the theme palette.

## Consequences

### Positive

- Comprehensive, production-ready component library covers all common UI patterns out of the box.
- Consistent visual design across the entire application through MUI's theming system.
- Seamless dark/light mode transitions via CSS variables with zero React re-renders.
- Clear layout semantics: Grid for horizontal, Stack for vertical, Box for content.
- Large community, extensive documentation, and regular updates from the MUI team.
- Accessible components with built-in ARIA attributes and keyboard navigation.

### Negative

- MUI adds to the bundle size, though tree shaking mitigates this for unused components.
- Palette path strings in `sx` are plain strings and not type-checked by TypeScript.
- Grid requires wrapping children in `<Grid size="auto">` even for simple row layouts, adding verbosity.
- Developers must learn MUI's theming system and the distinction between palette paths and direct palette access.
