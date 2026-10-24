# DevForge feature build — Project Brain (jcode prompt, self-contained)

Read PRD.md and AGENTS.md first. Implement ONLY this feature in index.html.
Do not start any other stage or feature.

## Feature: Project Brain — persistent per-project memory + context
## compression + small-request discipline (Sakib's order)

### Brain files (per project, inside the project VFS, plain markdown —
### Obsidian-compatible)
Under `.devforge/` in each project:
- `overview.md` — what the project is, stack, how to run it.
- `architecture.md` — main parts and how they connect.
- `decisions.md` — append-only, dated entries: decision + why.
- `progress.md` — what is built, what is in progress, what is next.
- `notes.md` — free-form notes.
Create them (with starter headings) when a project is created or first
opened without them. The user can open and edit them in the editor like any
file.

### Brain digest in every request
- A `buildBrainDigest(project)` function reads the five files and builds a
  compact digest, hard cap ~1,500 tokens (truncate by priority:
  progress.md > decisions.md (recent) > overview.md > architecture.md >
  notes.md).
- The request builder puts the digest in the system context INSTEAD of
  replaying long chat history.

### Agent maintains the Brain
- After each completed agent step, the agent updates `progress.md` (and
  appends to `decisions.md` when a real decision was made) through the
  existing file: block mechanism. Prompt the model to do this in the system
  instructions DevForge sends.

### Conversation compression
- When the estimated history exceeds ~60% of the active model's context
  budget (Stage 2 contextWindow), summarize older turns into a short
  summary stored in the Brain (`notes.md` section or a digest field) and
  send only: digest + summary + last ~8 turns verbatim.

### File context discipline
- Files sent as context are OUTLINES by default (a signature map: function/
  class names + line ranges). Full content only for the file being edited.
  Unchanged files are replaced by a one-line reference.

### Small-request discipline (his explicit rule)
- Work is split into SMALL sequential requests: one plan step / one file
  per request. Per-request input budget default ~8K tokens, configurable
  in Settings → Behavior. The request builder enforces it by trimming in
  priority order: Brain digest > current step > current file > outlines >
  recent turns. Prefer patch/diff-style edits over full-file rewrites.

### Token meter
- Header shows: estimated tokens of the next request + a budget bar
  (against the model's contextWindow) + tokens saved by compression.

### Acceptance (verify before committing)
- Extracted script passes `node --check`.
- grep markers present: `.devforge/`, `buildBrainDigest`, `progress.md`,
  a summarize/compress trigger.
- Fresh-session test (by code inspection): first request on an existing
  project contains the digest and no full history.

### EXECUTION RULE (manager)
Build in slices of ≤150 lines; commit every 2–3 slices with small progress
messages; if a generation would be huge, split it. Final commit message:
"Feature: Project Brain - persistent per-project memory + context compression"
Then print a short summary. Do not start the next feature.
