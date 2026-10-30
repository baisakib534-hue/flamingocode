# UI Polish — FlamingoCode design (my call)

## Context

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this stage.
Vanilla HTML/CSS/JS, no frameworks, no build step.

The owner gave FULL design freedom: copy Qoder's UI, change it anywhere,
or design something completely new — no restrictions. Brand stays:
FlamingoCode name, his flamingo logo, pet flamingo.
Reference: `~/workspace/devforge/qoder-ui-notes.md` (Qoder's layout, theme,
animations — copy as IDEAS, never Qoder's code/logo/brand).

His quality bar: NO AI slop. Genuinely good, professional, cohesive.

## Design direction (follow this)

**Aesthetic:** Dark, calm, professional IDE. Near-black surfaces (#0d1117-ish),
subtle borders (1px, low-contrast), rounded corners (8px cards, 6px inputs),
generous whitespace. NOT neon, NOT gradient-soup, NOT emoji-heavy.

**Brand accents (use sparingly):**
- Flamingo red `#f0513b` — primary actions, active states, logo
- Teal `#2ec4b6` — secondary accents, success, links
- Never both at full saturation in one place. Muted tints for backgrounds.

**Typography:**
- UI: system stack (`-apple-system, 'Segoe UI', Inter, ...`), 13px base
- Code: `JetBrains Mono, Consolas, monospace`, 13px
- Headings: 600 weight, tight letter-spacing. No oversized hero text inside the app.

**Layout (Qoder-inspired, our own):**
- Left: slim activity bar (icons) + collapsible sidebar (file tree, sessions, etc.)
- Center: editor / main content, max-width comfortable, NOT full-bleed chaos
- Right: collapsible assistant/chat panel
- Bottom: status bar (thin, informative — model, branch, tokens, not clutter)
- Top: minimal title bar with breadcrumb, NOT a giant toolbar

**Motion:**
- 150–200ms ease-out transitions on hover/active
- Panel collapse/expand animates (no instant jumps)
- Subtle fade-in for chat messages, NOT bouncy
- Respect `prefers-reduced-motion`

**Light mode:** keep the existing toggle working — polish both themes.

## What to do (in order)

### 1. Design tokens first
Define/extend CSS variables at `:root`:
`--bg-*`, `--surface-*`, `--border-*`, `--text-*`, `--accent-*` (red/teal),
`--radius-*`, `--space-*` (4/8/12/16/24/32), `--font-*`, `--shadow-*`,
`--transition-*`. Dark + light values. Then USE them — no hardcoded hex
in new/changed styles except the tokens themselves.

### 2. Polish the shell
Activity bar, sidebar, title bar, status bar, panels. Consistent padding,
aligned icons (use inline SVG, 16px, currentColor — NO emoji as icons),
readable contrast (WCAG AA for text).

### 3. Polish the chat
Message bubbles with clear user/assistant distinction, code blocks with
copy button + language label, readable line-height (1.6), proper markdown
rendering (headings, lists, tables, inline code). Typing indicator subtle.

### 4. Polish the editor area
Tab bar, breadcrumbs, minimap toggle, line numbers, current-line highlight,
selection color. File tree: indent guides, file icons by type, hover actions.

### 5. Polish dialogs, toasts, cards
One consistent card style. Toasts bottom-right, auto-dismiss, NOT blocking.
Modals centered with backdrop blur, ESC closes, focus trap.

### 6. Remove AI slop
Kill: random gradients, glow effects, oversized emojis in UI chrome,
inconsistent border radii, misaligned elements, placeholder-looking empty
states. Every empty state gets a proper illustration-free message + action.

### 7. Animations where Qoder has them
Sidebar collapse, panel transitions, tab switches, hover states, message
appear. From the Qoder notes — subtle, professional.

## Hard rules
- EVERYTHING must keep working. This is polish, not rewrite.
- `node --check` must pass. Full suite: 0 failures.
- No new dependencies. No frameworks. Vanilla CSS.
- Do NOT touch business logic — styles + structure only. If a structural
  change risks breaking JS, keep the old structure and polish around it.
- Test file: extend `test-ui-polish.js` (create it) — assert tokens exist,
  themes toggle, key panels render, no inline `style=` chaos in new markup.
- Commit: "UI polish: design system + shell + chat + editor + motion".
  Do NOT push (verifier pushes after independent verification).
