# AGENTS.md

Canonical project instructions for Layak. `CLAUDE.md` points here; repository-local skills live in `.agents/skills/`
and Claude Code discovers them through `.claude/skills/`.

## Product

Layak is an agentic AI concierge for Malaysian social-assistance schemes. A citizen supplies an IC, income proof and a
utility bill, or uses manual entry. The system evaluates deterministic scheme rules, grounds explanations in source
documents, ranks the likely annual upside and prepares draft application packets. The live product is
`https://layak.vercel.app`.

Treat the current repository structure as intentional legacy shape. Improve it surgically; do not move `frontend/`,
`backend/`, root configuration or assets into a newer template unless the task explicitly requests a migration.

## Layout

| Path              | Owns                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| `frontend/`       | Next.js 16, React 19, TypeScript, Tailwind CSS and Firebase client integration       |
| `backend/`        | Python 3.12, FastAPI, Google ADK, deterministic rule modules, RAG and PDF generation |
| `assets/`         | README and product imagery                                                           |
| `scripts/demo/`   | External Playwright, TTS and ffmpeg walkthrough tooling; nothing here ships to users |
| `.agents/skills/` | Canonical cross-agent skill library                                                  |
| `.claude/`        | Claude Code agents, skill links, permissions and hooks                               |

Read `frontend/AGENTS.md` before changing frontend code. Next.js 16 differs from older versions, so consult the bundled
guide in `frontend/node_modules/next/dist/docs/` for framework-specific behavior.

Detailed skill provenance, hook behavior and optional CLI setup live in [`docs/agent-tooling.md`](docs/agent-tooling.md).
Demo installation and rendering details live in [`scripts/demo/README.md`](scripts/demo/README.md).
The project overview is [`docs/README.md`](docs/README.md); investor product, requirements and architecture
details live in [`docs/PRODUCT.md`](docs/PRODUCT.md), [`docs/PRD.md`](docs/PRD.md) and [`docs/TRD.md`](docs/TRD.md).
The full working policies—including Documentation Hygiene, Design Standards, How Work Ships and Critical Do-Nots—live
in [`docs/working-agreement.md`](docs/working-agreement.md). Read the relevant section before work it governs.
The standing simplicity and surgical-change reference is [`docs/coding-guidelines.md`](docs/coding-guidelines.md).

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build

cd backend && uv sync --extra dev
cd backend && uv run ruff check .
cd backend && uv run pytest
cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Use `rtk` as the command prefix when it is installed. Never commit `.env`, credentials, generated demo media, local
virtual environments or build output. `.env.example` contains names and public defaults only.

## Engineering Rules

- Make surgical changes. Preserve working behavior and avoid unrelated cleanup.
- Frontend formatting is Prettier: single quotes, no semicolons, no trailing commas, 120-character lines. ESLint is
  authoritative for frontend diagnostics.
- Backend formatting and linting use Ruff with a 120-character line length. Validate untrusted input at API boundaries.
- Preserve deterministic eligibility and amount calculations. Generative models may explain or orchestrate, but must
  not silently replace rule-backed decisions or citations.
- Use synthetic personas and documents for demos and tests. Do not expose real citizen data.
- Do not claim that Layak submits applications. Generated packets are drafts for the citizen to review and submit.
- Fix code already in scope when a check exposes a directly related defect. Ask only when a credential, external
  account or product decision is genuinely required.

## Demo Standard

The investor walkthrough must show a real end-to-end outcome, not a feature inventory. Prefer the stable guest/demo
flow, keep runtime between 60 and 120 seconds, and make the on-screen action agree with the narration. The voice and
burned subtitles must come from the same scheduled text. Export generated media outside the repository.

`scripts/demo/` was ported from `TolongLabs/codenection-dev/scripts/demo`, which declared an earlier same-team origin.
Keep that provenance in its README when changing the harness.

## Git Workflow

Work on a conventional branch such as `feat/<slug>`, `fix/<slug>` or `chore/<slug>`. Use a conventional commit subject,
push the branch, open a reviewable PR and squash-merge it into `main`. Do not force-push or commit directly to `main`.

Before reporting completion, inspect the diff, run checks proportional to the change and verify artifacts directly.
An exit code is not proof when the expected file or user-visible result was not inspected.
