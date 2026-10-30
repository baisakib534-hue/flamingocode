# DevForge Desktop — Electron + TypeScript + Native Modules

## Dev Run

```bash
cd desktop
npm install
npm run dev
```

## Build

```bash
cd desktop
npm run build          # compiles TS (strict), builds Rust & C++ native modules
npm run package        # packages Windows installer (NSIS) via electron-builder
npm run package:all    # packages for Windows, macOS, Linux
```

## Structure

```
desktop/
├── src/
│   ├── main/           # Electron main process (Node)
│   │   ├── main.ts     # Window management, app lifecycle
│   │   └── ipc/        # IPC handlers (fs, process, dialog, native, settings, selftest)
│   ├── preload/        # Preload bridge (typed IPC surface)
│   │   ├── preload.ts  # Main preload - exposes window.devforgeDesktop
│   │   └── selftest-preload.ts  # Self-test BrowserView preload
│   └── native/
│       ├── rust/       # N-API module: file indexing, code-graph search, sandbox (bwrap)
│       └── cpp/        # N-API module: screen capture, low-level input (click/type/drag/key)
├── go/
│   └── devforge-go/    # Go CLI/server: fast file ops, MCP stdio server
├── package.json
├── tsconfig.main.json
├── tsconfig.preload.json
└── vite.config.ts      # (dev only - prod loads web app directly)
```

## Key Features

- **Real FS Access**: `window.devforgeDesktop.fs.*` for project folders outside sandbox
- **Process Spawning**: `window.devforgeDesktop.process.*` for agents, CLIs, MCP servers
- **Native Speed**: Rust (indexing/search/sandbox) + C++ (screen/input) via N-API
- **Self-Test**: `window.devforgeDesktop.selftest.*` drives BrowserView for Trae-style testing
- **Settings Migration**: Auto-imports `localStorage` (`devforge-*` keys) on first desktop run
- **Web Compatibility**: Web app (`index.html`) runs unchanged; feature-detects `window.devforgeDesktop`

## Go Helper

```bash
cd desktop/go/devforge-go
go build -o ../../go/bin/devforge-go .
# or run directly:
go run . --cmd=serve --port=20128 --project-dir=/path/to/project
go run . --cmd=index
go run . --cmd=search --query="functionName"
go run . --cmd=mcp  # MCP stdio server
```

## Native Module Build Requirements

- **Rust**: `cargo` (install via rustup)
- **C++**: `node-gyp` + Python 3 + build tools (VS Build Tools on Windows, Xcode on macOS, build-essential on Linux)
- **Go**: `go` 1.22+

## Web App Compatibility

The existing `index.html` (at repo root) loads directly in Electron. It detects the desktop bridge:

```js
if (window.devforgeDesktop) {
  // Use native FS, process, native modules, self-test
} else {
  // Browser fallback: localStorage, iframe preview, simulated agent browser
}
```

No changes to the web app required.