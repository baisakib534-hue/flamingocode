# DevForge — Build Spec (manager's brief for jcode)

Product: **DevForge** — a personal agentic coding studio. Web app FIRST (single-page, dependency-free vanilla JS/CSS, dark Qoder-like IDE), designed so it can later be wrapped as a desktop app around the real jcode engine. It must stay LIGHTWEIGHT — no frameworks, no build step, lazy panels. This repo starts EMPTY: build the complete app in stages, commit after each stage.

## Stage 0 — IDE shell (the base app)
- Dark Qoder-like layout; on narrow screens a bottom tab bar switches Agent / Files / Code / Preview / Browser.
- Left: sessions (new/switch/delete) + virtual file tree (new/delete files, templates: Blank / Landing page / Todo app).
- Center: tabbed editor with line numbers, autosave to the virtual FS.
- Virtual FS in browser localStorage; Preview = iframe srcdoc with the project's CSS/JS inlined; Browser pane = address bar + iframe (caption: full click-agent arrives in the desktop version); Activity log panel.
- Agent chat: OpenAI-compatible chat calls from the browser; the agent writes via fenced blocks — file:<path> (full file content), delete:<path>, browse:<url> — the app applies them, shows compact chips (not raw dumps), logs actions, refreshes preview, and auto-continues up to 3 rounds until a reply has no file blocks. Current files (path + content, capped ~60KB) go into the system context each turn. Working indicator with elapsed seconds. Example prompt chips.
- Starter providers (all editable in Settings): 9router (default; base https://ninerouter-zltx.onrender.com/v1, model "9router", and a ↻ button that loads the live /v1/models list), DuckDuckGo AI (real duck.ai vqd flow: GET /duckchat/v1/status with header x-vqd-accept: 1 → read x-vqd-4 response header → POST /duckchat/v1/chat, tolerant stream parsing; models gpt-4o-mini / claude-3-haiku-20240307 / meta-llama/Llama-3.3-70B-Instruct-Turbo / mistralai/Mixtral-8x7B-Instruct-v0.1; per-provider CORS proxy-prefix field + friendly CORS error), Pollinations free (https://text.pollinations.ai/openai, model "openai"), Custom.

## Stage 1 — Provider Manager (unlimited custom APIs)
- Users can add/edit/delete UNLIMITED providers: name, type (OpenAI-compatible / Anthropic / DuckDuckGo / Ollama), baseUrl, apiKey (optional), default model, auth style (Bearer / x-api-key / none), custom headers (JSON), per-provider proxy-prefix field, streaming on/off toggle.
- One-click presets: 9router (base https://ninerouter-zltx.onrender.com/v1, model "9router" — keep the existing baked-in default key), OmniRoute Cloud (https://omniroute-main-9nt1.onrender.com/api/v1, model "qoder"), OmniRoute Local (http://localhost:20128/v1, model "qoder"), Pollinations free, OpenRouter, Groq, DuckDuckGo AI.
- Per-provider "Test connection" button: GET /models + a 1-token chat ping, result in plain language.
- Any provider+model can be set active globally or per agent.

## Stage 2 — Anti-stuck compatibility layer (the moat)
Every known custom-API failure in Cursor/Cline/Continue-class tools, fixed preemptively:
1. Base-URL normalizer: trim trailing slash, strip a pasted trailing "/chat/completions", collapse accidental double "/v1/v1"; on 404 retry the alternate /v1 placement once.
2. Streaming auto-fallback: try stream → on error/broken SSE retry non-stream (and vice versa); tolerant SSE parser (spacing variants, [DONE], keep-alive comments, delta.content as string OR array).
3. Reasoning-model guard: agent calls never send max_tokens below 4096; if finish_reason=length with empty content, auto-retry with 4x tokens.
4. Empty-response retry: up to 3 attempts with backoff (some upstreams return empty ~50% of the time).
5. Param-scrub ladder: on HTTP 400 naming an unsupported parameter (temperature, top_p, response_format, …), drop optional params and retry stepwise.
6. Context guard: estimate tokens before sending; over budget → summarize older turns, send full content only for recently-changed files, signatures (tree + head) for the rest. Per-model context-window setting (default 128k), editable.
7. Watchdog: 120s request timeout + 30s stream-idle timeout, visible elapsed timer and Cancel button; a stuck request must never freeze the UI.
8. 429 handling: honor Retry-After with a visible countdown, then auto-resume the agent loop.
9. History hygiene: strip reasoning/thinking blocks and null-content messages from replayed history (prevents turn-2 400s).
10. Auth/CORS help: on network TypeError show a targeted hint + the provider's proxy-prefix field; on 401/402/403 show the plain meaning (bad key / no balance / not permitted) — never retry those blindly.
11. Model fetch fallback: if /models fails, manual model-id entry still works — never block the user.
12. Request log: every call logged (provider, model, status, latency, finish_reason, usage when returned) in the Activity panel.

## Stage 3 — Agents, Teams, Sub-agents (Qoder-like)
- Agent library: create/edit/delete agents {name, emoji avatar, role/system prompt, provider+model, attached skill packs, plugin packs, MCP server list, temperature}.
- Built-in "Dev Team" preset: Senior Developer (lead), Frontend Dev, Backend Dev, QA Tester — each with a real role prompt.
- **Single mode**: pick ONE agent/model, prompt it, it works alone (the normal flow).
- **TEAM MODE (the user's own design — implement faithfully)**:
  - Roster: the user adds ANY number of agents to the team, each bound to any connected provider+model; one agent is designated **Senior Developer**.
  - Flow: (1) The user gives ONE prompt. (2) **Discussion round**: the agents exchange short messages in a visible team chat — they propose how to split the work; the Senior finalizes a **task board** (task → owner agent). (3) **Execution**: agents complete their tasks (independent ones in parallel, dependent ones in order); a finished agent goes **idle** and posts its output to the board. (4) **Presentation**: each agent presents its own piece one by one (what it built/changed). (5) **Testing**: the team tests the result (the Stage 5 test: steps + console-error sweep). (6) **Senior review**: the Senior inspects every agent's work and the test results; for each bug or wrong piece it names the owner and the exact fix, and that agent **reworks** it — loop until the Senior approves (cap 3 review rounds, then escalate to the user with a summary). (7) **Final report** by the Senior: what was built, who did what, test results, anything left.
  - UI: team panel showing the task board (task, owner, status: working / idle-done / in-review / rework / approved), the team-chat transcript, and per-agent status chips.
  - File writes still go through the single file:/delete:/browse: protocol; a snapshot is taken before team execution (Stage 6) so rework is always safe.
- Sub-agents: any agent may emit spawn:<AgentName> with a task; the app executes it as a nested call with that agent's model and returns the result into context; nested activity shown as cards.
- The software creates agents too: "Auto-create agent" (describe a need → current model generates the full agent definition) and agent-proposed agents via an agentdef: block that the user approves with one tap before saving.

## Stage 4 — Skills / Plugins / MCP library
- SKILL PACKS (instruction bundles injected into the system prompt of any agent they're attached to). Ship these built-ins, written like real senior-dev playbooks, NOT generic filler:
  - "No AI Slop" (real content, consistent design system, no lorem ipsum, no purple-gradient clichés, no placeholder boxes)
  - "Senior Frontend", "Testing & QA Discipline", "Security Review", "Performance", "Accessibility", "API Design", "Debugging Discipline", "Git Workflow"
- Users can create their own skill packs (name + instructions) and import pasted ones.
- PLUGIN PACKS (behavior pipelines that run as extra steps): "Auto-Test after build", "Console-error sweep", "Changelog writer", "Format & tidy".
- MCP registry: per-agent list of MCP servers {name, transport, command/url, enabled}. In the web version these are declared and their purpose is summarized into the agent's context; real MCP execution arrives with the desktop/jcode engine — label this honestly in the UI.

## Stage 5 — Self-testing (Trae-style, inside the preview)
- The agent can emit test: blocks: a JSON list of steps run inside the preview iframe (same-origin srcdoc): click (selector), type (selector, text), drag (from, to — real pointer/mouse event sequence), slide/swipe, scroll, wait, assert (selector exists / text contains). Every step logs pass/fail; console errors from the iframe are captured (injected listener) and reported.
- "Auto-Test" plugin: after each build, smoke-test = click every button/link, fill inputs with sample text, collect console errors; failures go back to the agent for a fix round (cap 2).

## Stage 6 — Extras (manager's additions)
- Snapshots: every agent edit round snapshots the virtual FS; one-click restore per snapshot.
- Changes panel: files changed per round, viewable.
- Slash commands in chat: /build /fix /test /review /explain.
- Session token meter (from usage fields when returned).
- Project export/import as JSON.
- Rename the app branding to **DevForge** everywhere (header, title).

## Quality bar (non-negotiable)
- No AI slop in the product itself or in what its agent produces by default: the "No AI Slop" pack is attached to the built-in agents by default.
- Every stage: self-review the code once before committing (you are the dev team: architect → implement → review → test).
- Keep the whole app in ONE self-contained page (plus README), vanilla JS only, fast on a phone.

## Working method
- Repo layout: /index.html (the app), /README.md, /SPEC.md (this file).
- Commit after each stage with a clear message. Do not rewrite earlier stages unless a bug requires it.
- After all stages: a final report listing what works, what is stubbed for the desktop version, and any known issues.
