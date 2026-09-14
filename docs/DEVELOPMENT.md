# Documentation Development

## Prerequisites

- Node.js 24
- pnpm 10

## Setup

```bash
pnpm install
```

The repository installs only Prettier, Husky, and lint-staged. It has no application runtime dependencies.

## Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `pnpm run format:check` | Check editable Markdown, HTML, JSON, YAML, and CSS |
| `pnpm run format`       | Format editable documentation files                |
| `pnpm exec lint-staged` | Format staged documentation using the same rules   |

## Protected Artifacts

Do not reformat or regenerate these files during routine documentation work:

- `source/**`, which contains received organizer material;
- `demo/**/*.html`, which contains presentation and document-rendering sources whose byte identity is preserved;
- PDFs and images; and
- historical binary evidence under `research/ideas/finalists/`.

The Prettier ignore file enforces these boundaries.

## Contribution Rules

1. Update the existing canonical document instead of creating overlapping copies.
2. Preserve figures, citations, limitations, and historical decisions.
3. Use Title Case for headings, bold lead-ins, and table headers.
4. Keep local links repository-relative and verify them after moving files.
5. Run `pnpm run format:check` before committing.
6. Use a Conventional Commit subject such as `docs: clarify investor narrative`.

## Presenting The VC Deck

Open [`layak-vc-1337-2026-09-15.html`](demo/deck/layak-vc-1337-2026-09-15.html) in a desktop browser. The deck uses
local assets and embedded copies of the original deck’s fonts, so its slides work offline. Product and source links still require internet access.
Use arrow keys or Page Up / Page Down to navigate, Home / End to jump, and F for fullscreen. Present slides 1–9,
then press End to close on slide 13. Slides 10–12 are Q&A backup: A opens the stack, B the numbers, and C the
alternatives. End returns to the closing slide.

The matching [PDF](demo/deck/layak-vc-1337-2026-09-15.pdf) is the offline presentation fallback. The
[three-person script](demo/scripts/vc-1337-2026-09-15.md) owns speaker timing, demo cues, rehearsal guidance, and claim
sources. Keep the deck, PDF, and script together when sharing presentation materials.

For an explicitly requested revision, edit the VC HTML, then export it through Chrome's print dialog using Save As
PDF, background graphics enabled, headers and footers disabled, and the CSS-defined 16:9 page size. Verify 13 pages,
readable text, and no clipping before replacing the VC PDF. Preserve the separate historical hackathon artifacts.
