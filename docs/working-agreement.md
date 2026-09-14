# Working Agreement

Detailed project policies referenced by `AGENTS.md`. These rules were carried forward from the newer agent setup in
`TolongLabs/codenection-dev` and retargeted to Layak's deployed product and existing repository shape.

## How To Work

Proceed without asking when a sensible default exists: library choice inside the current stack, file placement inside
the current layout, naming, tests, types, documentation, or a fix directly caused by the code being changed. State any
assumption that materially affects the result.

Stop and ask only when:

1. A privacy, security, legal or contractual boundary is at risk.
2. The change would break working behavior and no compatible path is available.
3. A required lint, build or test check fails and cannot be repaired in scope.
4. Two requested outcomes genuinely conflict.
5. A credential, external account or consequential product decision is missing.
6. The work would change Layak's concept, eligibility policy or demo claim beyond what the team authorized.

Ready means the requested behavior works and proportionate checks pass. Cut scope when a deadline is tight; do not cut
verification or quietly lower the truthfulness of a claim.

## How To Report

- Lead with what changed or what is true now.
- Keep ordinary updates to three to five sentences; add detail only when a failure needs diagnosis.
- Say whether a human action remains.
- Paste an important error verbatim, then explain it in plain language.
- Report what was verified, not what a tool merely claimed to have done.

## CLI First

Prefer reproducible command-line workflows: `gh` for GitHub, `pnpm` for the frontend workspace, `uv` for Python,
Playwright for the deployed app and `ffmpeg`/`ffprobe` for media. If a required CLI is absent, say so and give the
install command instead of routing a teammate through a dashboard.

Use a browser for tasks that genuinely require a browser. Headless Playwright is appropriate for the public deployed
app and repeatable demo captures. Never enter passwords, card data, API keys or real citizen data for someone else.

## Code Style

- Frontend: TypeScript, no `any`, single quotes, no semicolons, no trailing commas and 120-character lines. Prettier
  formats; ESLint decides correctness.
- Backend: Python 3.12, type boundaries where useful, Ruff formatting/lint rules and a 120-character line length.
- Validate external input at API boundaries. Do not wrap ordinary internal framework calls in broad exception handlers.
- Comments explain non-obvious reasons, constraints or provenance. Do not narrate obvious code.
- Changes are surgical. Do not reformat or refactor unrelated code.

## Documentation Hygiene

- Use Title Case for headings, table headers, UI navigation, buttons, form labels, modal titles and card titles.
- Use sentence case for prose, helper text, placeholders, tooltips, errors, empty states and toasts.
- Write forward-looking documentation. Do not turn active docs into a chronological work log.
- Preserve measured figures, citations, limitations and links when editing.
- Keep paragraphs readable. Prefer a table when three or more repeated labeled facts need comparison.
- Do not create a second document that overlaps an existing source of truth. Update the existing file.
- Do not reformat received source material or vendored skills merely for house style.
- Keep paths machine-independent. Never commit `/home/<name>/...`, `C:\Users\...` or scratch-directory references as
  project instructions.

`docs/README.md` is the product and reviewer landing page. Keep high-level architecture and setup there. Put
implementation-level operational detail in the nearest focused document, such as `docs/agent-tooling.md` or
`scripts/demo/README.md`, and link it rather than duplicating it.

## Design Standards

Anything a citizen or investor sees must look deliberate and product-specific. A competent but templated screen is not
finished.

Avoid common generated-design tells:

- warm cream, default serif display type and terracotta used without product rationale;
- near-black surfaces with a single acid accent used as a substitute for hierarchy;
- generic purple-to-blue gradients on white;
- centering every section or using the same large radius on every surface;
- decorative rails, numbered markers or state chips that carry no information;
- glass effects without a real depth model;
- dark dashboards with decorative charts that have no supporting data.

Structure must mean something. Numbering indicates order, state chips indicate state, and dividers separate real
groups. UI copy follows the casing rules in Documentation Hygiene.

For material frontend design work:

1. Establish the design read with `design-taste-frontend`.
2. Reuse the existing tokens and interaction vocabulary.
3. Execute targeted improvements with `impeccable` when it applies.
4. Run `impeccable critique` and address or consciously decline each finding.
5. View the result at the real demo viewport and check rendered Title Case.

Do not add AI-generated imagery by default. When raster art materially improves the product or pitch, use the image
generation capability with explicit art direction, then resize and optimize it before committing.

## How Work Ships

`main` receives changes through a reviewable branch and pull request:

1. Branch as `<type>/<short-slug>`.
2. Commit as `<type>[scope]: <imperative description>` with no trailing period.
3. Push the branch and open a PR with `gh pr create`.
4. Review the diff and checks, then squash-merge and delete the merged feature branch.

Allowed types are `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style` and `perf`. Do not sweep another person's
unrelated working-tree changes into a commit.

## Critical Do-Nots

- Do not commit `.env`, keys, tokens, real identity documents or real citizen records.
- Do not force-push, rewrite published history, use destructive resets or push directly to `main`.
- Do not replace deterministic eligibility or amount rules with an LLM judgment.
- Do not publish a number or eligibility claim without its rule-backed source and limitation.
- Do not state or imply that Layak submits an application; packets are drafts for citizen review.
- Do not use real user data in fixtures, screenshots or the demo video.
- Do not commit generated `.mp4`, `.webm`, `.wav`, `.srt` or demo scratch output.
- Do not hardcode a contributor's absolute filesystem path.
- Do not reorganize the legacy `frontend/` and `backend/` layout unless migration is the explicit task.
- Do not let two parallel workers edit the same file.
- Do not report a worker result as verified after checking only its exit status.

## Skills, Subagents And Hooks

Skills are optional and selected when their description matches. `pitch-smith` owns investor demo and pitch artifacts;
it does not own product code. Parallel workers receive complete briefs, exclusive file ownership and post-run review.

Detailed skill provenance, update mechanics, hooks, RTK, Graphify, Devin fanout and AGY fallback live in
[`agent-tooling.md`](agent-tooling.md).
