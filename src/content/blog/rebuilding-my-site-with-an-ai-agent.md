---
title: 'How I rebuilt my personal site with an AI agent in a day'
description: 'My site ran on the same Jekyll theme since 2019. Then I spent a day rebuilding it with an AI coding agent and shipped it with zero downtime. Here is how it went. 🚀'
pubDate: 2026-08-05T12:00:00+03:00
tags:
  - AI
  - Claude Code
  - Astro
---

The website you're reading this on ran on the same Jekyll theme from 2019 until a couple of days ago. It was fine. It was also, let's be honest, a bit rough: a 200-line CV dumped on the homepage, a stock theme look, and a Ruby toolchain that had quietly stopped working on my machine somewhere along the way. 😅

So I did what I've been doing more and more at work lately: I opened a terminal, started [Claude Code](https://claude.com/claude-code), and said, roughly, _"look at this repo and analyse it."_

A day later the site was rebuilt on [Astro](https://astro.build), redesigned, and live, with zero downtime. This post is about how that actually went: the good bits, the stumbles, and what I'd tell you if you're still on the fence about AI-assisted development.

## How we worked

The flow that emerged felt surprisingly natural:

1. **Brainstorm:** the agent analysed the repo and we talked through options: stay on Jekyll and restyle, swap themes, or rebuild. I picked Astro (I'm a TypeScript person, and with two blog posts to migrate, the switching cost was tiny).
2. **Plan:** it wrote up a proper plan: content model, routes, styling approach, deploy pipeline, a cutover order that never left the site broken, and a rollback story. I reviewed and approved it before a single file changed.
3. **Build:** it scaffolded, migrated, styled and wired everything up, checking in with me at the points that mattered.
4. **Verify and ship:** local builds, URL checks, then a merge that swapped GitHub Pages from a Jekyll branch build to a GitHub Actions deploy, while the old site kept serving until the new one was ready.

Three things genuinely surprised me along the way.

## The speed 🏎️

The whole thing (new stack, new design, landing page, [restructured CV](/cv/), blog migration, dark mode, RSS, sitemap, deploy pipeline) happened in **a day**, in the gaps around normal life. Not a weekend project stretched across a month. A day.

And it kept going after that. The following days added view transitions, a ⌘K command palette, generated social cards, tag pages, an accessibility pass, and a print-friendly CV. Each one was a "hey, could we…" that turned into a shipped feature within the hour.

## The autonomy

I wrote almost none of the code. My actual job was to **make decisions**: which stack, what the homepage should say, whether to keep the blog, which trade-offs I cared about. The agent handled the rest, including the parts I would have hand-waved, like verifying that every old URL still resolved after the migration.

It wasn't unsupervised, though, and honestly that's what made it work. Plan approval before building. Explicit sign-off before any files were moved or deleted (with a full before/after list). A confirmation before anything went live. For me that was the right balance: enough control to feel safe, without babysitting every keystroke.

## The quality details ✨

This is the part I didn't expect. The details I'd normally skip on a personal project (because life is short and it's just my site) all got done:

- **Old URLs preserved exactly**, including [a typo'd blog slug from 2023](/blog/creating-an-amasing-github-profile/) that's now lovingly enshrined forever, because breaking inbound links to fix a typo is a bad trade.
- **Images optimized**: the build dropped from 11MB to 5.9MB; one 1.2MB thumbnail became a 225KB webp.
- **Social cards generated at build time**: sharing a post used to attach a 1.6MB PNG; now it's a branded 51KB card.
- **Accessibility fixed with numbers**: I ran a Lighthouse audit and it flagged low-contrast text. The agent measured the actual [WCAG contrast ratios](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (3.12:1, failing), picked new colours (4.96:1, passing), then scanned every page of the site for the same class of issue and found one more I hadn't noticed.

That last one captures the dynamic well: **I caught the problem, it fixed the problem everywhere.** Neither of us would have done as good a job alone.

## Where it stumbled 🙈

It wasn't flawless, and pretending otherwise would make this post useless.

- The first production deploy **failed**: the GitHub Action defaulted to Node 20 while Astro needed 22. The agent diagnosed it from the outside (it couldn't even read the CI logs), pinned the version, and the next deploy was green. But it shipped the failure first.
- One accessibility fix introduced a small **visual regression**: an underline rule that was too broad and started underlining entire link cards. Its own site-wide scan caught it a day later, but a more careful first pass would have avoided it.
- And my favourite: by default it signed every commit with an AI co-author trailer. I didn't want that in my history, so I told it once, and the preference stuck permanently. **Defaults matter.** Check what your tools are quietly adding to your work.

## So, should you try this?

If you're skeptical about AI-assisted development, here's my one line: **it's a multiplier, not a replacement.** Every decision that mattered on this project was mine. The taste was mine, the priorities were mine, the audit that caught real issues was mine. What changed is that the distance between "decision made" and "decision shipped and verified" collapsed from evenings-and-weekends to minutes.

Don't judge it on toy demos. Pick a real project, one with an actual deploy, actual users (even if the only user is you) and actual consequences, and spend a day working _with_ an agent rather than watching cherry-picked videos of one. That's what convinced me.

The site you're on is the receipt. 🧾

---

_Curious about the tools? The full setup is on my [/uses](/uses/) page, and what I'm currently up to is on [/now](/now/)._
