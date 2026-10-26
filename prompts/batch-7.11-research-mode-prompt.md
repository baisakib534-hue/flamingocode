# Batch 7.11 — Web search + research mode, anytime (feature-idea #19, his 2026-10-26 ~14:12 order)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His question: "আমার software টা কি যেকোন সময় searching, researching
করতে পারবে না?" Honest answer given to him: codebase search YES (code
graph, codebase chat), web page fetch YES (fetch MCP), DuckDuckGo AI
answers web questions — but a PROPER research mode is NOT built yet.
This batch builds it: search query → results → read the sources →
synthesized answer with citations, on demand, any time. Build with
Batch 7 (right after 7.10).

## 1. The research loop — `researchTopic(query, options)`

Five steps, each visible to him (progress line per step):
1. **Expand** — `expandResearchQueries(query)`: from his one question,
   formulate 2–4 search queries (Bangla + English where it helps — e.g.
   a Bangla question also gets an English query for broader sources).
   Show the queries, let him edit/remove one before running (one tap).
2. **Search** — `webSearch(query)`: DuckDuckGo-based web search, NO API
   key (the product's free provider — reuse the existing DuckDuckGo
   wiring; the search goes through the same DDG endpoint the app already
   uses). Returns ranked results `{ title, url, snippet }`, top 8 per
   query, de-duplicated across queries.
3. **Read** — `fetchPage(url)`: fetch the top sources (default top 5,
   his choice up to 10) via the existing fetch path, extract the readable
   text, keep the excerpt + word count per source. A source that fails to
   fetch is listed as "could not be read" — never silently dropped, never
   faked.
4. **Synthesize** — `synthesizeResearch(question, sources)`: one model
   call with the fetched excerpts + a strict instruction: answer in
   Bangla (his language) unless he asked in English; EVERY factual claim
   carries an inline citation `[1]`, `[2]` pointing at a fetched source;
   say plainly what the sources do NOT cover.
5. **Save** — the report is saved under
   `.devforge/research/YYYY-MM-DD-<topic>.md` (answer + source list +
   date) and linked in the Brain index, so research persists and the
   Brain digest can cite it later.

## 2. Research UI

- A "Research" entry: a mode in the chat input ("Research" next to
  Chat / Plan / Plan+Build / Spec / General) AND a panel listing past
  research reports (title + date + source count, open / delete).
- While researching: a progress card — "খুঁজছি… (2/4 queries)" →
  "পড়ছি… (3/5 sources)" → "লিখছি…" — with a Cancel button (a cancelled
  research keeps whatever it already fetched, shown as a partial report
  labelled "অসম্পূর্ণ").
- The answer renders with inline citation chips `[1]` `[2]` — tapping a
  chip jumps to the source in the source list (title + URL + "read"
  state). Below the answer: "আরও জানতে চাও?" follow-up suggestions
  (generated from gaps the sources did not cover) — tapping one starts a
  new research round with the same sources carried over.
- Research NEVER blocks other work: it runs as a background task (the
  H5.1 scheduled-tasks shape) — he can keep chatting while it reads.

## 3. Honest limits — baked in, not hidden

- No API key is used; search quality depends on the DuckDuckGo endpoint
  and the network. If search fails, the UI says so ("খুঁজতে পারিনি —
  আবার চেষ্টা করো") and offers a retry — never a fake answer.
- **Iron rule (7.3 gate applies): a citation must point at a source the
  agent actually fetched and read in this run.** An unfetched source is
  NEVER cited. If zero sources could be read, the answer is "কোনো source
  পড়তে পারিনি" + the search snippets only, labelled as snippets, not
  sources.
- The model must not invent facts to fill gaps — gaps are stated as
  gaps, with a follow-up suggestion to research further.

## 4. Settings + i18n

- Settings → Behavior: "Research sources per question" (default 5, max
  10), "Research language" (Bangla / English / Auto — default Auto:
  answer in the language he asked).
- Bengali translations for every new string (progress lines, citation
  labels, error sentences, follow-up prompts).

## 5. Dedupe — do NOT rebuild

Codebase search (code graph, codebase chat), the fetch path, DuckDuckGo
AI, the Brain + notes, H5.1 background tasks, the 7.3 verification gate —
build ON them. No second search engine, no second fetch, no second notes
store. Research is a LOOP over existing pieces + one synthesis call.

## Tests — new file `test-batch-7.11-research-mode.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) `expandResearchQueries` turns one Bangla question into 2–4 queries
    including an English one, and the queries are shown editable before
    running;
(b) `webSearch` returns ranked, de-duplicated results (same URL from two
    queries appears once);
(c) `fetchPage` extracts readable text and records excerpt + word count;
    a failed fetch is recorded as "could not be read";
(d) the synthesized answer cites ONLY fetched sources — a source that
    failed to fetch is never cited (assert on a fixture with one failed
    source);
(e) zero readable sources → the report says so and shows snippets only,
    labelled as snippets;
(f) the report saves under `.devforge/research/` and is linked in the
    Brain index;
(g) follow-up suggestions come from gaps the sources did not cover, and
    tapping one starts a new round carrying the old sources over;
(h) cancelling mid-run keeps a partial report labelled "অসম্পূর্ণ";
(i) research runs as a background task — chatting continues while it
    reads (assert the task is registered as background, not blocking);
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
