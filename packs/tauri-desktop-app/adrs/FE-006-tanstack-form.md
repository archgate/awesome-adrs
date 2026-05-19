---
id: FE-006
title: TanStack Form for Form Management
domain: frontend
rules: true
files: ["packages/frontend/**"]
---

## Context

Frontend applications require robust form handling for user input validation, state management, and submission. Without a standardized form library, developers use inconsistent patterns (native state, various libraries), manual validation lacks compile-time type checking, form validation logic gets duplicated across components, and testing form flows becomes difficult.

This project already uses TanStack Router for routing and TanStack Query for data fetching. Using TanStack Form creates a consistent ecosystem with shared patterns and type safety guarantees. TanStack Form provides a type-safe, framework-agnostic API with React adapters, while alternatives like React Hook Form or Formik offer less type safety or more verbose APIs.

## Decision

All forms in frontends must use TanStack Form for form state management, validation, and submission handling, with Zod for schema-based validation.

- **Use `useForm` hook** from `@tanstack/react-form` for all data entry, search/filter, multi-step, and dynamic forms.
- **Define Zod schemas** for field and form-level validation. Zod 3.24+ implements the Standard Schema interface, so schemas can be passed directly to validators without adapters.
- **Type-safe form fields** via `form.Field` component for field registration.
- **Controlled form state** with `form.state` for errors, submission status, and validation.
- **Three-step `defaultValues` pattern**: (1) define a `defaults` object, (2) parse with `validator.safeParse({ ...defaults, ...initialData })`, (3) use ternary `parseResult.success ? parseResult.data : defaults`.
- **Error handling**: form components accept an `error?: Error | null` prop and display errors via alert components. The form's `onSubmit` is wrapped in `try/catch` to prevent unhandled promise rejections.

## Do's and Don'ts

### Do

- Use TanStack Form for all data entry forms.
- Define Zod schemas for validation and pass them directly to validators.
- Use the three-step `safeParse` pattern for `defaultValues`.
- Use `form.Field` component for field registration.
- Handle errors with `field.state.meta.errors`.
- Disable submit buttons during submission with `form.state.isSubmitting`.
- Accept an `error?: Error | null` prop in form components for mutation error display.
- Wrap form's `onSubmit` in `try/catch` to prevent unhandled promise rejections.

### Don't

- Use `useState` for form state management.
- Use other form libraries (React Hook Form, Formik, Final Form).
- Manually construct `defaultValues` without the `safeParse` pattern.
- Use `.data` directly without checking `.success` first.
- Duplicate validation logic between frontend and backend.
- Forget to disable submit buttons during submission.
- Ignore mutation errors; always pass them to form components.

## Consequences

### Positive

- Full TypeScript support with inferred types from Zod schemas.
- Consistent form patterns across all frontends.
- Validation schemas can be shared between frontend and backend.
- Optimized re-renders with field-level subscriptions.
- Clean API with minimal boilerplate.
- Consistent with TanStack Router and TanStack Query ecosystem.
- Built-in support for async validators.

### Negative

- Learning curve for TanStack Form API.
- Existing forms require migration effort.
- Additional bundle size (~10KB gzipped).
- Smaller community compared to React Hook Form.
