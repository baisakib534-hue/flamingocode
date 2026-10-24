# FlamingoCode — Autonomy Spec (his order, 2026-10-24 ~12:21 +06)

## The problem he named
Codex, Qoder, Claude Code: skills, plugins and MCPs sit idle unless the
user @mentions them or explicitly tells the tool to use them. That is
NOT how FlamingoCode works.

## The rule (non-negotiable)
**FlamingoCode is autonomous by default.** On EVERY task, the AI itself
decides which skill, plugin or MCP is needed, where it is needed, and
uses it — without being told, without @mentions, without the user
knowing the names of the tools. The same rule binds **sub-agents**: a
spawned agent inherits the full catalog and the mandatory-use rule, and
can invoke skills, plugins and MCP tools on its own.

## How it is enforced (not just a wish)
1. **Catalog injection:** at session start the full installed catalog
   (names + trigger conditions + what each tool does) is injected into
   the agent's working context. It is always present, never opt-in.
2. **Mandatory tool-match step:** before acting on any task, the agent
   MUST list which installed skills/plugins/MCPs apply to this task and
   use them. "No tool applies" is only valid for trivial tasks, and the
   agent must say so in one line.
3. **Sub-agent inheritance:** every spawn template embeds the catalog +
   the mandatory-use rule. A sub-agent that cannot see a tool cannot
   use it — so the catalog travels with every spawn.
4. **Pre-commit gate:** no work is called done until the mandatory
   checks ran: testing-qa (tests pass), security-review (no secrets,
   no injection holes), and the relevant domain skill for the change.
5. **Transparency:** the UI shows, per task, which skills/plugins/MCPs
   the agent actually used — so the user can see the autonomy working.

## Mandatory pre-installed set (from the jcode pack — MUST be used)
Skills: no-ai-slop, senior-frontend, testing-qa, security-review,
performance, accessibility, api-design, debugging-discipline,
git-workflow. MCPs: context7 (docs), playwright (browser testing),
sequential-thinking (hard problems). These ship installed in the
product; they are not optional downloads.

## NEW skills for vibe-coding development (added by this spec)
- **vibe-coding-orchestrator** — the loop: understand → plan →
  scaffold → build in slices → test → fix → polish; never claim done
  with tests failing.
- **human-dev-sense** — develop like a human dev: edge cases, empty /
  error / loading states, UX judgment, good naming, consistency,
  no over-engineering.
- **test-first** — write the check before the code; red → green →
  refactor; happy path + edge paths.
- **design-taste** — visual judgment: spacing scale, type hierarchy,
  colour discipline, anti-slop rules (no generic purple gradients,
  no cookie-cutter hero).
- **backend-craft** — data modelling, API design, auth, errors,
  migrations, observability.
- **ship-ready** — deployment discipline: env handling, build checks,
  CI basics, rollback, changelog.

## NEW MCPs (added to the build environment, then mirrored in-product)
- **github** — repo ops: issues, PRs, branches, file ops.
- **memory** — persistent knowledge-graph memory across sessions.
- **fetch** — fetch docs/pages the agent needs while building.

## NEW plugin packs (product runtime library, added in a later stage)
Component pack (forms, tables, charts, modals), auth pack, payments
pack, AI-integration pack (provider-agnostic client), i18n pack,
analytics pack. Each pack = ready-made, human-quality code the agent
drops in instead of generating from scratch.

## The promise
Whatever the user says — one line or a paragraph — FlamingoCode
develops it the way a good human dev team would: it plans, picks the
right tools by itself, builds, tests, fixes, and ships. The user never
has to name a tool.
