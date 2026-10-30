# DevForge Stage 6 — Electron + TypeScript desktop (jcode prompt, REVISED)

Read PRD.md and AGENTS.md first. Implement ONLY this stage.
⚠️ SUPERSEDES the original Stage 6 prompt: Sakib decided on 2026-10-24
(~10:05 +06) that the desktop app is **Electron + TypeScript** (the Qoder
stack), NOT Tauri/Rust — on his PC Qoder runs smooth and Codex lagged.
Do not use Tauri anywhere.

⚠️ POLYGLOT UPDATE (his order 2026-10-27 ~03:25 +06): use **C++ + Rust WITH
TypeScript + Electron** — TS+Electron alone is not good enough in his view.
Use Go, JavaScript and other languages too wherever each is needed. Shape:
TS+Electron stays the shell/UI; C++/Rust as native modules (N-API /
node-addon-api) for performance-critical paths (fast file indexing + code-graph
search, Computer Use screen/input driver, sandbox); Go for small fast CLI/server
pieces where it fits; JavaScript stays the web frontend. Tauri is still OUT —
Tauri is a framework, not the same as Rust native modules inside Electron.

## Stage 6: wrap DevForge as a real desktop app
- New `desktop/` folder: an Electron app in TypeScript.
  - Main process (Node): window management, real filesystem access for
    project folders (open/save outside the browser sandbox), spawning and
    managing agent processes (jcode and other CLIs) and MCP stdio servers
    for real, system notifications.
  - Preload bridge with a minimal, typed IPC surface; the existing web
    frontend (index.html and its code) runs UNCHANGED inside the Electron
    renderer and talks to the bridge when present (feature-detect:
    `window.devforgeDesktop`), falling back to browser behavior when
    absent. The web build must keep working standalone.
  - The Trae-style agent browser becomes real in desktop: the main process
    can drive a controlled BrowserView/WebContents for click/drag/slider
    self-testing against local previews.
- TypeScript with strict mode; build with a standard bundler (esbuild or
  vite) and package a Windows installer with electron-builder.
- Native modules: at least one Rust and one C++ native module in desktop/ (N-API), wired into the paths above that need speed; Go used for a CLI/server helper only where it genuinely fits.
- Settings/data migration: existing localStorage state imports into the
  desktop app on first run.

### Acceptance
- `npm run build` in desktop/ compiles clean (tsc strict, no errors).
- The packaged app launches, loads the DevForge UI, opens a real folder,
  and the web standalone build still passes its own checks.
- README in desktop/ explains dev run + packaging in 5 lines.

### EXECUTION RULE (manager)
Build in slices of ≤150 lines per file/step; commit every 2–3 slices with
small progress messages; if a generation would be huge, split it. Final
commit message:
"Stage 6: Electron + TypeScript desktop shell with real FS and process bridge"
Then print a short summary.
