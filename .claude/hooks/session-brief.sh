#!/usr/bin/env bash
# SessionStart: one-line orientation. Exits 0 on internal failure.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[[ -d "${root:-}" ]] || exit 0
cd "$root" || exit 0

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

echo "Layak | branch=$branch | uncommitted=$dirty | live=https://layak.vercel.app"
echo "Checks: pnpm lint && pnpm build; backend: uv run ruff check . && uv run pytest"
echo "Structure and agent tooling: AGENTS.md and docs/agent-tooling.md"
