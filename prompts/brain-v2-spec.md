# Brain v2 — linked atomic notes (owner's clarification 2026-10-24 ~14:57 +06)

Problem with one big Brain file: when another AI comes to read it, the
whole file becomes one huge input. The Obsidian model the owner wants:

1. MANY SMALL NOTES, not one big file — one note per topic/decision.
   The existing Round 38 Brain files (.devforge/overview.md,
   architecture.md, decisions.md, progress.md, notes.md) EVOLVE into
   this: each entry becomes its own small note file under
   .devforge/notes/ (e.g. decisions/2026-10-24-auth-choice.md).
   Keep the existing files working — v2 ADDS the atomic layer, it
   does not delete the section files.
2. NOTES LINKED TO EACH OTHER ([[wikilink]] style) — a note names the
   notes it relates to, forming a graph.
3. INDEX/MAP NOTE — .devforge/index.md lists every note by name with
   a one-line summary + its links. The Brain digest carries THIS MAP
   (still hard-capped ~1,500 tokens total, as in Round 38), NOT the
   full contents of all notes.
4. RETRIEVAL BY NAME, ON DEMAND — a function readBrainNote(name)
   that fetches ONLY the named note's full content when the agent
   needs it. The agent reads the map first, then fetches named notes
   only. It never has to read the whole Brain at once.
5. MAINTENANCE — when a note is created or updated, the index/map
   updates with it (name + summary + links). Notes stay plain
   markdown, so the folder remains openable as an Obsidian vault.
