# FlamingoCode — Per-model rate-limit settings (prompt)
# Repo: baisakib534-hue/flamingocode, branch main, single-file
# index.html (~21,525 lines). Engine: Hermes Agent + 9router API
# (flamingocode-build combo) ONLY — headless form:
# hermes chat --provider ninerouter --model flamingocode-build
# -s test-first,testing-qa,debugging-discipline --checkpoints
# --oneshot -Q -q "$(cat <prompt-file>)"
# (--oneshot -Q BEFORE -q; -Q between -q and its query breaks parsing.)
# RULES: build ONLY the ONE feature in this file. Work in small
# slices; commit every 2-3 slices with clear messages. Commit
# EVERY file you create — including any test file — before
# pushing; never leave an untracked file behind.
# Verify every claim in the CODE (grep markers, never trust a
# summary). node --check SYNTAX-PASS on the extracted main script;
# literal '</script' count stays 1; no '?.onclick'. Commit + PUSH
# yourself and verify git ls-remote origin main == local HEAD.
# If the push asks for a GitHub username/password, STOP and report
# it — do not enter any credential. No browser runtime test —
# that rides with Stage 5.
# DEDUPE: Tier B2 usage & quota dashboard exists (per-provider /
# per-project stats, MODEL_COSTS, getFreeQuotaLimit,
# getQuotaResetTime, appState.usage.byProject) — REUSE its usage
# tracking, do NOT build a second tracker. Batch 3 F5 never-stuck
# routing exists (ordered provider chain, auto-switch on
# 429/5xx/timeout/empty, 60s cooldown) — REUSE it as the fallback
# when a model hits its own limit. H2.1 credential pools exist
# (per-key health/cooldown) — do NOT duplicate key-level logic;
# this feature is MODEL-level limits. Bangla UI toggle exists —
# add Bengali labels for the new settings.

## Per-model rate-limit settings (his order 2026-10-26 ~00:19)
His words: model add করার পরে TPM, TPD, RPM, RPD আর এমন যা যা
আছে (standard limits: context window, max tokens, monthly caps
সহ) set করা যাবে। Build: after adding a model (custom or preset),
the user can set that model's own limits — (a) rate limits: TPM
(tokens per minute), TPD (tokens per day), RPM (requests per
minute), RPD (requests per day); (b) standard limits: context
window (input tokens), max tokens (max output per response),
monthly token cap, monthly request cap, monthly cost cap (USD);
(c) anything else standard that fits the same form (e.g. a
per-model concurrent-request limit and a cooldown in seconds
after a limit is hit — only if it fits naturally, never padding).
Empty means NO limit (unlimited). Numbers only, min 0; invalid
input is rejected with a plain message, never saved silently.
UI: the limits live on the model's own card/row in the provider
+ model manager (edit beside where the model was added), with a
small "remaining" readout (e.g. "TPM 12,400 / 20,000 — resets in
42s") fed by the B2 usage tracker; the B2 Usage & Quota
dashboard also shows per-model remaining. Persisted with the
model config (survives reload; included in the A3 full-backup
export/import). ENFORCEMENT: before every call the app checks
the model's limits against tracked usage — on a hit it BLOCKS
that call with a clear visible message naming the limit and when
it resets, and offers the F5 fallback (next provider in the
chain) instead of failing silently or retrying the same model
forever. A limit hit is logged (visible in the usage log). Do
NOT enforce provider-level or key-level limits here — those
already exist (B2 quotas, H2.1 pools). Size M. Web: yes.
Write a test file (test-rate-limits.js, same pattern as
test-memory-discipline.js / test-h14-context-files.js /
test-session-search.js) covering: limit checks pass/fail at the
boundary, remaining math, reset-time display, monthly caps, and
the fallback offer on a hit. All tests must pass before pushing.

