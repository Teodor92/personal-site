---
title: 'Readarr is retired: I moved to Bookshelf without losing a book'
description: 'Why my retired Readarr still worked, how Bookshelf compares to Chaptarr and LazyLibrarian, and a copy-not-move migration with the two apps I nearly forgot.'
pubDate: 2026-10-02T22:30:00+03:00
draft: false
tags:
  - homelab
  - AI
  - Claude Code
---

Readarr was the one app in my media stack I kept meaning to deal with. The Servarr team [retired the project](https://github.com/Readarr/Readarr#announcement-retirement-of-readarr) and archived it in June 2025, because its metadata service had become unusable and nobody had the time to rebuild it. Without metadata, Readarr can no longer search for or match books. I'd flagged it as dead weight in an audit of my stack and planned to switch it off.

Then I checked what it was actually doing, and it was working fine.

This is how that happened, which replacement I picked, and the migration I ran with an AI agent on [my Unraid box](/uses/): copy, never move, and check every app that talks to the old container, because two of them were easy to miss.

> **Key takeaways**
>
> - A "retired" Readarr may still work. Mine had been pointed at [rreading-glasses](https://github.com/blampe/rreading-glasses), a community replacement for the dead metadata service, so the real risk was no updates, not broken search.
> - [Bookshelf](https://github.com/pennydreadful/bookshelf)'s `softcover` image reads an existing Readarr database as-is. For a small library it's the lowest-effort way onto maintained software.
> - The container swap takes minutes. The work is in everything that refers to the old container by name: Prowlarr, the reverse proxy, the uptime monitor, and any helper app that stores its URL.

## My "dead" Readarr was still working

It was still working because, at some point, I'd switched its metadata source. Readarr keeps that setting in its database, and one read-only query showed it wasn't talking to the retired Servarr service at all:

```sql
sqlite> select key, value from Config where key = 'metadatasource';
metadatasource|https://api.bookinfo.pro
```

`api.bookinfo.pro` is the hosted instance of rreading-glasses, which its README describes as a drop-in replacement for Readarr's defunct metadata service that "works with your existing installation" and is backwards-compatible with your library. It serves Goodreads-style data, or Hardcover data from a second endpoint.

So "Readarr is broken" wasn't true for me. The accurate version is that Readarr will never get another release: no bug fixes, no security patches, nothing new. That's a slower problem than broken search, but it's still a problem, especially for something reachable from other containers on my network.

The library itself was small, which made the decision easy:

| What                  | Count |
| --------------------- | ----- |
| Authors               | 3     |
| Books monitored       | 105   |
| Book files on disk    | 31    |
| Size of `media/books` | 77 MB |

## Picking a replacement

For an existing Readarr install, Bookshelf. These are the options I weighed, with each project's status as I checked it on 26 September 2026:

| Option | What it is | Status | Migrating from Readarr |
| --- | --- | --- | --- |
| **[Bookshelf](https://github.com/pennydreadful/bookshelf)** | A maintained revival of Readarr | About 770 stars, commits in September 2026 | **Direct swap** (`softcover` image) |
| **[Chaptarr](https://github.com/Chaptarr/chaptarr)** | A Readarr fork for audiobooks and ebooks in one instance | About 550 stars, v0.9.958, self-described beta | Fresh setup |
| **[LazyLibrarian](https://gitlab.com/LazyLibrarian/LazyLibrarian)** | An older, separate tool for books, audiobooks and magazines | Active on GitLab (the GitHub copy is stale) | Fresh setup, works unlike the \*arr apps |

Two things tipped it. First, Bookshelf's README is explicit that the `softcover` tags are "backward-compatible with existing Readarr databases", which meant I could keep my library, history and settings. The `softcover` image uses Goodreads metadata; the `hardcover` image has better metadata but needs a fresh setup, so it wasn't worth it for my library.

Second, the rreading-glasses README lists Bookshelf as one of the forks that keep working with its metadata. As of 2 October 2026, its author also writes, in [the project's README](https://github.com/blampe/rreading-glasses#readme): "I do not endorse the vibe-coded Chaptarr project." I haven't run Chaptarr, so I can't judge that claim. But a public disagreement between the metadata provider and the app that depends on it isn't a risk I needed to take for 31 files.

If you want audiobooks and ebooks of the same title in one app, Chaptarr is the only option here built for that. Bookshelf supports one format per instance, so you'd run two.

## How the migration went

The plan fitted in five steps, and the rule for all of them was that nothing gets moved or deleted until the new app has proven it works:

1. Stop Readarr.
2. **Copy** (not move) its appdata to a new folder for Bookshelf.
3. Start Bookshelf on the copy, with the same network, port and mounts Readarr had.
4. Verify the library, the metadata source and the download client.
5. Repoint everything that referred to Readarr, and only then remove it.

<figure>
  <svg viewBox="0 0 720 300" role="img" aria-labelledby="bookshelf-flow-title bookshelf-flow-desc" style="width:100%;height:auto;font-family:var(--font-sans)">
    <title id="bookshelf-flow-title">Readarr to Bookshelf migration, copy not move</title>
    <desc id="bookshelf-flow-desc">Readarr is stopped and its appdata copied. Bookshelf starts on the copy with the same network, port and mounts. Readarr's original appdata stays untouched as a rollback until Bookshelf is verified, then it is removed.</desc>
    <defs>
      <marker id="bs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--fg-muted)"></path>
      </marker>
    </defs>
    <g stroke="var(--ink)" stroke-width="2">
      <rect x="20" y="40" width="200" height="90" rx="8" fill="var(--bg-raised)"></rect>
      <rect x="260" y="40" width="200" height="90" rx="8" fill="var(--yellow)"></rect>
      <rect x="500" y="40" width="200" height="90" rx="8" fill="var(--green)"></rect>
      <rect x="20" y="180" width="200" height="90" rx="8" fill="var(--bg-raised)" stroke-dasharray="6 4"></rect>
    </g>
    <g font-size="15" font-weight="600" text-anchor="middle">
      <text x="120" y="75" fill="var(--fg)">Readarr</text>
      <text x="360" y="75" fill="var(--on-fill)">cp -a appdata</text>
      <text x="600" y="75" fill="var(--on-fill)">Bookshelf</text>
      <text x="120" y="215" fill="var(--fg)">Original appdata</text>
    </g>
    <g font-size="12" text-anchor="middle">
      <text x="120" y="100" fill="var(--fg-muted)">stopped, autostart off</text>
      <text x="360" y="100" fill="var(--on-fill)">1.3 GB copied</text>
      <text x="600" y="100" fill="var(--on-fill)">same network, port 8787,</text>
      <text x="600" y="117" fill="var(--on-fill)">same /data mounts</text>
      <text x="120" y="240" fill="var(--fg-muted)">untouched rollback,</text>
      <text x="120" y="257" fill="var(--fg-muted)">removed only after checks pass</text>
    </g>
    <g stroke="var(--fg-muted)" stroke-width="2" fill="none" marker-end="url(#bs-arrow)">
      <line x1="220" y1="85" x2="256" y2="85"></line>
      <line x1="460" y1="85" x2="496" y2="85"></line>
      <line x1="120" y1="130" x2="120" y2="176"></line>
    </g>
  </svg>
  <figcaption style="font-size:var(--text-sm);color:var(--fg-muted);text-align:center;margin-top:0.5rem">The original data stays put until the new app has proven itself.</figcaption>
</figure>

**The copy.** Bookshelf expects its data at `/config`, in the same layout the binhex Readarr image used, so a straight `cp -a` of the 1.3 GB appdata folder was enough. (1.3 GB for a 77 MB library sounds odd, but it's almost all the database itself, 924 MB of metadata for every edition of every book, plus 247 MB of automatic backups.) Bookshelf upgraded the database schema on first start, which is exactly why copying mattered: the upgrade only touched the copy, and the original stayed readable by the old Readarr if I needed to roll back.

**The container.** I pinned an exact image tag, `ghcr.io/pennydreadful/bookshelf:softcover-v0.4.21.182`, rather than a moving tag, for the same reason I pin everything else in the homelab: a broken upstream release shouldn't be able to reach me without my say-so. The agent gave it Readarr's exact settings:

- the `arr-app-network` Docker network
- port 8787
- `/mnt/user/data` mounted at both `/data` and `/media`
- UID and GID 99:100

It also wrote a matching Unraid template, so I can still edit the container from the Docker tab.

**The checks.** Before touching anything else:

- All 3 authors, 105 books and 31 files came across intact.
- The metadata source was still `https://api.bookinfo.pro`.
- Bookshelf could reach the root folder `/data/media/books`.
- The qBittorrent download client test passed.

One thing looked wrong and wasn't. Bookshelf showed a health error saying all download clients were unavailable, even though the test passed. That warning was carried over in the copied database from Readarr's last health check, and it cleared on its own at the next one. Worth knowing before you go chasing it.

## Everything that pointed at the old container

This is the part that takes the time, and it's where a migration that "works" can quietly leave things broken. Renaming the container from `readarr` to `bookshelf` breaks every URL that used the old name.

**Prowlarr.** I'd actually removed the Readarr app from Prowlarr earlier that day, when I still thought Readarr was dead: Readarr had been firing nightly RSS requests at two indexers Prowlarr no longer supported. So Bookshelf went back in as a new app of type Readarr, pointing at `http://bookshelf:8787`, with the book categories (3030 and 7000 to 7060) and full sync. The connection test passed before saving. Full sync makes Prowlarr the owner of the app's indexer list, so after the first sync Bookshelf had only the indexers that still work, and the two dead ones it inherited from Readarr were removed.

**The reverse proxy and the monitor.** My Caddy config maps subdomains to upstreams, so this was one renamed line (with a backup of the Caddyfile first). The Uptime Kuma monitor got a new name and URL. The old `readarr.` subdomain now simply stops working, since Caddy no longer serves it; add an alias if bookmarks or other tools depend on it.

**The two I nearly missed.** A search across my other apps' configs turned up two more references to `http://readarr:8787`:

- **Cleanuparr**, which keeps its \*arr instances in a SQLite database. I stopped it, backed up the database, changed the one row, and started it again. It logged the new instance as healthy straight away.
- **Fetcharr**, which takes its instance URLs from environment variables. Changing one of those means recreating the container, the same thing Unraid's Apply button does.

The Fetcharr recreation is where the agent slipped. It rebuilt the container from its live settings but missed a `--user=99:100` flag that lived in the Unraid template's extra parameters, not in the environment. The app started, connected to everything, and then couldn't write its own log file: `Permission denied`. A second recreation with the right user fixed it. The lesson generalises: when you recreate a container by hand, diff it against the template, not just against `docker inspect` of what you think matters.

## Cleaning up Readarr

Only after all of that worked did anything get deleted, and I approved each item first:

| Removed                                   | Size    |
| ----------------------------------------- | ------- |
| The stopped `readarr` container           | n/a     |
| The `binhex/arch-readarr` image           | 1.21 GB |
| The Unraid template and two old backups   | small   |
| The original appdata folder               | 1.3 GB  |

Before removing the appdata, the agent confirmed Bookshelf was running from its own copy, so the rollback path was only closed once it wasn't needed.

## Should you bother?

If your Readarr still works, check why before you rip it out. It might be on rreading-glasses already, and then there's no urgency: a planned migration on a quiet evening beats an emergency one.

If you do move, and your library isn't huge, Bookshelf's `softcover` image makes it close to a non-event. Keep the whole thing reversible (copy the data, pin the image, keep the old container until the new one is verified), and spend your attention on the apps that talk to it, not the app itself.

I did all of this with Claude Code driving my homelab through MCP servers and SSH. If you're curious how that setup works, [the first post in this series](/blog/my-homelab-runs-on-mcp/) covers the architecture, and [the follow-up](/blog/hardening-my-homelab-mcp-setup/) covers how the secrets stay out of reach.
