# FlamingoCode Desktop — Windows .exe + macOS .dmg installers (his standing release order)

**HIS ORDER (2026-10-26, still open):** Windows `.exe` + macOS `.dmg` installers
from the Stage 6 Electron build, attached to the GitHub release
(`baisakib534-hue/flamingocode`). The APK (`v1.0.0-apk` tag) is already live —
this round finishes the desktop half of that release.

## BUILD VENUE — GitHub Actions (decided, do not use anything else)

- The VM **cannot** build these (no Windows/macOS toolchains, no signing).
  Do NOT try to build installers on the VM.
- Do NOT use the codespace either.
- Write a workflow at `.github/workflows/release-desktop.yml` in the repo:
  `windows-latest` runner builds the Windows installer, `macos-latest`
  runner builds the macOS installer. The repo is **public** → Actions
  minutes are free. No secrets needed (unsigned build, see below).
- The workflow must compile the native modules **per-OS inside the runner**
  (Rust `cargo build --release` in `desktop/src/native/rust`,
  C++ build in `desktop/src/native/cpp`, Go build in `desktop/go/devforge-go`)
  — never ship a `.node`/binary built for the wrong OS.

## WHAT I VERIFIED IN THE REPO (do not re-discover, build on it)

- Repo: `baisakib534-hue/flamingocode` (public). Work in `~/workspace/flamingocode`,
  branch from current HEAD.
- Electron app lives in `desktop/`: `src/{main,preload,renderer,native/{rust,cpp}}`,
  `go/devforge-go/{go.mod,main.go}`. electron-builder `^24.13.0`, electron `^30.0.0`.
- Scripts: `npm run build` (tsc main+preload, vite renderer, rust+cpp native),
  `npm run package` (`electron-builder --win --x64`), `npm run package:all`
  (`--win --mac --linux`).
- `build` config in `desktop/package.json` has **only** `win → nsis`. There is
  **no `mac` target** — add `dmg` target config for macOS.
- **Branding leftover (FIX in this round):** `productName` is still `'DevForge'`
  and `appId` is `com.devforge.app`. His final product name is **FlamingoCode**
  (rename decided twice, final). Set `productName: 'FlamingoCode'`,
  `appId: 'com.flamingocode.app'`. Use his flamingo logo artwork
  (`~/workspace/devforge/brand/flamingocode-logo-transparent.png`) for
  installer icons — generate `icon.ico` (win) and `icon.icns` (mac) from it,
  do NOT redraw the logo.
- There is **no `.github/workflows/`** yet — you are creating the first workflow.

## UNSIGNED BUILD — his money decision, do NOT buy anything

- No code-signing certificates exist. Do NOT purchase any (Apple Developer
  $99/yr, Windows OV cert ~$70–200/yr are HIS money decisions — name them in
  the final report, do not buy).
- Consequence, stated honestly in the report: the unsigned `.exe` will show a
  Windows SmartScreen "unknown publisher" prompt (click through), and the
  unsigned `.dmg` app will be Gatekeeper-blocked on first launch (right-click →
  Open). This is normal for open-source releases — but report it plainly, do
  not hide it.

## HIS QUALITY BAR (non-negotiable)

'কাজ করলে একদম ভালো না হলে একটু চাইনা' — completely good or not at all.
Verify everything yourself; never trust a green check you didn't read:

1. The workflow run must go **fully green on GitHub** for BOTH runners.
   Read the actual logs — a green badge you didn't open doesn't count.
2. Download both artifacts from the run and verify: `.exe` is a valid NSIS
   installer (size sane, not 0 bytes, installer metadata reads FlamingoCode);
   `.dmg` mounts conceptually — at minimum verify its volume layout and that
   `FlamingoCode.app` exists inside with the right bundle id.
3. Attach both files to the GitHub release. The APK already lives on tag
   `v1.0.0-apk` — attach the installers to that same release (or cut a new
   tag if that is cleaner; be consistent and say which you chose). Verify each
   asset is downloadable from the release page afterwards.
4. Commit in small slices, push every slice. Final report: workflow file path,
   run URL, both asset names + sizes + sha256, release URL, and the
   SmartScreen/Gatekeeper caveat in one plain paragraph.

## OUT OF SCOPE

- Do not touch the website (`website/`), the relay, or the mobile app.
- Do not change the baked-in 9router key or any provider/model config.
- Do not re-run the full test suite unless your change touches app code —
  the branding/config changes here are packaging-only, but if you touch
  `src/`, run the relevant checks.
