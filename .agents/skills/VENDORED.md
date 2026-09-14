# Agent Skills

`.agents/skills/` is the canonical tool-agnostic skill directory. `.claude/skills/` links into it, except for
`impeccable`, which remains a real directory because `.claude/settings.json` invokes its hook by that path.

## Sources

`skills-lock.json` tracks 29 reinstallable skills and their content hashes.

| Source | Skills |
| --- | --- |
| `obra/superpowers` | Development workflow and review skills |
| `Leonxlnx/taste-skill` | Frontend taste, high-end visual design and image-to-code |
| `phuryn/pm-skills` | Market, strategy, segmentation, canvas and value-proposition skills |
| `ailabs-393/ai-labs-claude-skills` | Startup validator |
| `owl-listener/designer-skills` | Jobs to be done |
| `graphify-labs/graphify` | Graphify workflow |
| `mattpocock/skills` | Handoff and bug diagnosis |
| `pbakaus/impeccable` | Impeccable UI workflow |

Source matching was originally performed in `TolongLabs/codenection-dev`; this port preserves its recorded hashes.
`diagnosing-bugs` was a best-effort match to its upstream package and remains the least certain provenance match.

## Untracked Skills

The seven `hackathon-*` skills came from `bernieweb3/hackathon-ai-devkit`, which is no longer reachable. They remain
outside `skills-lock.json` so an update cannot overwrite the only retained copies. Their top-level Layak block overrides
historical event assumptions that remain in the generic body.

`claude-in-chrome` was transcribed from Claude Code's bundled skill and has no standalone upstream package. The bundled
version wins when it is available.

## Updating

Install only the requested skill instead of pulling a full collection:

```bash
pnpm dlx skills add <owner/repo> -a claude-code -s <skill> -y
```

Move the result to `.agents/skills/<name>/`, then create the corresponding relative link in `.claude/skills/`. Confirm
all links resolve, the seven `hackathon-*` skills still contain their Layak override, and
`.claude/skills/impeccable/scripts/hook.mjs` still exists.

## Routing

| Need | Skill Family |
| --- | --- |
| Investor story and demo | `hackathon-demo-script`, `hackathon-wow-detector`, `hackathon-judge-simulator` |
| Scope and prioritization | `hackathon-scope-cutter`, `strategy-red-team` |
| Market and business model | `market-sizing`, `beachhead-segment`, `lean-canvas`, `value-proposition` |
| Product research | `jobs-to-be-done`, `competitor-analysis`, `startup-validator` |
| Frontend quality | `design-taste-frontend`, then `impeccable` |
| Diagnosis and delivery | `diagnosing-bugs`, `requesting-code-review`, `verification-before-completion` |
| Architecture context | `graphify`, when a code graph is materially useful |

`brainstorming` is for shaping a build after the product direction is known; it is not a market-validation substitute.
Use `verification-before-completion` before making success claims from worker output or rendered artifacts.

## Project Overrides

Layak is a deployed product preparing for investor conversations, not an active competition prototype. For any vendored
skill whose body mentions a prior event, the following wins:

- Ground claims in `docs/README.md` and the implementation.
- Optimize for citizen value, trust, distribution, defensibility, operating cost and scale.
- Demonstrate the existing product; do not invent a new concept or rebuild it as a hackathon MVP.
- A short walkthrough is 60–75 seconds unless the current request specifies otherwise.
- Use synthetic demo data and never imply that Layak submits an application on a citizen's behalf.

## Permissions And Hooks

`.claude/settings.json` is strict JSON. It allows normal repository work while denying destructive repository actions
and secret-file reads. `guard-git.sh` is the only blocking hook; the session, environment and formatting hooks are
informational or best-effort. See `docs/agent-tooling.md` for details.
