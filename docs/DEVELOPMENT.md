# Documentation Development

## Prerequisites

- Node.js 24
- pnpm 10

## Setup

```bash
pnpm install
```

The root workspace installs the frontend and repository tooling. Backend dependencies are managed separately with
`uv` from `backend/`.

## Commands

| Command                                   | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `pnpm exec prettier --check docs/**/*.md` | Check editable Markdown                      |
| `pnpm exec prettier --write docs/**/*.md` | Format editable Markdown                     |
| `pnpm -C frontend lint`                   | Run frontend ESLint                          |
| `pnpm -C frontend build`                  | Run the production frontend build            |
| `cd backend && uv run ruff check .`       | Run backend lint after dev dependencies sync |
| `cd backend && uv run pytest`             | Run backend tests                            |

## Protected Artifacts

Do not reformat or regenerate these files during routine documentation work:

- `.agents/**` and `.claude/skills/**`, which contain vendored skills and preserved content hashes;
- generated video, audio, subtitle, PDF and image artifacts; and
- nested `demo/`, `research/` and `source/` pitch materials, which remain upstream in `Layak-Pitch`.

The Prettier ignore file enforces these boundaries.

## Contribution Rules

1. Update the existing canonical document instead of creating overlapping copies.
2. Preserve figures, citations, limitations, and historical decisions.
3. Use Title Case for headings, bold lead-ins, and table headers.
4. Keep local links repository-relative and verify them after moving files.
5. Run the relevant formatting, lint, build and test checks before committing.
6. Use a Conventional Commit subject such as `docs: clarify investor narrative`.

See [`AGENTS.md`](../AGENTS.md) for the complete working agreement and repository-specific boundaries.
