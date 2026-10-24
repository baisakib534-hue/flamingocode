# FlamingoCode roadmap Tier B — four daily-use power features (OpenCode prompts)

Run these ONE AT A TIME, in order. Each is its own feature: implement,
verify (node --check on the extracted script + the listed grep markers),
commit with its own message, print a summary, then STOP and wait — do not
chain into the next one on your own.

Shared EXECUTION RULE for all four: slices of ≤150 lines; commit every
2–3 slices with small progress messages; split any huge generation.
Do NOT expand the Brain digest cap (about 1500 tokens, index map only)
and do NOT break existing wiring (checkpoints, diff review, team room,
autonomy, Brain v2).

---

## B1. Voice input
- A mic button in the agent chat input (Web Speech API). The user
  dictates everything, so it must accept Bangla (bn-BD) AND English
  (en-US) speech, with a language toggle next to the mic button.
- Live interim transcript shown in the chat input while dictating;
  final transcript lands in the input ready to send (not auto-sent).
- Mic on/off state visible on the button; if the browser denies mic
  permission or SpeechRecognition is unavailable, show a clear message
  explaining why (no silent failure).
- Markers: mic button id, SpeechRecognition wiring, transcript handler.
- Commit: "Feature: voice input"

## B2. Usage & quota dashboard
- A dashboard panel (Settings + a header meter) showing, per provider
  and per model: requests made, tokens used, estimated cost, free-quota
  remaining, and quota reset time (the user juggles many free tiers).
- Counts update from real app usage (token meter + provider calls), not
  from fake data. Per-project totals plus per-provider totals.
- DEDUPE: this is THE ONE cost/quota meter. The feature-ideas "Cost
  meter" must NOT be built separately later — it wires into this panel.
- Markers: dashboard panel id, per-provider stats, quota remaining,
  reset time.
- Commit: "Feature: usage and quota dashboard"

## B3. Self-healing preview loop
- Preview console errors (and preview iframe errors) are captured and
  auto-fed back to the agent as a "fix this" cycle: error text +
  failing file/line goes to the agent, the agent fixes, the preview
  re-runs, and the loop repeats up to a small cap (default 3 attempts)
  before asking the user.
- A visible indicator while a fix cycle is running, and a short log of
  what was fixed per cycle.
- DEDUPE: this is THE ONE auto-fix-on-preview-error mechanism. The
  feature-ideas "Auto-fix on error" must wire into this loop later,
  not rebuild a second one.
- Markers: preview error capture, fix-cycle trigger, fix attempts cap.
- Commit: "Feature: self-healing preview loop"

## B4. Prompt library
- A prompt library panel: reusable prompt templates + slash commands.
  A built-in starter set ships with the app, and the user can add, edit
  and delete his own templates (stored in app state, survives reload).
- Typing "/" in the chat input opens template suggestions; picking one
  inserts its full text into the input (not auto-sent).
- DEDUPE: this is THE ONE prompt library. Slash commands from the
  copied-features list use this same library later, not a second one.
- Markers: prompt library panel id, template storage, slash trigger.
- Commit: "Feature: prompt library"
