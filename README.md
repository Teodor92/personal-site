# Personal Website - Teodor Kurtev

My personal site at [teodorkurtev.com](https://teodorkurtev.com) — built with [Astro](https://astro.build) and deployed to GitHub Pages via GitHub Actions.

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve the built site locally
npm run check     # type-check .astro files and content schemas
```

## Structure

- `src/content/blog/` — blog posts (markdown; filename = URL slug)
- `src/data/cv.ts` — CV data rendered at `/cv/` and on the homepage
- `src/data/site.ts` — site metadata, socials, analytics id
- `src/pages/` — routes, including `uses.md` and `now.md`
- `public/` — static assets served verbatim (images, CNAME, favicon)

Commits follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint via husky.
