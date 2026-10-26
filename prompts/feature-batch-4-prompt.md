# FlamingoCode — Feature Batch 4 + Hermes H5 (prompt)
# Repo: baisakib534-hue/flamingocode, branch main, single-file
# index.html (~22,192 lines). Engine: Hermes Agent + 9router API
# (flamingocode-build combo) ONLY — headless form:
# hermes chat --provider ninerouter --model flamingocode-build
# -s test-first,testing-qa,debugging-discipline --checkpoints
# --oneshot -Q -q "$(cat <prompt-file>)"
# (--oneshot -Q BEFORE -q; -Q between -q and its query breaks parsing.)
# RULES: build ONLY the ONE section named in this round. Work in
# small slices; commit every 2-3 slices with clear messages.
# Commit EVERY file you create — including any test file — before
# pushing; never leave an untracked file behind.
# Verify every claim in the CODE (grep markers, never trust a
# summary). node --check SYNTAX-PASS on the extracted main script;
# literal '</script' count stays 1; no '?.onclick'. Commit + PUSH
# yourself and verify git ls-remote origin main == local HEAD.
# If the push asks for a GitHub username/password, STOP and report
# it — do not enter any credential. No browser runtime test —
# that rides with Stage 5.
# DEDUPE (Batch 4's list has 4 already-built items — do NOT
# rebuild them): Cost meter = Tier B2 usage dashboard (done);
# Time-travel = Tier A checkpoints (done — build guard: NEVER
# build it as a separate feature); Safe Mode = H2.3 Safe Mode v2
# (done); Templates = Tier C2 gallery (done). Build ONLY the
# genuinely-new sections below. REUSE where named: H1.3
# scanForInjection for anything imported/pasted; B2 usage tracker
# for counts; F5 fallback chain for provider failures; Team Mode
# v2's live team chat + replay/export (check before building
# B4.5); Stage 4 plugin packs + MCP registry (check before
# building H5.4/H5.5). Bangla UI toggle exists — add Bengali
# labels for new UI. Write a test file per round (same pattern as
# test-rate-limits.js / test-step-planner.js); all tests must pass
# before pushing, and all existing suites must still pass.

## B4.1 Smart import (feature-idea #12)
Paste a GitHub repo URL → the app analyzes it and continues the
project where it left off. Build: an "Import from GitHub" action
(paste URL, optional branch) that fetches the repo's file list +
key files (README, package.json, structure), builds a project in
the VFS from it, writes a Brain overview note (what the project
is, stack, entry points, what's done / what's missing — from the
code + README, via the Brain code graph), and opens it as the
current project so the agent can continue from there. Run the
H1.3 injection scan over everything imported and block anything
flagged, telling the user plainly. Public repos first; private
repos need a token field (never stored in the project file).
Size M. Web: yes.
