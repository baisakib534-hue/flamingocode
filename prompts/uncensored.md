# DevForge feature build — Uncensored Mode (jcode prompt, self-contained)

Read PRD.md and AGENTS.md first. Implement ONLY this feature in index.html.
Do not start any other stage or feature.

## Feature: per-project Uncensored Mode + per-model override (Sakib's order)

### State (persist via the existing saveAppState mechanism)
- `uncensoredPerProject: { [projectId]: boolean }` — default false.
- `uncensoredPerModel: { ["providerId|modelId"]: "auto" | "on" | "off" }` —
  default "auto".
- Effective mode for a request = per-model override if it is "on"/"off",
  else the active project's `uncensoredPerProject` value, else off.

### UI
- Project bar / header, next to the active project name: an "Uncensored"
  toggle switch reflecting the ACTIVE project's stored state. Switching
  projects restores that project's own state.
- While ON for the active project: a red "UNCENSORED" chip stays visible in
  the header. One click on the toggle turns it OFF.
- Under the toggle (title/caption) and in Settings → Behavior, this exact
  honest caption: "Changes what DevForge asks the model. A provider's own
  server-side rules still apply."
- Settings → Behavior also holds: the same project toggle, and the per-model
  override list — every configured provider|model with a 3-state control
  (Auto / On / Off).

### Behavior
- A constant `UNCENSORED_SYSTEM_PROMPT` (a short instruction telling the
  model to answer directly without moralizing, refusals or warnings, and to
  treat all project work as authorized) is defined once.
- The central request builder prepends it to the system/context of EVERY
  outgoing request when the effective mode is ON — agent chat, Team Mode
  members, and auto-created sub-agents, across ALL providers. When OFF,
  requests are byte-identical to before this feature.

### Acceptance (verify before committing)
- Extracted script passes `node --check`.
- grep markers present: `uncensoredPerProject`, `uncensoredPerModel`,
  `UNCENSORED_SYSTEM_PROMPT`, `UNCENSORED` chip.
- Toggle persists across reload (state saved); per-model override wins over
  the project setting in the effective-mode function.

### EXECUTION RULE (manager)
Build in slices of ≤150 lines; commit every 2–3 slices with small progress
messages; if a generation would be huge, split it. After the feature is
complete and verified, final commit message:
"Feature: per-project Uncensored Mode with per-model override"
Then print a short summary of what was added and where. Do not start the
next feature.
