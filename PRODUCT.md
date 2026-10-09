# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: people sizing Teodor up for an opportunity.** Recruiters, hiring managers, founders and engineering leads who land on the homepage, `/cv/` or a shared post and need to decide quickly whether he is worth a conversation. They are evaluating, not browsing: who he is, what he builds, how senior he is, and how to reach him.

**Secondary: fellow engineers.** Practitioners who arrive from search or a share looking for how someone actually built or fixed something in AI-assisted engineering or a homelab. Their trust in a post is also evidence for the primary reader.

## Product Purpose

The personal site and blog of Teodor Kurtev, Senior Applied AI Software Engineer, at `teodorkurtev.com`. It exists to establish his reputation in applied AI engineering and to bring in opportunities: roles, consulting, talks and collaborations.

Success means a visitor leaves convinced that he ships reliable AI features and agentic workflows, and knows how to contact him or download his CV.

## Positioning

A practitioner's record, not a portfolio of claims. The writing shows first-hand builds with real numbers, real failures and the decisions behind them (homelab audits with item counts, contrast ratios before and after, deploys that failed first). That depth, plus 10+ years of full-stack work and engineering leadership, is what a generic "AI engineer" site can't truthfully copy.

Content stands on **two equal pillars**: AI-assisted engineering (Claude Code, agentic workflows, LLM evals, tooling) and homelab and self-hosting (Unraid, the media stack, MCP servers). Other topics, such as the balcony garden draft, are occasional extras that should not dilute the two pillars.

## Operating Context

- Visitors reach the site through LinkedIn, GitHub, shared post links, search and the RSS feed (`/feed.xml`).
- The evaluation path is homepage pitch → highlighted roles → `/cv/` → contact or CV download.
- The CV ships three ways from one source (`src/data/cv.ts`): the `/cv/` page, a printed PDF and an ATS-friendly DOCX, all named `Teodor-Kurtev-CV-<year>`. Recruiters may print the page or feed the DOCX to an applicant tracking system.
- Supporting pages: `/now/`, `/uses/`, `/blog/`, `/tags/`.
- Teodor builds and maintains the site with AI coding agents. Posts are drafted with `draft: true` and published by pushing to `master`.

## Capabilities and Constraints

- Static Astro site on GitHub Pages; there is no server or backend.
- URLs are permanent. Post filenames are slugs, old Jekyll routes are redirected, and the misspelled `creating-an-amasing-github-profile` slug stays.
- Content must render and stay usable without JavaScript (covered by the smoke tests).
- Light and dark themes, with system preference as the default.
- The `/cv/` print stylesheet is load-bearing because the PDF is generated from it.
- Anything work-related stays generic: no internal YuLife projects, clients or strategy, on the CV or in posts.
- Analytics is Cloudflare Web Analytics only.

## Brand Commitments

- **Name and role:** Teodor Kurtev, Senior Applied AI Software Engineer at YuLife. The source of truth is `src/data/site.ts`.
- **Voice (taken from the published posts):** first person, candid and practical. Concrete numbers over adjectives. Says plainly where things went wrong. Uses the odd emoji. Calls AI "a multiplier, not a replacement": the decisions and taste are his.
- **Contact:** the personal Gmail address in `site.ts`, never the work address.
- **Assets:** bio photo (`public/assets/images/bio-photo.jpg`, `src/assets/bio-photo.jpg`) and generated OG cards per page and post.
- **Writing rule:** no em dashes in site copy.

## Evidence on Hand

- CV data covering roles, education, skills and volunteering in `src/data/cv.ts`, with the most recent roles flagged `highlight: true`.
- Published posts in `src/content/blog/`. They include real metrics, for example the Usenet post's indexer and backlog counts and the rebuild post's build-size and contrast numbers.
- Public profiles: GitHub (`Teodor92`), LinkedIn and Stack Overflow.
- **Missing, so never invent them:** testimonials, client logos, employer case studies, talk listings, press mentions, follower or traffic numbers.

## Product Principles

1. **Evaluation first.** Within seconds an evaluator should be able to tell who he is, what he builds, how senior he is and how to reach him or get the CV.
2. **Show, don't claim.** Credibility comes from first-hand work with real numbers and honest stumbles, never from superlatives.
3. **Two pillars, one person.** AI engineering and homelab work should read as one practitioner's practice, not two separate sites.
4. **Permanent and portable.** URLs never break, and the CV works as a page, in print and in an ATS.
5. **Keep work generic.** The employer is named, but work internals never appear.

## Accessibility & Inclusion

- WCAG AA contrast in both themes. Text on a bright fill always uses the dark on-fill colour.
- Keyboard and skip-link navigation, no horizontal overflow at 320px, and full readability without JavaScript. The Playwright smoke suite covers all of these.
