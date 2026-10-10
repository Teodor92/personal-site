# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## What this is

An [Astro](https://astro.build) static site — the personal site/blog at `teodorkurtev.com`, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `master`. The custom domain lives in `public/CNAME` and the repo's Pages settings.

## Commands

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # static build to dist/
npm run build:docx # builds the CV .docx from src/data/cv.ts via the docx package (tsx)
npm run build:pdf # renders dist/cv/ to the CV .pdf (needs: npx playwright install chromium)
npm run preview   # serve the built site
npm test          # playwright smoke tests (builds first only if dist/ is empty)
npm run check     # astro check — type-checks .astro files and content schemas
npm run lint      # eslint (flat config, correctness rules only — Prettier owns style)
```

`npm test` is a small Playwright smoke suite (`tests/`, chromium only) covering the print stylesheet the CV PDF depends on, 320px overflow, the skip link, no-JS rendering, post structured data and the active nav cue. Its `webServer` only rebuilds when `dist/` is empty — `astro build` wipes `dist/`, which is also where the generated CV PDF and DOCX live. CI (PRs) and the deploy workflow both run prettier --check, lint, check, build and the tests; the pre-commit hook runs prettier --write and eslint on staged files.

## Architecture

- **Content collection**: blog posts live in `src/content/blog/*.md`, schema in `src/content.config.ts`. **Filenames are URL slugs** and two of them intentionally preserve old Jekyll URLs — `creating-an-amasing-github-profile.md` keeps its historical misspelling; do not rename existing post files.
- **CV as data**: `src/data/cv.ts` holds roles/education/skills/volunteering, rendered by `src/pages/cv.astro`. The homepage career track (`src/components/CareerTrack.astro`) plots every role since 2017: `highlight: true` roles form the full-time main lane, the rest become hatched side lanes, `featured` picks the bullets shown when a role is selected and `trackLabel` overrides the bar label. Each role gets a stable `/cv/#<company>-<start year>` anchor from `roleId()`. Edit the data, not the markup. Two download artifacts are generated at build time and not committed: `scripts/generate-cv-pdf.mjs` prints the built `/cv/` page with headless Chromium to a PDF, and `scripts/generate-cv-docx.ts` composes a DOCX from the data itself (Word styles + real bullets, for ATS parsers) — never from the HTML. Both are named `Teodor-Kurtev-CV-<current year>.{pdf,docx}` via `src/data/cv-filename.mjs` (shared with `cv.astro` so the links always match). Both run after `astro build` in the deploy workflow, so they ship in every Pages artifact.
- **Site metadata** (name, role, socials, Cloudflare Web Analytics token, avatar path): `src/data/site.ts`.
- **Theming**: CSS custom properties in `src/styles/global.css` (`:root` light, `[data-theme='dark']` overrides). The theme is set pre-paint by an `is:inline` script in `src/layouts/Base.astro` — keep that inline or dark mode will flash. That script also sets `[data-theme-pref]` (`light` / `dark` / `system`; no `theme` in localStorage means system), which `ThemeToggle.astro` reads via CSS to pick its icon and label. The look is evolved neo-brutalism, documented in `DESIGN.md` (read it before visual work): ink outlines (`--ink`, `--bw`), hard offset shadows and press-in buttons (`.brutal-btn`) on cream paper. Colour carries meaning only: `--ai` (yellow) marks applied AI and `--lab` (blue) marks the homelab, as an accent (labels, outlines, shadows), never a large fill. Mark items with `.is-ai` / `.is-lab` to set `--fill`. Section headings on the homepage use `Faceplate.astro` (1U rack plate); rack rails appear at 1340px and up. Text on yellow is always `--on-fill`; text on a blue fill is `--on-lab`. The legacy brights (`--yellow`, `--pink`, `--cyan`, `--green`) exist only because post bodies' inline SVG diagrams use them; don't use them in the interface. Fonts: Bricolage Grotesque (display, width axis), Atkinson Hyperlegible Next (body), Atkinson Hyperlegible Mono (dates and data). Code blocks use `--pre-bg` (dark in both themes) because the Shiki theme is `github-dark`.
- **URL conventions**: everything is served with trailing slashes (`build.format: 'directory'`); write internal links with trailing slashes. Old Jekyll routes (`/categories/`, `/year-archive/`, `/sitemap.xml`) are redirected in `astro.config.mjs`; `/tags/` is a real page, not a redirect.
- **RSS**: `/feed.xml` (`src/pages/feed.xml.js`) — the same path Jekyll used; don't move it.

## Commit convention

Conventional Commits enforced by a husky `commit-msg` hook running commitlint. Allowed types are restricted in `commitlint.config.cjs`: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `revert`, `perf`, `vercel`.
