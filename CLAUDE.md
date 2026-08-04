# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Jekyll static site — the personal site/blog at `teodorkurtev.com`, hosted on GitHub Pages. There is no application code: the repo is content (Markdown + images) plus `_config.yml`. The npm side exists only for commit linting, not for building the site.

## Commands

```bash
bundle install                              # install Ruby gems (required; see note below)
bundle exec jekyll serve                    # local dev server at http://localhost:4000
bundle exec jekyll serve --livereload
bundle exec jekyll build                    # output to _site/ (gitignored)
bundle exec jekyll build --strict_front_matter
npm install                                 # installs husky + commitlint hooks only
```

There is no test suite, no linter, and no CI workflow. `_config.yml` is **not** reloaded by `jekyll serve` — restart the process after editing it.

The pinned gems are not currently installed in this checkout, so `bundle exec` fails until `bundle install` is run. `Gemfile.lock` is gitignored and `github-pages` is unpinned, so the resolved gem set is not reproducible across machines.

## Deployment

Pushing to `master` triggers a GitHub Pages build — there is no deploy workflow in the repo. This constrains two things:

- **Plugins** must be on the [GitHub Pages allowlist](https://pages.github.com/versions/). `jekyll-algolia` is in the `Gemfile` but is not allowlisted and is not referenced in `_config.yml`; it does nothing. `search: true` uses minimal-mistakes' built-in lunr search.
- **`CNAME`** holds the apex domain. Don't remove it.

## Theme: remote, not vendored

The theme is pulled at build time via `remote_theme: mmistakes/minimal-mistakes` — there are **no `_layouts/`, `_includes/`, or `_sass/` directories in this repo**. Layout names referenced in front matter (`single`, `categories`, `tags`, `posts`) come from upstream.

To customize a layout, include, or stylesheet, create the file at the same path locally; Jekyll's local copy wins over the remote theme's. Copy the original from the [minimal-mistakes repo](https://github.com/mmistakes/minimal-mistakes) rather than writing from scratch. Because `remote_theme` is unpinned, upstream changes can alter the live site with no commit here.

Theme behaviour is driven almost entirely by `_config.yml`: the author sidebar (`author.links`), footer, skin (`minimal_mistakes_skin: dark`), Disqus comments, and Google Analytics are all config, not markup.

## Routing and content structure

- **Homepage is `_pages/about.md`**, via `permalink: /`. It is a long-form CV, not a post feed. Pagination config (`paginate: 5`) is inert because `jekyll-paginate` requires an `index.html` containing `paginator`, which doesn't exist.
- **Post URLs** follow `permalink: /:categories/:title/`, so a post with `categories: [blog]` lands at `/blog/<slug>/`. The date in the filename does **not** affect the URL or ordering — the front matter `date:` is authoritative. (`_posts/2024-19-01-...` has an invalid month and is harmless for that reason.)
- **`_pages/` is only built because of the `include: [_pages]`** directive; page routes come from each file's `permalink`. Archive pages (`/categories/`, `/tags/`, `/posts/`) exist but only `/posts/` is linked from `_data/navigation.yml` — the others are commented out in the nav.
- **Top nav** is `_data/navigation.yml`.
- **`baseurl: "/"`** in `_config.yml` is incorrect for an apex-domain Pages site (should be `""`) and can produce double-slash URLs where the theme concatenates `site.baseurl`. Be aware when debugging broken asset paths.

## Adding a post

Create `_posts/YYYY-MM-DD-slug.md`. Existing posts establish the front matter shape:

```yaml
---
title: "..."
date: 2024-01-18T15:34:30-04:00
teaser: "..."                 # shown in listings
comments: true
header:
  teaser: "assets/images/<post-slug>/<thumb>"
categories:
  - blog                      # drives the /blog/ URL prefix
tags:
  - ...
---
```

Post-specific images go in `assets/images/<post-slug>/`. Reference them with a root-relative path (`/assets/images/...`). Site-wide defaults for posts and pages (layout, `author_profile`, `read_time`, `share`, `related`) are set in the `defaults:` block of `_config.yml` — don't repeat them per file.

Set `published: false` to keep a draft out of the build (see `_posts/2019-04-18-welcome-to-jekyll.md`, the unmodified Jekyll sample post).

## Commit convention

Enforced by a husky `commit-msg` hook running commitlint (`@commitlint/config-conventional`). Allowed types are restricted in `commitlint.config.js`:

`feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `revert`, `perf`, `vercel`

The `pre-commit` hook exists but is an empty no-op.
