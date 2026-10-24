# DevForge roadmap Tier A — three small feature builds (jcode prompts)

Run these ONE AT A TIME, in order. Each is its own feature: implement,
verify (node --check on the extracted script + the listed grep markers),
commit with its own message, print a summary, then STOP and wait — do not
chain into the next one on your own.

Shared EXECUTION RULE for all three: slices of ≤150 lines; commit every
2–3 slices with small progress messages; split any huge generation.

---

## A1. Checkpoints & one-click undo
- Before EVERY agent-applied change set, auto-snapshot the whole project
  VFS (files + the active Brain state) into a checkpoint list (timestamp +
  short label from the user's request).
- A timeline panel lists checkpoints; "Restore" returns the project to any
  checkpoint in one click (with a confirm). Restoring also creates a
  checkpoint of the pre-restore state, so undo itself is undoable.
- Storage: existing app-state persistence; cap stored checkpoints
  (default 30, oldest dropped) with the cap shown in the panel.
- Markers: `createCheckpoint`, `restoreCheckpoint`, checkpoint panel id.
- Commit: "Feature: checkpoints and one-click undo"

## A2. Diff review before apply
- Agent file changes are shown as a per-file diff (old vs new, +/- lines)
  in a review panel BEFORE being written; the user accepts or rejects per
  file. Accepted files write immediately; rejected files are dropped and
  the agent is told which were rejected (so it can adapt).
- A Settings → Behavior toggle: "Review changes before applying"
  (default ON). With it OFF, current auto-apply behavior stays.
- Markers: diff renderer, `pendingChanges`, accept/reject handlers.
- Commit: "Feature: diff review before apply"

## A3. Full backup export / import
- Settings gets "Export backup" — one JSON file containing all projects,
  providers (including keys, clearly warned in the UI that the file is
  sensitive), agents, teams, and settings.
- "Import backup" reads that JSON and restores everything, after a confirm
  that explains it replaces current data (and auto-creates a safety
  checkpoint/backup of the current state first when A1 is present).
- Markers: `exportBackup`, `importBackup`.
- Commit: "Feature: full backup export and import"
