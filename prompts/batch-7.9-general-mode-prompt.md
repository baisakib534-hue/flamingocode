# Batch 7.9 — General Mode (research sweep #47, Qoder — HIGH FIT)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

This is him — a non-coder building software. Qoder's General Mode hides
all code, talks in plain language, and shows results (the app working)
instead of diffs. What exists today (do NOT rebuild): Teach Mode (Batch 1
F2 — explains changes in simple Bangla), the Chat / Plan / Plan+Build mode
selector, the B3 live preview. The GAP: Teach Mode EXPLAINS the code; it
still SHOWS it. General Mode hides the code entirely. This batch makes
General Mode FlamingoCode's default face: he describes, it builds, he
sees the result.

## 1. The mode — `planMode: 'general'`

- Add "General" to the mode selector (next to Chat / Plan / Plan+Build /
  Spec mode from 7.6). `appState.planMode === 'general'`.
- DEFAULT mode for fresh users is General (a new user who cannot code
  must never see code on first use). Existing users keep their current
  mode — never switch a mode under him.
- Switching modes mid-task keeps the task, the chat history, and the
  files — only the PRESENTATION changes.

## 2. What General Mode hides — and what it shows instead

HIDDEN in General mode (never rendered, never pasted into chat):
- diffs and file contents, terminal/command output, stack traces, test
  output lines, token counts, model names, tool names.
SHOWN instead, in plain Bangla first:
- Progress in his words: "আমি লগইন পেজটা বানাচ্ছি…" / "এবার বোতামটা
  পরীক্ষা করছি…" (one line per step, no jargon).
- The LIVE PREVIEW front and center — the app working is the result
  (the preview panel becomes the main view while the agent works; chat
  stays as a side strip).
- Result cards: "হয়ে গেছে — লগইন বোতামটা কাজ করে, এখানে ক্লিক করে
  দেখো" with a "Try it" button that focuses the preview.
- Simple approve/reject: "ঠিক আছে ✓" / "বদলাও" — no diff to read.
- Errors in plain Bangla: "একটা সমস্যা হয়েছে — আমি ঠিক করছি" (the
  B3 self-healing loop runs underneath; he sees the plain sentence, not
  the error text).
- Verification in plain words: the 7.3 gate still applies — a "done"
  claim carries its evidence, shown as "পরীক্ষা করা হয়েছে ✓ (৭৫টা
  পরীক্ষা পাস)" — never the raw test output.

## 3. What still runs underneath (nothing is weakened)

- Diff review (A2), checkpoints (A1), the Senior review (Team Mode),
  the 7.3 verification gate, per-tool permissions (7.4), Safe Mode —
  ALL still run. General Mode changes PRESENTATION only, never safety.
- The agent still uses the full tool catalog (Autonomy Engine) — the
  user just never sees the tool names.
- Every hidden artifact is one tap away: a "Show code" toggle per task
  (and switching to Chat mode) reveals the diffs, files, and logs for
  that task. The toggle state is per-task, not global.

## 4. Settings + i18n

- Settings → Behavior: "Default mode" selector (General / Chat),
  default General for fresh users.
- The mode selector in the chat header shows a plain-language label for
  General mode ("সাধারণ — কোড দেখাবে না, শুধু ফলাফল").
- Bengali translations for every new string (mode label, progress
  templates, result cards, error sentences, "Show code" toggle).

## 5. Dedupe — do NOT rebuild

Teach Mode, the mode selector, Plan+Build, the B3 preview, the A2 diff
review, checkpoints, the Senior review, the 7.3 gate — build ON them.
General Mode is a PRESENTATION layer over the existing machine, not a
second agent, not a second preview, not a second review.

## Tests — new file `test-batch-7.9-general-mode.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) "General" exists in the mode selector and is the default for a fresh
    user (fresh `appState` → `planMode === 'general'`);
(b) in General mode, rendering a task result contains NO diff markup, NO
    file content, NO terminal output, NO stack trace (assert the
    renderer's output for a fixture task);
(c) in General mode, the result shows a plain-Bangla progress line + a
    result card + the preview focus action;
(d) an error in General mode renders the plain-Bangla sentence, not the
    raw error text;
(e) the 7.3 verification evidence still attaches to a "done" claim in
    General mode (shown as "পরীক্ষা করা হয়েছে ✓" + pass count);
(f) "Show code" reveals the diff for that task only (other tasks stay
    hidden; switching to Chat mode reveals everything);
(g) switching modes mid-task keeps the task + history + files;
(h) the A2 diff review, checkpoints, and Senior review still run under
    General mode (their functions are called — assert via the existing
    hooks, not by re-running them);
(i) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
