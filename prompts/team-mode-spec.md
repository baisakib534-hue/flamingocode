# FlamingoCode — Team Mode v2 (his flagship; order 2026-10-24 ~12:28 +06)
His words: "Team Mode-টা ঠিক করে বানিও, ভালো ভালো features দিও —
হয়তো এই জিনিসটা প্রথম আমিই বানাচ্ছি।"
This is FlamingoCode's flagship differentiator. Stage 3 built the base;
v2 makes it complete and unmistakably his.

## HIS ORIGINAL DESIGN (Stage 3, already built — must keep working)
One prompt → agents TALK among themselves and divide the work → each
finishes, goes IDLE, and PRESENTS its piece one by one → they TEST it
themselves → a designated SENIOR DEVELOPER AI reviews everyone's work,
points out bugs, and SENDS THE OWNER BACK TO REWORK until correct →
Senior's FINAL REPORT. UI: task board + team chat + status chips;
discussion/senior-review loops capped.

## v2 FEATURES (added by this spec)
1. **Team templates** — one-click preset teams: Web App Team, API Team,
   Bug Hunt Team, Design Team. Each = roles + models + prompts.
2. **Role presets** — PM, Senior Developer, Frontend, Backend, QA,
   DevOps, Docs Writer. Each role has its own system prompt + skills.
3. **Live team chat panel** — watch the agents discuss in real time;
   the user can jump in mid-discussion with a message that redirects
   the team.
4. **Task board with reassign** — drag a task from one agent to
   another; the team re-plans around the change.
5. **Senior review with diff view** — see exactly what the Senior
   flagged, line by line, and the rework that followed.
6. **Disagreement arbitration** — when two agents disagree, the Senior
   arbitrates and shows the reasoning; the user can overrule.
7. **Parallel / sequential toggle** — agents work all at once, or one
   after another (for dependent tasks).
8. **Auto-team** — the software itself picks the team composition from
   the prompt (autonomy tie-in): it reads the task, chooses roles.
9. **Team memory** — the team's decisions are saved into the Project
   Brain automatically, so the next session remembers.
10. **Cost + time per agent** — each agent's token usage and time
    shown live; a team budget cap the user can set.
11. **Add specialist mid-task** — one click adds a security expert,
    a performance expert, etc., in the middle of a build.
12. **Voting** — agents vote on architecture choices; the user sees
    the vote and the winner.
13. **Human checkpoints** — the Senior asks the user ONLY on big
    decisions (architecture, deleting data, spending money).
14. **Replay + export** — full team session replay, and export the
    transcript as a document.

## EACH MEMBER IS A FULL AGENT (his clarification, 2026-10-24 ~12:32 +06)
YES — exactly. Inside a team, every member works on its own exactly
like single mode: it has the FULL catalog (skills, plugins, MCPs),
the mandatory tool-match rule, and it can spawn its OWN sub-agents
whenever it needs them — without asking, without @mentions. Nobody
waits for tool instructions. The ONLY things that make team mode
different from single mode are coordination (team chat + task board)
and the Senior's review gate. Autonomy is per-agent, not per-team.

## WHY IT IS DIFFERENT
Other tools have multi-agent demos. None of them put the user INSIDE
the team room: watching the discussion live, seeing each piece
presented one by one, with a Senior gatekeeper who refuses to pass
bad work. That combination — IDE + live team room + Senior review
loop — is FlamingoCode's identity. Build it like the flagship it is:
polished, visible, and impossible to confuse with a plain chat.

## QA AGENT REQUIRED (lesson from Autonomy build, 2026-10-24 ~18:22 +06)
The Autonomy pre-commit gate stays BLOCKED on any run where no QA
agent recorded testing-qa (the gate names the missing check instead
of silently passing). Therefore every team template MUST include a
QA agent by default, and Auto-team assembly MUST always assign one —
otherwise teams will hit a permanently blocked gate.
