---
id: ARCH-010
title: Tauri v2 Desktop Shell
domain: architecture
rules: true
files: ["packages/desktop/**"]
---

## Context

Desktop applications need a native shell to wrap web-based user interfaces. Traditionally, Electron has been the dominant choice, but it bundles an entire Chromium browser and Node.js runtime, resulting in large application sizes (200MB+) and high memory usage. Tauri v2 takes a fundamentally different approach by using Rust for the native shell and leveraging the operating system's built-in webview (WebView2 on Windows, WebKit on macOS, WebKitGTK on Linux). This results in dramatically smaller application sizes (~10MB), lower memory consumption, and better security through Rust's memory safety guarantees.

Tauri v2 provides a secure IPC bridge between the Rust backend and JavaScript frontend, supports Windows, macOS, and Linux from a single codebase, and offers a rich plugin ecosystem for native capabilities like file system access, notifications, and system tray management.

## Decision

Tauri v2 is the desktop shell for all desktop applications. The Rust shell manages the application lifecycle, spawns the backend as a sidecar process, and loads the frontend via a webview pointed at localhost.

- The desktop package lives at `packages/desktop/` with a `src-tauri/` directory containing the Rust code and `tauri.conf.json` configuration.
- The Tauri configuration file (`tauri.conf.json`) defines window properties, security policies, bundle settings, and sidecar configurations.
- The frontend is loaded via the system webview, connecting to a local development server or bundled assets.
- Native functionality is accessed through Tauri's IPC system and plugin architecture, not through direct system calls from JavaScript.
- `@tauri-apps/cli` must be present as a workspace dev dependency for build tooling.
- `@tauri-apps/api` must be present as a dependency for frontend-to-Rust IPC communication.
- No other desktop shell frameworks (Electron, NW.js, Neutralinojs) are permitted.

## Do's and Don'ts

### Do

- Place all Tauri-related Rust code and configuration in `packages/desktop/src-tauri/`.
- Use `tauri.conf.json` for all Tauri configuration (window settings, security, bundling).
- Use Tauri's IPC system (`invoke`, `emit`, `listen`) for communication between Rust and JavaScript.
- Use Tauri plugins for native OS capabilities (file system, notifications, clipboard, etc.).
- Keep the Rust shell thin, delegating business logic to the TypeScript backend sidecar.
- Test on all target platforms (Windows, macOS, Linux) before releases.

### Don't

- Use Electron, NW.js, Neutralinojs, or any other desktop shell framework.
- Access native OS APIs directly from JavaScript; always go through Tauri's IPC bridge.
- Bundle a Chromium browser or Node.js runtime with the application.
- Put business logic in the Rust shell; it should only handle app lifecycle and native integrations.
- Modify `tauri.conf.json` security settings (CSP, capabilities) without review.

## Consequences

### Positive

- Dramatically smaller application size (~10MB vs 200MB+ for Electron).
- Lower memory and CPU usage by leveraging the system's native webview.
- Rust's memory safety guarantees reduce the risk of security vulnerabilities in the native shell.
- Cross-platform support for Windows, macOS, and Linux from a single codebase.
- Secure IPC architecture with fine-grained permission control.
- Active community and growing plugin ecosystem.

### Negative

- Requires Rust knowledge for extending native shell functionality.
- Webview rendering may differ slightly across operating systems due to using system webviews.
- Smaller ecosystem compared to Electron's mature third-party library collection.
- Debugging across the Rust/JavaScript boundary can be more complex than a pure JavaScript stack.
