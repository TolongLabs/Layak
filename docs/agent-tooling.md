# Agent Tooling

Detailed reference for the agent layer ported from `TolongLabs/codenection-dev`. `AGENTS.md` stays deliberately short
and points here when an agent needs operational detail.

## Repository Shape

Layak predates the source repository's current layout. The port preserves Layak's application structure:

| Area           | Location          | Tooling Consequence                                             |
| -------------- | ----------------- | --------------------------------------------------------------- |
| Frontend       | `frontend/`       | Run Next.js, ESLint and TypeScript through the frontend package |
| Backend        | `backend/`        | Run Python tools through the backend's `uv` environment         |
| Shared root    | repository root   | pnpm workspace, Husky, deployment config and project docs       |
| Agent skills   | `.agents/skills/` | Canonical cross-tool copies                                     |
| Claude adapter | `.claude/`        | Symlinks, agent profiles, permissions and hooks                 |
| Demo tooling   | `scripts/demo/`   | Playwright, TTS and ffmpeg installed outside app dependencies   |

Do not reorganize application code merely to match a newer repository. A structure migration is a separate change with
its own test and deployment risk.

## Skill Layout

`.agents/skills/` is canonical. Most entries in `.claude/skills/` are relative symlinks into it so skill updates do not
diverge between tools. `impeccable` remains a real directory under `.claude/skills/` because its hook is wired there.

`skills-lock.json` records the upstream source and content hash for reinstallable skills. The seven `hackathon-*`
packages and `claude-in-chrome` are preserved vendored copies; see `.agents/skills/VENDORED.md` before updating them.

To add a selected skill without pulling an entire upstream collection:

```bash
pnpm dlx skills add <owner/repo> -a claude-code -s <skill> -y
```

Move the installed directory into `.agents/skills/`, then create the matching relative link in `.claude/skills/`.
After an update, verify every link resolves and that `.claude/skills/impeccable/scripts/hook.mjs` exists.

## Claude Code Hooks

`.claude/settings.json` wires four small hooks. Internal hook errors exit successfully so a broken informational check
does not wedge a session.

| Hook               | Event            | Purpose                                                                  |
| ------------------ | ---------------- | ------------------------------------------------------------------------ |
| `session-brief.sh` | Session start    | Reports branch, dirty-file count and the main verification commands      |
| `env-drift.mjs`    | Session start    | Compares key names and public defaults without printing secret values    |
| `guard-git.sh`     | Before Bash      | Blocks direct or forced pushes to `main` and attempts to add `.env`      |
| `format-edited.sh` | After edit/write | Runs Prettier, frontend ESLint fix or backend Ruff format when available |

The settings file is strict JSON. Keep secrets unreadable while allowing `.env.example`, which agents need for config
drift and documentation work.

## RTK

RTK is an optional token-reducing command proxy. When `rtk` is installed, prefix shell commands with it:

```bash
rtk git status
rtk pnpm lint
rtk uv run pytest
```

Use the raw command only if RTK cannot represent a compound `find` predicate or another uncommon flag. Useful checks:

```bash
rtk --version
rtk gain
rtk gain --history
```

RTK does not replace the git guard. The guard inspects the full command string and still blocks protected pushes.

## Graphify

Graphify is optional and useful for architectural questions once the codebase has enough connected code to justify an
index. Prefer ordinary `rg` searches for a small or file-local question.

```bash
graphify init
graphify build
graphify query "where eligibility decisions become result cards"
```

Do not commit Graphify's local database or machine-specific paths.

## Devin Fanout

The global `devin-fanout` skill dispatches independent mechanical chunks to Devin CLI workers. Model availability and
pricing change, so list models before dispatch. The current preferred free worker is `swe-2-max` when available.

Each worker gets a prompt file, its own log and exclusive output paths. Headless runs require one-time interactive trust
for the repository. Verify expected files and grep logs for rejected tool calls; Devin can exit successfully without
making the requested edits.

```bash
devin doctor
devin models list
devin --model swe-2-max --permission-mode accept-edits \
  --respect-workspace-trust false --prompt-file <brief> -p > <log> 2>&1
```

Keep external inputs inside a temporary ignored workspace directory for `accept-edits` runs. Remove prompts, logs and
staged inputs after review.

## AGY Fallback

If Devin cannot start, `agy` is the headless fallback. Use an explicit model, edit-accepting mode and permission bypass
only for a scoped prompt whose authorized outputs are named precisely:

```bash
agy --model gemini-3.8-flash-high --mode accept-edits \
  --dangerously-skip-permissions --print-timeout 20m -p='<scoped work order>'
```

Review AGY output exactly as worker output: inspect the diff, look for stray files, run project checks and validate the
artifact instead of trusting the agent's summary.

## Provenance

The skill library, Claude agent profile, hook suite and this reference were ported from
`TolongLabs/codenection-dev`. The demo harness has its own more detailed provenance declaration in
`scripts/demo/README.md`. Retargeted files must describe Layak's current product and tools; historical competition rules
from the source repository do not govern this project.
