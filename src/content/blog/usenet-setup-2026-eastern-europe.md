---
title: 'Planning a Usenet setup in 2026 from Eastern Europe: backbones, blocks and indexers'
description: "Why I'm moving my media stack to Usenet first: backbones, block accounts, the providers and indexers that made the cut, SABnzbd vs NZBGet, and the cost."
pubDate: 2026-10-09T12:00:00+03:00
tags:
  - homelab
  - AI
  - Claude Code
pillar: homelab
---

My media stack runs on public torrent indexers, and a health check in September 2026 showed how badly that was going. Four of my ten indexers were dead or failing, and two of those had been removed from Prowlarr's supported list entirely. Sonarr and Radarr had **2,052 monitored items with no file** and **1,597 below their quality cutoff**, and my stall cleaner had marked **140 downloads as failed in 30 days**, most of them for lack of seeders. The blocklist had grown to 1,572 releases.

The usual answer on homelab forums is "get Usenet". So I sat down with an AI agent and three parallel research threads (download clients, providers, indexers) to work out what a good Usenet setup looks like in 2026, specifically from Bulgaria. This post is that research, plus the parts I've already deployed. I haven't bought the subscriptions yet, so the real-world completion numbers will come in a follow-up.

> **Key takeaways**
>
> - The thing to understand is the **backbone**: many Usenet brands resell the same storage. A second account only helps if it sits on a different backbone. Eweka plus Tweaknews is the same data bought twice.
> - My plan: **Eweka** as the unlimited primary (the longest retention, EU-based, about 32 ms from Sofia), one non-expiring **block account on UsenetExpress**, and **NZBGeek plus NZBFinder** as indexers. That works out to about **€7 to €9 a month** in the first year and **€7 to €8** after that.
> - **SABnzbd** is still the right download client for a normal homelab. NZBGet has caught up on speed, but that alone isn't a reason to switch.
> - Usenet won't replace torrents for anime. The biggest torrent-to-Usenet mirror, AnimeTosho, stopped in May 2026, so Nyaa stays as a permanent fallback.

## Backbones are the thing to understand

A backbone is the company that actually stores the articles your downloads are made of. The brand you pay (Newshosting, Eweka, Frugal and dozens of others) is often a reseller sitting on someone else's storage. That matters because it decides whether a second subscription adds anything.

The community-maintained [Usenet Tree provider map](https://usenet.rexum.space/tree) and the [r/usenet providers wiki](https://web.archive.org/web/20260325180443/https://www.reddit.com/r/usenet/wiki/providers/) are the best sources I found for who sits where. Simplified, as of September 2026:

<figure>
<svg viewBox="0 0 720 476" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="bb-backbones-title bb-backbones-desc" class="bb" style="width:100%;height:auto;display:block">
  <title id="bb-backbones-title">Usenet backbones and the brands that resell them</title>
  <style>.bb text { font-kerning: normal; } .bb-zone { fill: none; stroke-width: 2; stroke-dasharray: 6 4; } .bb-outline { stroke-width: 3; } .bb-focal { stroke-width: 3; } .bb-outline-thin { stroke-width: 1.5; } .bb-legend-focal { fill: none; stroke-width: 3; } .bb-tag { fill: none; stroke-width: 1; } .bb-eyebrow { font-size: 8px; font-weight: 500; letter-spacing: 0.14em; } .bb-tagtext, .bb-focaltext { font-size: 7.5px; font-weight: 500; letter-spacing: 0.06em; } .bb-name { font-size: 15px; font-weight: 600; } .bb-sub { font-size: 10.5px; } .bb-callout { font-size: 14px; font-style: italic; } .bb-legend { font-size: 11px; } .bb-rule { stroke-width: 1; }  .bb-zone { stroke: var(--fg-muted); opacity: 0.6; } .bb-mask { fill: var(--bg); } .bb-eyebrow { fill: var(--fg-muted); font-family: var(--font-mono); } .bb-shadow-own, .bb-shadow-ind { fill: var(--ink); } .bb-fill-own, .bb-swatch-own { fill: var(--pink); } .bb-fill-ind, .bb-swatch-ind { fill: var(--cyan); } .bb-outline, .bb-outline-thin { stroke: var(--ink); } .bb-focal, .bb-legend-focal { stroke: var(--accent); } .bb-tag { stroke: var(--on-fill); opacity: 0.55; } .bb-tagtext { fill: var(--on-fill); font-family: var(--font-mono); } .bb-focaltag { fill: var(--accent); } .bb-focaltext { fill: var(--bg); font-family: var(--font-mono); } .bb-name { fill: var(--on-fill); font-family: var(--font-sans); } .bb-sub { fill: var(--on-fill); opacity: 0.8; font-family: var(--font-sans); } .bb-callout { fill: var(--fg-muted); font-family: var(--font-sans); } .bb-legend { fill: var(--fg); font-family: var(--font-sans); } .bb-rule { stroke: var(--fg); opacity: 0.15; } [data-theme='dark'] .bb-fill-own, [data-theme='dark'] .bb-fill-ind { fill: var(--bg-raised); } [data-theme='dark'] .bb-shadow-own { fill: var(--pink); } [data-theme='dark'] .bb-shadow-ind { fill: var(--cyan); } [data-theme='dark'] .bb-name, [data-theme='dark'] .bb-tagtext { fill: var(--fg); } [data-theme='dark'] .bb-sub { fill: var(--fg-muted); opacity: 1; } [data-theme='dark'] .bb-tag { stroke: var(--fg); } [data-theme='dark'] .bb-legend-focal { stroke: var(--accent); }</style>
  <desc id="bb-backbones-desc">Omicron Media owns the Omicron, Eweka and Base IP storage pools, while UsenetExpress, NetNews and Abavia are independent, so a backup account only adds coverage on an independent backbone such as UsenetExpress.</desc>
  <rect x="24" y="24" width="672" height="148" rx="12" class="bb-zone"/>
  <rect x="36" y="16" width="252" height="16" rx="2" class="bb-mask"/>
  <text x="44" y="27" class="bb-eyebrow">OWNED BY OMICRON MEDIA · ONE STORAGE POOL</text>
  <rect x="24" y="204" width="672" height="148" rx="12" class="bb-zone"/>
  <rect x="36" y="196" width="248" height="16" rx="2" class="bb-mask"/>
  <text x="44" y="207" class="bb-eyebrow">INDEPENDENT · A BLOCK HERE ADDS COVERAGE</text>
  <rect x="52" y="64" width="192" height="92" rx="10" class="bb-shadow-own"/>
  <rect x="48" y="60" width="192" height="92" rx="10" class="bb-fill-own bb-outline"/>
  <rect x="60" y="72" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="90" y="82" text-anchor="middle" class="bb-tagtext">6,616 DAYS</text>
  <text x="60" y="110" class="bb-name">Omicron</text>
  <text x="60" y="128" class="bb-sub">Newshosting, UsenetServer,</text>
  <text x="60" y="142" class="bb-sub">Easynews, Newsgroup Ninja</text>
  <rect x="268" y="64" width="192" height="92" rx="10" class="bb-shadow-own"/>
  <rect x="264" y="60" width="192" height="92" rx="10" class="bb-fill-own bb-focal"/>
  <rect x="276" y="72" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="306" y="82" text-anchor="middle" class="bb-tagtext">6,612 DAYS</text>
  <rect x="396" y="72" width="48" height="14" rx="2" class="bb-focaltag"/>
  <text x="420" y="82" text-anchor="middle" class="bb-focaltext">MY MAIN</text>
  <text x="276" y="110" class="bb-name">Eweka</text>
  <text x="276" y="128" class="bb-sub">Own brand in Amsterdam,</text>
  <text x="276" y="142" class="bb-sub">Dutch notice-and-takedown</text>
  <rect x="484" y="64" width="192" height="92" rx="10" class="bb-shadow-own"/>
  <rect x="480" y="60" width="192" height="92" rx="10" class="bb-fill-own bb-outline"/>
  <rect x="492" y="72" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="522" y="82" text-anchor="middle" class="bb-tagtext">5,000 DAYS</text>
  <text x="492" y="110" class="bb-name">Base IP</text>
  <text x="492" y="128" class="bb-sub">Tweaknews, PureUsenet,</text>
  <text x="492" y="142" class="bb-sub">SunnyUsenet</text>
  <rect x="52" y="244" width="192" height="92" rx="10" class="bb-shadow-ind"/>
  <rect x="48" y="240" width="192" height="92" rx="10" class="bb-fill-ind bb-focal"/>
  <rect x="60" y="252" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="90" y="262" text-anchor="middle" class="bb-tagtext">5,900 DAYS</text>
  <rect x="180" y="252" width="48" height="14" rx="2" class="bb-focaltag"/>
  <text x="204" y="262" text-anchor="middle" class="bb-focaltext">MY BLOCK</text>
  <text x="60" y="290" class="bb-name">UsenetExpress</text>
  <text x="60" y="308" class="bb-sub">NewsgroupDirect, NewsDemon,</text>
  <text x="60" y="322" class="bb-sub">ThunderNews</text>
  <rect x="268" y="244" width="192" height="92" rx="10" class="bb-shadow-ind"/>
  <rect x="264" y="240" width="192" height="92" rx="10" class="bb-fill-ind bb-outline"/>
  <rect x="276" y="252" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="306" y="262" text-anchor="middle" class="bb-tagtext">4,500 DAYS</text>
  <text x="276" y="290" class="bb-name">NetNews</text>
  <text x="276" y="308" class="bb-sub">Blocknews,</text>
  <text x="276" y="322" class="bb-sub">Frugal Usenet</text>
  <rect x="484" y="244" width="192" height="92" rx="10" class="bb-shadow-ind"/>
  <rect x="480" y="240" width="192" height="92" rx="10" class="bb-fill-ind bb-outline"/>
  <rect x="492" y="252" width="60" height="14" rx="2" class="bb-tag"/>
  <text x="522" y="262" text-anchor="middle" class="bb-tagtext">4,040 DAYS</text>
  <text x="492" y="290" class="bb-name">Abavia</text>
  <text x="492" y="308" class="bb-sub">XS News, EasyUsenet,</text>
  <text x="492" y="322" class="bb-sub">Bulknews</text>
  <text x="24" y="388" class="bb-callout">Eweka plus Tweaknews is the same storage bought twice;</text>
  <text x="24" y="408" class="bb-callout">a block on UsenetExpress fills the gaps Eweka has.</text>
  <line x1="24" y1="428" x2="696" y2="428" class="bb-rule"/>
  <text x="24" y="456" class="bb-eyebrow">LEGEND</text>
  <rect x="104" y="444" width="16" height="16" rx="3" class="bb-swatch-own bb-outline-thin"/>
  <text x="128" y="456" class="bb-legend">Omicron Media storage</text>
  <rect x="300" y="444" width="16" height="16" rx="3" class="bb-swatch-ind bb-outline-thin"/>
  <text x="324" y="456" class="bb-legend">Independent storage</text>
  <rect x="484" y="444" width="16" height="16" rx="3" class="bb-legend-focal"/>
  <text x="508" y="456" class="bb-legend">My pick: main account + block</text>
</svg>
  <figcaption style="font-size:var(--text-sm);color:var(--fg-muted);text-align:center;margin-top:0.5rem">Simplified from the Usenet Tree map and the r/usenet wiki. Brands move between backbones, so check before you buy.</figcaption>
</figure>

The trap is the top box. Omicron Media owns the Omicron backbone, Eweka and Base IP. Eweka is a slightly special case: it runs its own brand, servers and takedown process in Amsterdam on top of Omicron's storage, which is why it gets its own box here. The r/usenet wiki describes Tweaknews's Amsterdam servers as a cached version of Eweka's, so buying Tweaknews as a "backup" to Eweka gets you almost nothing new.

**Why diversity helps at all.** Articles go missing for several reasons: retention limits, storage failures and takedown notices, which each provider processes under its own rules. US providers follow the DMCA; Dutch providers like Eweka follow the Dutch notice-and-takedown code, where each provider sets its own process. That's also why two brands on the same storage can report slightly different availability. A backbone with independent storage has its own gaps in different places, so it can complete downloads the first one can't. That's all a second backbone is for: it raises completion rates rather than adding content.

## Picking the main account

For old content, the one with the longest retention. My library includes anime seasons that are 10 to 15 years old, and 15 years is about 5,475 days. Retention is how far back a backbone keeps articles, and only two backbones fully cover that window:

<figure>
  <svg viewBox="0 0 720 330" role="img" aria-labelledby="retention-title retention-desc" style="width:100%;height:auto;font-family:var(--font-sans)">
    <title id="retention-title">Binary retention by backbone in days, with a 15-year marker</title>
    <desc id="retention-desc">Horizontal bars: Omicron about 6,616 days, UsenetExpress about 5,900, NetNews 4,500, Abavia about 4,040, Usenet.Farm 3,000. A vertical line at 5,475 days marks 15 years; only Omicron and UsenetExpress reach past it.</desc>
    <g font-size="13" fill="var(--fg)" text-anchor="end">
      <text x="150" y="58">Omicron</text>
      <text x="150" y="108">UsenetExpress</text>
      <text x="150" y="158">NetNews</text>
      <text x="150" y="208">Abavia</text>
      <text x="150" y="258">Usenet.Farm</text>
    </g>
    <g stroke="var(--ink)" stroke-width="2">
      <rect x="165" y="40" width="496" height="28" fill="var(--green)"></rect>
      <rect x="165" y="90" width="443" height="28" fill="var(--green)"></rect>
      <rect x="165" y="140" width="338" height="28" fill="var(--yellow)"></rect>
      <rect x="165" y="190" width="303" height="28" fill="var(--yellow)"></rect>
      <rect x="165" y="240" width="225" height="28" fill="var(--yellow)"></rect>
    </g>
    <g font-size="12" fill="var(--fg)">
      <text x="668" y="59">6,616</text>
      <text x="615" y="109">~5,900</text>
      <text x="510" y="159">4,500</text>
      <text x="475" y="209">~4,040</text>
      <text x="397" y="259">3,000</text>
    </g>
    <line x1="576" y1="28" x2="576" y2="282" stroke="var(--fg)" stroke-width="2" stroke-dasharray="5 4"></line>
    <text x="576" y="300" font-size="12" text-anchor="middle" fill="var(--fg-muted)">15 years (5,475 days)</text>
  </svg>
  <figcaption style="font-size:var(--text-sm);color:var(--fg-muted);text-align:center;margin-top:0.5rem">Retention in days, from the Usenet Tree provider data (checked September 2026). Retention is the age of the oldest article, not a promise that everything in between survives.</figcaption>
</figure>

Omicron goes back to August 2008 and UsenetExpress to July 2010. Everything else falls short of my oldest seasons.

Within the Omicron family, the choice was between Eweka and Newshosting, both on the same storage:

| Provider        | Price (checked September 2026)                                         | Connections | Why pick it                                                               |
| --------------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| **Eweka**       | €44.85 for the first 15 months (€2.99 a month), then €71.88 a year     | 50          | EU company and servers, Dutch notice-and-takedown, top tier in the [Usenet Tree retention ranking](https://usenet.rexum.space/docs/deal-selection/retention) |
| **Newshosting** | $29.85 for the first 15 months ($1.99 a month), then $71.88 a year     | 100         | Cheapest way onto Omicron, but runs under US DMCA rules                   |

I'm going with Eweka. It costs a little more in the first year, but the servers are in Amsterdam, which is about 32 ms from Sofia (against about 119 ms to New York), and the [Usenet Tree retention ranking](https://usenet.rexum.space/docs/deal-selection/retention) puts Eweka and Omicron in its top tier. Note the renewal price roughly doubles after the promotional period; every provider in this space works that way, and the deals come round again every Black Friday.

**Avoid** Usenext and FreeDiscussions. The Usenet Tree's [shady practices page](https://usenet.rexum.space/docs/deal-selection/shady-practices) reports lock-in contracts and collection letters. And be careful with Giganews for old content: sources I checked quoted its binary retention as anything from about 550 to about 3,600 days, which tells you nobody really knows.

## Block accounts, and why I'm buying only one

A block account is a prepaid amount of data, usually a terabyte or two, that you only draw on when your main provider is missing an article. Good ones never expire, so a block bought today can last years. You give it a lower priority in the download client, and it only gets asked for the pieces your main account couldn't supply.

The block should sit on a **different backbone** from your main account, and for old content the obvious one is UsenetExpress, the only other backbone that reaches past 15 years:

- **UsenetExpress blocks** through NewsgroupDirect or ThunderNews: NewsgroupDirect lists 1 TB at $45, non-expiring, and the [r/usenet deals page](https://web.archive.org/web/20260811083703/https://old.reddit.com/r/usenet/wiki/providerdeals) (as archived in August 2026) shows promotional prices far below that (2 to 4 TB for $16 to $25).
- **NetNews blocks** through Blocknews: 1 TB for $14, non-expiring. A reasonable third backbone.

My plan is to buy **one** UsenetExpress block, then measure before buying anything else. SABnzbd shows per-server article availability, so after a month I'll know how many articles Eweka was missing and whether the block actually filled them. If it rarely gets asked, a second block would be wasted money.

## Indexers worth paying for

A provider stores the data; an indexer is the search engine that tells your apps what exists and where. You need both. The indexer scene churns: as of September 2026 the [Usenet Almanac tracker](https://usenetalmanac.com/indexers/) counted 93 indexers, of which 59 were dead. A few renamed recently too: NZB.su is now nzb.life, and SceneNZBs became Treasure Maps in July 2026.

For my mix of mainstream TV, films and a lot of anime, the shortlist (prices checked September 2026):

| Indexer          | Price                                                         | Registration                         | Notes                                            |
| ---------------- | ------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| **NZBGeek**      | $12 a year, or about $60 lifetime in its Black Friday sale    | Open                                 | The broadest coverage and the biggest community  |
| **NZBFinder**    | Basic $15 a year (5,000 API calls a day)                      | Open, with a free trial              | Advertises obfuscated posts                      |
| **DrunkenSlug**  | €15 to €25 a year                                             | Invite-only, opens every few months  | Add it at the next opening                       |
| NZBPlanet        | $13 a year                                                    | Paid sign-up open                    | A good stand-in until DrunkenSlug opens          |

Two paid indexers is where I'm starting. The Almanac guide's advice is the sensible test: "A second indexer pays only if it finds things the first one missed". Turn one off for a few weeks and see what you lose.

**Anime is the hard part.** Most fansub and P2P anime only reaches Usenet because someone mirrors the torrents, and the biggest mirror, AnimeTosho, [froze in May 2026](https://animetosho.org/about/shutdown2) and shuts its feeds down in October. Prowlarr still ships an AnimeTosho preset, so don't be surprised when it stops answering. Newer free replacements like ameNZB and aninzb exist, but they are weeks old. For anime, torrents stay essential, so Nyaa and nekoBT stay in my Prowlarr as a permanent fallback.

## SABnzbd is still the right download client

For a normal homelab, it is. I compared the three realistic options:

| | SABnzbd 5.1.3 | NZBGet v26.3 | Streaming mounts (NZBDav, AltMount) |
| --- | --- | --- | --- |
| **Speed** | Line speed at 1 Gbps on any modern CPU | Same | Limited by provider latency at playback time, not by disk |
| **Maintenance** | Very active, large project | Healthy again under the nzbgetcom fork, smaller team | [NZBDav](https://github.com/nzbdav-dev/nzbdav)'s README says it's no longer maintained; AltMount is still pre-1.0 |
| **Released** | 8 September 2026 | 27 August 2026 | n/a |

The old argument for NZBGet was speed: C++ against Python. That gap has mostly closed, because both now use the same libraries for the heavy lifting, rapidyenc for decoding and par2cmdline-turbo for repair. Both are written by AnimeTosho's developer, and the site's shutdown doesn't affect them. SABnzbd's own high-speed guide and maintainer benchmarks point the same way: at 1 Gbps the bottleneck is your disk, not the client. Put the incomplete folder on an SSD and either will saturate the line.

Streaming mounts are a different idea altogether: your library becomes a view onto the provider, and it disappears as articles expire or get taken down. With 11 TB free on my array, I have no reason to take that risk.

Two practical points decided it for SABnzbd. The TRaSH Guides settings are written for it and well maintained. And the MCP server I use to let my AI agent see the whole media stack supports SABnzbd but not NZBGet.

**Security note:** SABnzbd 5.1.1 to 5.1.3 fixed critical flaws, including an authentication bypass and remote code execution; the [5.1.3 release notes](https://github.com/sabnzbd/sabnzbd/releases/tag/5.1.3) list them. Install 5.1.3 or later, and pin the image version so you upgrade deliberately.

## What I've already deployed

The agent set SABnzbd up on my Unraid server ahead of the subscriptions, following the TRaSH Guides:

- **Image:** `lscr.io/linuxserver/sabnzbd:5.1.3-ls274`, pinned. Host port 8085, because qBittorrent already had 8080.
- **Paths:** `/mnt/user/data` mounted at `/data`, the same as in Sonarr and Radarr, so imports are instant moves on the same filesystem rather than slow copies. Incomplete downloads go to `/data/usenet/incomplete` on the NVMe cache; finished ones go to `/data/usenet/tv` and `/data/usenet/movies` through categories.
- **Switches:** direct unpack on, jobs that can't complete abort, duplicates get tagged, encrypted archives fail the job, TRaSH's blacklist of risky file extensions fails the job, deobfuscation on, and sorting off.
- **Access:** a login, a hostname whitelist, a Caddy route, and an Uptime Kuma monitor on SABnzbd's public version endpoint.

The agent looked up each numeric switch in SABnzbd's source instead of working from memory, which matters for values like "tag duplicates": in `sabnzbd.ini` that's `no_dupes = 4`, not 1.

When the accounts arrive, the remaining steps are:

1. Add Eweka at priority 0, marked Required, SSL on port 563, starting at about 20 connections. TRaSH's rule is the fewest connections that reach full speed, plus one.
2. Add the block at priority 1, with a per-server retention limit so SABnzbd doesn't waste requests asking it for articles older than it keeps.
3. Connect SABnzbd to Sonarr and Radarr, with completed and failed download handling on.
4. Add the indexers to Prowlarr at a higher priority than the torrent ones, with API limits set so I don't get banned.
5. Set delay profiles to prefer Usenet and wait 60 minutes before grabbing a torrent, or 15 to 30 minutes for anime, because new anime usually lands on Nyaa before any Usenet mirror.

One thing that surprised me: **delay profiles only help with new releases.** The delay counts from the upload time, so anything older is grabbed straight away, and Sonarr ranks releases by quality and custom-format score before protocol. A better-scored torrent still beats a Usenet release. For my backlog of 2,052 old items, a delay profile does nothing. What helps is a Usenet source that finds them at all.

Cleanuparr, which I use to clear stalled torrents, has no Usenet support and says it won't add any, so Sonarr and Radarr's own failed download handling covers SABnzbd instead.

## What it costs

| Part                       | Year one                          | After that                       |
| -------------------------- | --------------------------------- | -------------------------------- |
| Eweka                      | €44.85, paid upfront for 15 months | €71.88 a year                  |
| One UsenetExpress block    | $15 to $45, once, lasts years     | none                             |
| NZBGeek and NZBFinder      | $27                               | $27, or $15 once NZBGeek is lifetime |
| SABnzbd                    | free                              | free                             |
| **Per month**              | **about €7 to €9**                | **about €7 to €8**               |

An NZBGeek lifetime membership (about $60 in its Black Friday sale) would be a one-off on top of year one, then saves $12 a year. Either way it's less than a single streaming subscription, and I already own the server it runs on.

## You don't need a VPN, but read the small print

You don't need one for encryption: Usenet traffic over SSL on port 563 is encrypted between you and the provider, so your ISP can't see what you're downloading. Unlike BitTorrent, you're not uploading to strangers either. A VPN would additionally hide from your ISP that you use Usenet at all, and hide your home IP from the provider, but the provider still sees your account and what you download. That's worth paying for only if you want the extra privacy.

What SSL doesn't change is the law. Usenet providers and indexers are legal businesses, but EU case law (the CJEU's _ACI Adam_ ruling in 2014) says private copying only covers lawful sources. Downloading unlicensed content isn't legal in Bulgaria or anywhere else in the EU, whatever protocol carries it.

## Where this leaves me

The research took an evening; the decisions are simple once you understand backbones. One long-retention main account in the EU, one block on a different backbone, two indexers, SABnzbd, and torrents kept as the backup, especially for anime.

The catch is that everything above is a plan and a configured-but-idle download client. The follow-up will have the numbers that matter: how often Eweka alone completed a download, whether the block earned its place, and how much of that 2,052-item backlog actually came back.

If you want to see how an AI agent can read and change a homelab like this, [the first post in this series](/blog/my-homelab-runs-on-mcp/) covers the MCP setup, and [the hardening follow-up](/blog/hardening-my-homelab-mcp-setup/) covers keeping the secrets out of reach.

**Sources:** [SABnzbd releases](https://github.com/sabnzbd/sabnzbd/releases), [SABnzbd high-speed downloading guide](https://sabnzbd.org/wiki/advanced/highspeed-downloading), [NZBGet releases](https://github.com/nzbgetcom/nzbget/releases), [TRaSH Guides: SABnzbd basic setup](https://trash-guides.info/Downloaders/SABnzbd/Basic-Setup/), [Servarr wiki: delay profiles](https://wiki.servarr.com/sonarr/settings#delay-profiles), [Usenet Tree provider map](https://usenet.rexum.space/tree), [r/usenet providers wiki (archived March 2026)](https://web.archive.org/web/20260325180443/https://www.reddit.com/r/usenet/wiki/providers/), [r/usenet deals page (archived August 2026)](https://web.archive.org/web/20260811083703/https://old.reddit.com/r/usenet/wiki/providerdeals), [retention guide](https://usenet.rexum.space/docs/deal-selection/retention), [providers to avoid](https://usenet.rexum.space/docs/deal-selection/shady-practices), [Usenet Almanac indexers](https://usenetalmanac.com/indexers/), [AnimeTosho shutdown notice](https://animetosho.org/about/shutdown2), [Cleanuparr FAQ on Usenet](https://cleanuparr.github.io/Cleanuparr/docs/faq?usenet-support), [Eweka](https://www.eweka.nl/en), [Newshosting plans](https://www.newshosting.com/usenet-plans/), [NewsgroupDirect](https://www.newsgroupdirect.com/), [Sofia to Amsterdam latency](https://wondernetwork.com/pings/Sofia/Amsterdam).
