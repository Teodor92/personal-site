# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run check     # astro check — type-checks .astro files and content schemas
npm run lint      # eslint (flat config, correctness rules only — Prettier owns style)
```

There is no test suite. CI (PRs) runs prettier --check, lint, check and build; the pre-commit hook runs prettier --write and eslint on staged files.

## Architecture

- **Content collection**: blog posts live in `src/content/blog/*.md`, schema in `src/content.config.ts`. **Filenames are URL slugs** and two of them intentionally preserve old Jekyll URLs — `creating-an-amasing-github-profile.md` keeps its historical misspelling; do not rename existing post files.
- **CV as data**: `src/data/cv.ts` holds roles/education/skills/volunteering, rendered by `src/pages/cv.astro`. Roles flagged `highlight: true` also appear on the homepage. Edit the data, not the markup. Two download artifacts are generated at build time and not committed: `scripts/generate-cv-pdf.mjs` prints the built `/cv/` page with headless Chromium to a PDF, and `scripts/generate-cv-docx.ts` composes a DOCX from the data itself (Word styles + real bullets, for ATS parsers) — never from the HTML. Both are named `Teodor-Kurtev-CV-<current year>.{pdf,docx}` via `src/data/cv-filename.mjs` (shared with `cv.astro` so the links always match). Both run after `astro build` in the deploy workflow, so they ship in every Pages artifact.
- **Site metadata** (name, role, socials, GA id, avatar path): `src/data/site.ts`.
- **Theming**: CSS custom properties in `src/styles/global.css` (`:root` light, `[data-theme='dark']` overrides). The theme is set pre-paint by an `is:inline` script in `src/layouts/Base.astro` — keep that inline or dark mode will flash. `ThemeToggle` dispatches a `theme-change` window event that `Comments.astro` listens to.
- **Comments**: `src/components/Comments.astro` is a giscus embed that renders nothing until `repoId`/`categoryId` are filled in (requires enabling GitHub Discussions + the giscus app).
- **URL conventions**: everything is served with trailing slashes (`build.format: 'directory'`); write internal links with trailing slashes. Old Jekyll routes (`/tags/`, `/categories/`, `/year-archive/`, `/sitemap.xml`) are redirected in `astro.config.mjs`.
- **RSS**: `/feed.xml` (`src/pages/feed.xml.js`) — the same path Jekyll used; don't move it.

## Commit convention

Conventional Commits enforced by a husky `commit-msg` hook running commitlint. Allowed types are restricted in `commitlint.config.cjs`: `feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `revert`, `perf`, `vercel`.
