# Batch 7.12 — Message queue, desktop + phone (feature-idea #21, his 2026-10-26 ~19:31 catch)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His catch: on the desktop you can send the next message while one runs —
it queues, runs after the first finishes, and you can send a queued one
yourself. The phone app makes you wait until the task ends. That asymmetry
is the bug. What exists today (do NOT rebuild): the chat input + session
handling, the H5.1 task/scheduler shape, the mobile-app relay design
(mobile-app-spec.md §12–14). The desktop behaviour exists informally —
THIS batch makes it a real, visible feature on the desktop AND builds the
same queue for the phone. Build after 7.11.

## 1. The queue — `messageQueue` in appState, per session

- `messageQueue`: one queue per session, stored in `appState` (never
  local-only UI state — the relay/phone reads it, per the 7.2b phone-mirror
  rule). Each entry: `{ id, text, createdAt, status:
  'queued' | 'sent' | 'deleted' }`.
- `queueMessage(text)` — called when he sends a message while a task is
  running in that session: the message goes into the queue (visible
  immediately), NOT into the running task. Sending while idle still sends
  directly (no queue involved).
- `renderMessageQueue()` — a visible list under the chat input (desktop):
  each entry shows its order number + text + Edit / Delete / "Send now"
  buttons. The list is empty-state clean (nothing shown when the queue
  is empty).
- `processMessageQueue()` — when the running task finishes, the NEXT
  queued message auto-sends into the SAME session as a follow-up (the
  session continues, it is not a new chat). Then the next, one at a time.
- `sendQueuedNow(id)` — "Send now" on a queued message: it reaches the
  agent IMMEDIATELY as a follow-up — the agent handles it after its
  CURRENT step finishes (never mid-step, never interrupting a tool call).
- Edit: tapping Edit on a queued message lets him change the text before
  it sends. Delete: removes it (status 'deleted', kept in history as
  deleted — never silently vanished).
- Session end: un-sent queued messages are NOT lost — they stay queued,
  and when he reopens the session he is offered "2 queued messages —
  send the next one?" (Send / Delete all).

## 2. Phone side — same queue, offline-safe

- The phone app shows the same queue (same state, same order, same
  Edit / Delete / "Send now") — install/send lands on the desktop
  exactly like the 7.2b phone mirror.
- Offline phone: a follow-up typed offline is queued ON THE PHONE and
  syncs when back online (same-WiFi LAN mode included — the queue syncs
  over LAN without internet, per mobile-app-spec §12). The relay holds a
  queued message until the desktop acknowledges receipt — a message is
  never "sent" on the phone side until the desktop has it.
- The phone NEVER auto-sends a queued message on its own — auto-send
  happens on the desktop when the task finishes, in the same session.

## 3. Rules — the queue never stalls work

- A queued message NEVER interrupts the running task, NEVER changes the
  running task's plan, and NEVER blocks the agent from finishing.
- "Send now" waits for the current step, then the follow-up runs — the
  agent does not drop its current step.
- The queue is capped at 20 messages per session (older queued messages
  beyond the cap are refused with a plain message "queue full — wait for
  one to send").

## 4. Settings + i18n

- Settings → Behavior: "Message queue" toggle (default ON), queue cap
  input (default 20).
- Bengali translations for every new string (queue labels, Edit/Delete/
  "Send now", "queue full", reopen offer, offline-sync note).

## 5. Dedupe — do NOT rebuild

The chat input, session handling, H5.1 background tasks, the relay design,
the 7.2b phone-mirror rule — build ON them. No second chat, no second
session store, no second sync. The queue is a small state machine on top
of the existing send path.

## Tests — new file `test-batch-7.12-message-queue.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) sending while a task runs adds to `messageQueue` (status 'queued')
    and does NOT enter the running task; sending while idle sends
    directly;
(b) the rendered queue shows order numbers + text + Edit / Delete /
    "Send now" per entry, and hides itself when empty;
(c) editing a queued message changes its text before it sends; deleting
    one marks it 'deleted' and it never sends;
(d) when the task finishes, the NEXT queued message auto-sends in the
    SAME session (same session id), then the next, one at a time;
(e) "Send now" delivers the message as a follow-up AFTER the agent's
    current step (assert the follow-up is handled after the step
    completes, not mid-step);
(f) un-sent queued messages survive a session close + reopen and are
    offered ("send the next one?" / "delete all");
(g) the queue state lives in `appState` (phone-readable) — never
    local-only UI state;
(h) the 20-message cap refuses the 21st with the "queue full" message;
(i) the offline-sync shape: a queued message is marked sent on the phone
    side ONLY after the desktop acknowledges receipt;
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
