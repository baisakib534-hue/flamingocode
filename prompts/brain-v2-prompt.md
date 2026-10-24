# Brain v2 — linked atomic notes (build prompt)

Read prompts/brain-v2-spec.md in this repo and implement it exactly
in index.html. Do not touch any other feature, do not rewrite
existing Brain code — v2 ADDS the atomic-notes layer on top of the
Round 38 Brain (digest cap ~1,500 tokens stays).

Build: (1) atomic notes under .devforge/notes/ (one topic/decision
per small note file), (2) [[wikilink]] connections between notes,
(3) .devforge/index.md map note (every note by name + one-line
summary + links) that the Brain digest carries instead of full
contents, (4) a readBrainNote(name) function that fetches ONLY the
named note on demand, (5) index auto-update when a note is created
or updated.

Work in slices of at most 150 lines, commit every 2-3 slices.
Commit message: "Feature: Brain v2 — linked atomic notes with
by-name retrieval". Verify: extract the script and run node --check
(must print SYNTAX-PASS), and grep that the notes folder, index map,
wikilink handling and readBrainNote are present.
