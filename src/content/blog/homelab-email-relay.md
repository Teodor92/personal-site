---
title: 'Giving six self-hosted apps working email with one tiny relay'
description: 'Forgejo couldn''t send a password reset, and neither could five other apps. One Postfix relay, a sending subdomain and Resend fixed it in an afternoon, with three short outages on the way.'
pubDate: 2026-11-14T12:00:00+02:00
draft: false
tags:
  - homelab
  - Cloudflare
  - Claude Code
  - AI
pillar: homelab
---

It started with a small question to the agent: does Forgejo have an SMTP server configured? It did not. The mailer section of its config was two lines long:

```ini
[mailer]
ENABLED = false
```

Forgejo couldn't send a password reset or tell anyone their account existed. When I asked which apps on [the NAS](/uses/) send invites or password resets, the answer was six: Forgejo, n8n, Mealie, Seerr, Immich and Infisical. None of them could deliver a single email. Forgejo, Seerr and Immich had mail switched off, n8n had never been configured, Mealie had placeholder Gmail credentials (`changeme@gmail.com`, from the day I installed it), and Infisical was sending everything into a bundled test inbox that nobody reads.

By the end of the afternoon all six were sending through one relay, every message was signed for my domain, and a monitor would tell me if mail started piling up. Getting there took down three apps for about nine minutes in total, and nearly broke the secrets vault the whole lab depends on. This post covers the setup and the parts that bit.

> **Key takeaways**
>
> - Don't run a mail server at home to send notifications. Point every app at one small Postfix relay on a private Docker network, and let the relay hand mail to a transactional provider.
> - Send from a subdomain (`mail.` in my case). The DKIM, SPF and DMARC records live there, so the inbound mail routing on the root domain is never touched.
> - Before recreating an Unraid container from its template, diff the command the template would produce against the running container. That diff is what saved my secrets vault.

## Why not just run a mail server?

Getting mail accepted from a home connection is hard. A home connection usually can't send on port 25 at all, a residential IP tends to sit on spam blocklists, and I can't set the reverse DNS record that receivers check. Google's [sender guidelines](https://support.google.com/a/answer/81126) ask every sender for SPF or DKIM, TLS, and valid forward and reverse DNS. That last one is the record a home ISP won't give you.

That leaves four realistic options:

| Option | Effort | Catch |
| --- | --- | --- |
| Gmail with an app password | 5 minutes | Mail comes from a personal address, with a daily cap |
| A transactional email service | 15 minutes | One signup and a few DNS records |
| A local relay in front of a service | 20 minutes | One more container |
| A full mail server (Stalwart, Mailcow) | An evening, and forever | Delivery fights from a residential IP |

With one app, I'd point Forgejo straight at a provider and stop. With six, a relay pays for itself: only the relay holds the provider key, the apps send without a password, Postfix queues and retries when the provider hiccups, and switching providers later is one config change instead of six.

## Picking a provider

The agent pulled the current pricing pages for the usual suspects. For a homelab, the free tiers matter more than the price per thousand:

<figure>
<svg viewBox="0 0 720 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="er-tiers-title er-tiers-desc" style="width:100%;height:auto;display:block">
  <title id="er-tiers-title">Free tier monthly email volume by provider</title>
  <desc id="er-tiers-desc">Horizontal bar chart. Brevo allows about 9,000 emails a month (300 a day). Resend allows 3,000 a month with a cap of 100 a day. Mailgun allows about 3,000 (100 a day). SMTP2GO allows 1,000 a month (200 a day). Postmark allows 100 a month. My homelab sent about 17 emails on its first day.</desc>
  <style>.er-t{font-family:var(--font-display);font-size:15px;font-weight:700;fill:var(--fg)}.er-n{font-family:var(--font-sans);font-size:12.5px;font-weight:600;fill:var(--fg)}.er-v{font-family:var(--font-mono);font-size:10.5px;fill:var(--fg-muted)}.er-bar{fill:var(--bg-raised);stroke:var(--ink);stroke-width:2.5}.er-bar-focal{fill:var(--cyan);stroke:var(--ink);stroke-width:2.5}.er-sh{fill:var(--ink)}.er-axis{stroke:var(--fg);opacity:.2;stroke-width:1}[data-theme='dark'] .er-bar-focal{fill:var(--bg-raised);stroke:var(--cyan)}[data-theme='dark'] .er-sh{fill:var(--cyan)}</style>
  <text x="20" y="32" class="er-t">Free tier, emails per month</text>
  <line x1="150" y1="50" x2="150" y2="270" class="er-axis"/>
  <text x="140" y="79" text-anchor="end" class="er-n">Brevo</text>
  <rect x="153" y="63" width="500" height="26" rx="4" class="er-sh"/><rect x="150" y="60" width="500" height="26" rx="4" class="er-bar"/>
  <text x="160" y="104" class="er-v">≈9,000 (300 a day)</text>
  <text x="140" y="133" text-anchor="end" class="er-n">Resend</text>
  <rect x="153" y="117" width="167" height="26" rx="4" class="er-sh"/><rect x="150" y="114" width="167" height="26" rx="4" class="er-bar-focal"/>
  <text x="330" y="132" class="er-v">3,000 (100 a day) ← picked</text>
  <text x="140" y="187" text-anchor="end" class="er-n">Mailgun</text>
  <rect x="153" y="171" width="167" height="26" rx="4" class="er-sh"/><rect x="150" y="168" width="167" height="26" rx="4" class="er-bar"/>
  <text x="330" y="186" class="er-v">≈3,000 (100 a day, 1-day logs)</text>
  <text x="140" y="241" text-anchor="end" class="er-n">SMTP2GO</text>
  <rect x="153" y="225" width="56" height="26" rx="4" class="er-sh"/><rect x="150" y="222" width="56" height="26" rx="4" class="er-bar"/>
  <text x="218" y="240" class="er-v">1,000 (200 a day)</text>
  <text x="140" y="290" text-anchor="end" class="er-n">Postmark</text>
  <rect x="153" y="279" width="6" height="18" rx="2" class="er-sh"/><rect x="150" y="276" width="6" height="18" rx="2" class="er-bar"/>
  <text x="166" y="290" class="er-v">100, no overage</text>
  <text x="20" y="320" class="er-v">≈ = daily cap × 30. What my lab sent on day one: about 17.</text>
</svg>
<figcaption>Provider pricing pages, October 2026. Brevo states only a daily limit; the monthly figure is 300 × 30.</figcaption>
</figure>

Amazon SES is the cheapest at volume ($0.10 per 1,000 at its à la carte rate, though new accounts now start on a $0.16 plan) but takes the most setup. [Cloudflare Email Service](https://developers.cloudflare.com/email-service/platform/pricing/) was tempting, since my DNS already lives at Cloudflare: sending to addresses you have verified in your own account is free even on the free Workers plan, and sending to anyone else needs the $5-a-month Workers Paid plan, which includes 3,000 emails. But sending is still in beta, and I wanted to email people who aren't me.

I picked [Resend](https://resend.com/pricing). Its free tier is 3,000 emails a month (100 a day), it has SMTP on every plan, and it has an official MCP server, so the agent could create the domain, read back the DNS records and check delivery itself instead of asking me to click around a dashboard.

## The shape of it

<figure>
<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="er-arch-title er-arch-desc" style="width:100%;height:auto;display:block">
  <title id="er-arch-title">How mail leaves the homelab</title>
  <desc id="er-arch-desc">Six apps (Forgejo, n8n, Mealie, Seerr, Immich, Infisical) sit on a private Docker network called mail-net with no published ports. Each sends unauthenticated SMTP to a Postfix container called smtp-relay, which only accepts senders at the mail subdomain. The relay sends to Resend over port 587 with TLS, and Resend delivers to inboxes. A health-check script runs every 15 minutes and pushes the result to Uptime Kuma.</desc>
  <style>.ea-box{fill:var(--bg-raised);stroke:var(--ink);stroke-width:3}.ea-focal{fill:var(--cyan);stroke:var(--ink);stroke-width:3}.ea-good{fill:var(--green);stroke:var(--ink);stroke-width:3}.ea-warn{fill:var(--yellow);stroke:var(--ink);stroke-width:3}.ea-sh{fill:var(--ink)}.ea-n{font-family:var(--font-sans);font-size:12.5px;font-weight:600;fill:var(--on-fill)}.ea-s{font-family:var(--font-mono);font-size:10px;fill:var(--on-fill);opacity:.8}.ea-l{font-family:var(--font-mono);font-size:10px;fill:var(--fg-muted)}.ea-arrow{fill:none;stroke:var(--fg-muted);stroke-width:2}.ea-dash{stroke-dasharray:6 4}.ea-region{fill:none;stroke:var(--fg-muted);stroke-width:2;stroke-dasharray:8 6}.ea-tip{fill:var(--fg-muted)}[data-theme='dark'] .ea-focal,[data-theme='dark'] .ea-good,[data-theme='dark'] .ea-warn{fill:var(--bg-raised)}[data-theme='dark'] .ea-sh{fill:var(--cyan)}[data-theme='dark'] .ea-n{fill:var(--fg)}[data-theme='dark'] .ea-s{fill:var(--fg-muted);opacity:1}</style>
  <defs><marker id="ea-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="ea-tip"/></marker></defs>
  <rect x="12" y="44" width="476" height="380" rx="14" class="ea-region"/>
  <text x="24" y="34" class="ea-l">mail-net: private Docker network, no published ports</text>
  <g>
    <rect x="32" y="70" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="66" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="85" class="ea-n">Forgejo</text><text x="40" y="101" class="ea-s">git@</text>
    <rect x="32" y="128" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="124" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="143" class="ea-n">n8n</text><text x="40" y="159" class="ea-s">n8n@</text>
    <rect x="32" y="186" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="182" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="201" class="ea-n">Mealie</text><text x="40" y="217" class="ea-s">recipes@</text>
    <rect x="32" y="244" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="240" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="259" class="ea-n">Seerr</text><text x="40" y="275" class="ea-s">requests@</text>
    <rect x="32" y="302" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="298" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="317" class="ea-n">Immich</text><text x="40" y="333" class="ea-s">photos@</text>
    <rect x="32" y="360" width="170" height="44" rx="8" class="ea-sh"/><rect x="28" y="356" width="170" height="44" rx="8" class="ea-box"/>
    <text x="40" y="375" class="ea-n">Infisical</text><text x="40" y="391" class="ea-s">vault@</text>
  </g>
  <path d="M198 88 C250 88 250 222 296 222" class="ea-arrow" marker-end="url(#ea-head)"/>
  <path d="M198 146 C250 146 250 226 296 226" class="ea-arrow" marker-end="url(#ea-head)"/>
  <path d="M198 204 C250 204 250 230 296 230" class="ea-arrow" marker-end="url(#ea-head)"/>
  <path d="M198 262 C250 262 250 234 296 234" class="ea-arrow" marker-end="url(#ea-head)"/>
  <path d="M198 320 C250 320 250 238 296 238" class="ea-arrow" marker-end="url(#ea-head)"/>
  <path d="M198 378 C250 378 250 242 296 242" class="ea-arrow" marker-end="url(#ea-head)"/>
  <text x="214" y="64" class="ea-l">SMTP :587, no password</text>
  <rect x="302" y="184" width="170" height="100" rx="10" class="ea-sh"/><rect x="298" y="180" width="170" height="100" rx="10" class="ea-focal"/>
  <text x="310" y="204" class="ea-n">smtp-relay</text>
  <text x="310" y="222" class="ea-s">boky/postfix, pinned</text>
  <text x="310" y="238" class="ea-s">sender @mail.* only</text>
  <text x="310" y="254" class="ea-s">TLS required upstream</text>
  <text x="310" y="270" class="ea-s">queues and retries</text>
  <path d="M468 206 C505 206 505 128 540 128" class="ea-arrow" marker-end="url(#ea-head)"/>
  <text x="494" y="104" class="ea-l">587+TLS</text>
  <rect x="548" y="102" width="156" height="56" rx="8" class="ea-sh"/><rect x="544" y="98" width="156" height="56" rx="8" class="ea-box"/>
  <text x="556" y="121" class="ea-n">Resend (EU)</text><text x="556" y="139" class="ea-s">signs with DKIM</text>
  <path d="M622 154 V198" class="ea-arrow" marker-end="url(#ea-head)"/>
  <rect x="548" y="206" width="156" height="56" rx="8" class="ea-sh"/><rect x="544" y="202" width="156" height="56" rx="8" class="ea-good"/>
  <text x="556" y="225" class="ea-n">Inboxes</text><text x="556" y="243" class="ea-s">Gmail, Proton, …</text>
  <path d="M383 280 C383 360 470 360 540 360" class="ea-arrow ea-dash" marker-end="url(#ea-head)"/>
  <text x="394" y="304" class="ea-l">health check</text>
  <text x="394" y="318" class="ea-l">every 15 min</text>
  <rect x="548" y="336" width="156" height="56" rx="8" class="ea-sh"/><rect x="544" y="332" width="156" height="56" rx="8" class="ea-warn"/>
  <text x="556" y="355" class="ea-n">Uptime Kuma</text><text x="556" y="373" class="ea-s">push monitor → Slack</text>
</svg>
<figcaption>Only the relay holds the provider key. The apps never see it, and nothing on the LAN can reach the relay.</figcaption>
</figure>

Each app gets its own sender (`git@`, `recipes@`, `vault@` and so on) on the same subdomain, so the provider's log tells me at a glance which app sent what.

## A subdomain for sending, so inbound mail stays safe

My root domain already receives mail through Cloudflare Email Routing: three MX records and an SPF record that points at Cloudflare. I didn't want to touch any of that, so all the sending records live under `mail.teodorkurtev.com`. The agent created the domain through the Resend MCP server, read back the records it needed, and wrote them into Cloudflare through the Cloudflare MCP server:

| Type | Name | Does what |
| --- | --- | --- |
| TXT | `resend._domainkey.mail` | DKIM public key, so receivers can check the signature |
| MX | `send.mail` | Where bounces come back (Resend's default Return-Path) |
| TXT | `send.mail` | SPF for that Return-Path |
| CNAME | `rsend.mail` | A second Return-Path for [Resend Forge](https://resend.com/docs/resend-forge), Resend's own sending infrastructure. It must be **DNS only** (grey cloud), not proxied |
| TXT | `_dmarc.mail` | `v=DMARC1; p=none;`, monitoring mode |

DMARC isn't required at my volume (Google only insists on it for senders above 5,000 messages a day to Gmail addresses), but `p=none` costs nothing and helps. Verification passed within five minutes of the records going in.

The API key the relay uses can only send, and only from that subdomain. The first test message went straight from my Mac to Resend over SMTPS and showed up as delivered in the Resend log a few seconds later.

Storing that key had a wrinkle of its own. My [MCP launcher](/blog/hardening-my-homelab-mcp-setup/) injects every secret at the root of the Infisical project into every MCP server it starts. A mail key has no business in a Home Assistant server's environment, so it went into a `/mail` folder that the launcher doesn't read. The machine identity on my Mac is read-only (the agent's attempt to create the folder got a 403), and Claude Code's auto mode refused to let the agent write the key to a scratch file, so I pasted it into the Infisical UI myself.

## The relay

The relay is [boky/postfix](https://github.com/bokysan/docker-postfix), pinned to `5.1.0-alpine`, configured entirely with environment variables:

```bash
RELAYHOST=[smtp.resend.com]:587
RELAYHOST_USERNAME=resend
RELAYHOST_PASSWORD=<send-only key from Infisical>
ALLOWED_SENDER_DOMAINS=mail.teodorkurtev.com
POSTFIX_smtp_tls_security_level=encrypt
POSTFIX_myhostname=smtp-relay.home.example
```

`ALLOWED_SENDER_DOMAINS` means the relay only sends as my subdomain, and with no published ports, only containers on `mail-net` can reach it at all. `smtp_tls_security_level=encrypt` means Postfix refuses to talk to Resend without TLS instead of falling back to plain text. The spool directory is a volume, so queued mail survives a restart.

It publishes no ports. It lives on a new user-defined Docker network, `mail-net`, and the apps reach it by name. That needed one decision: my apps were split across the default `bridge` network (which has no name-based DNS) and a custom network for the media stack. Rather than move anything, each app joins `mail-net` as a second network. Unraid templates have no field for that, so the usual trick is the **Post Arguments** field, which Unraid pastes after the image name in the `docker run` command:

```text
; docker network connect mail-net Forgejo
```

It runs every time the container is recreated, so it survives updates. Unraid's Docker settings also need **Preserve user defined networks** turned on, or `mail-net` disappears after a reboot. Mine already had it.

The test the agent ran before touching any app: from a throwaway container on `mail-net`, send once as `relay-test@mail.teodorkurtev.com` (accepted, delivered) and once as `x@example.com` (rejected with `554 5.7.1 Access denied`).

## Wiring up six apps

The changes for each app were small:

- **Forgejo:** `FORGEJO__mailer__*` environment variables pointing at `smtp-relay:587`.
- **n8n:** `N8N_EMAIL_MODE=smtp` plus `N8N_SMTP_HOST`, `N8N_SMTP_PORT` and `N8N_SMTP_SENDER`, with TLS off because the hop never leaves `mail-net`.
- **Mealie:** replace the `changeme` Gmail settings, set `SMTP_AUTH_STRATEGY=NONE`, and fix `BASE_URL`, which still pointed at an old `.home` hostname and port.
- **Seerr:** email settings through its API, plus the **Application URL**. Without that, Seerr shows "Configure an application URL and enable email notifications to allow automatic password generation" and won't email new users their password.
- **Immich:** SMTP lives in its admin UI. I typed that part in.
- **Infisical:** environment variables, with its bundled Mailpit inbox switched off.

Each app got a dated backup of its template, a recreate, a check that it could reach `smtp-relay:587`, and then a real email: a test button where the app had one, an actual invite where it didn't.

One habit worth copying if an agent is doing this over SSH: make it reuse one connection. Mine opened a fresh SSH session for every command, dozens of them in a row. My SSH config had `ControlMaster` turned on for the NAS, but the socket directory it pointed at didn't exist and nothing kept the master alive between commands. With the directory created and every command run as `ssh -o ControlPersist=10m nas …`, they all share one connection.

## What broke

<figure>
<svg viewBox="0 0 720 275" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="er-time-title er-time-desc" style="width:100%;height:auto;display:block">
  <title id="er-time-title">The afternoon, minute by minute</title>
  <desc id="er-time-desc">Timeline from 13:55 to 15:10 UTC. Domain created at 13:58 and verified by 14:03, relay test delivered at 14:07. Forgejo was down for about 35 seconds at 14:09. n8n was wired at 14:19, Mealie at 14:26, Seerr at 14:33. Immich was down for 8 minutes from 14:40. Infisical was wired at 15:07 with about 30 seconds of downtime.</desc>
  <style>.et-t{font-family:var(--font-display);font-size:15px;font-weight:700;fill:var(--fg)}.et-l{font-family:var(--font-mono);font-size:10px;fill:var(--fg)}.et-m{font-family:var(--font-mono);font-size:10px;fill:var(--fg-muted)}.et-axis{stroke:var(--ink);stroke-width:3}.et-tick{stroke:var(--fg-muted);stroke-width:1.5}.et-dot{fill:var(--cyan);stroke:var(--ink);stroke-width:2}.et-bad{fill:var(--pink);stroke:var(--ink);stroke-width:2}.et-stem{stroke:var(--fg-muted);stroke-width:1;stroke-dasharray:3 3}[data-theme='dark'] .et-axis{stroke:var(--fg)}</style>
  <text x="20" y="30" class="et-t">The afternoon, in UTC</text>
  <line x1="40" y1="150" x2="680" y2="150" class="et-axis"/>
  <line x1="83" y1="150" x2="83" y2="158" class="et-tick"/><text x="83" y="172" text-anchor="middle" class="et-m">14:00</text>
  <line x1="211" y1="150" x2="211" y2="158" class="et-tick"/><text x="211" y="172" text-anchor="middle" class="et-m">14:15</text>
  <line x1="339" y1="150" x2="339" y2="158" class="et-tick"/><text x="339" y="172" text-anchor="middle" class="et-m">14:30</text>
  <line x1="467" y1="150" x2="467" y2="158" class="et-tick"/><text x="467" y="172" text-anchor="middle" class="et-m">14:45</text>
  <line x1="595" y1="150" x2="595" y2="158" class="et-tick"/><text x="595" y="172" text-anchor="middle" class="et-m">15:00</text>
  <line x1="66" y1="124" x2="66" y2="150" class="et-stem"/><circle cx="66" cy="150" r="5" class="et-dot"/><text x="40" y="118" class="et-l">domain created</text>
  <line x1="108" y1="156" x2="108" y2="190" class="et-stem"/><circle cx="108" cy="150" r="5" class="et-dot"/><text x="104" y="202" text-anchor="end" class="et-l">verified</text>
  <line x1="142" y1="72" x2="142" y2="150" class="et-stem"/><circle cx="142" cy="150" r="5" class="et-dot"/><text x="110" y="66" class="et-l">relay test delivered</text>
  <line x1="249" y1="124" x2="249" y2="150" class="et-stem"/><circle cx="249" cy="150" r="5" class="et-dot"/><text x="238" y="118" class="et-l">n8n</text>
  <line x1="305" y1="98" x2="305" y2="150" class="et-stem"/><circle cx="305" cy="150" r="5" class="et-dot"/><text x="288" y="92" class="et-l">Mealie</text>
  <line x1="364" y1="124" x2="364" y2="150" class="et-stem"/><circle cx="364" cy="150" r="5" class="et-dot"/><text x="350" y="118" class="et-l">Seerr</text>
  <line x1="654" y1="98" x2="654" y2="150" class="et-stem"/><circle cx="654" cy="150" r="5" class="et-dot"/><text x="680" y="92" text-anchor="end" class="et-l">Infisical</text>
  <rect x="160" y="186" width="6" height="16" class="et-bad"/><text x="172" y="198" class="et-l">Forgejo, ~35 s</text>
  <rect x="424" y="186" width="68" height="16" class="et-bad"/><text x="498" y="198" class="et-l">Immich, 8 min</text>
  <rect x="656" y="186" width="5" height="16" class="et-bad"/><text x="680" y="222" text-anchor="end" class="et-l">Infisical, ~30 s</text>
  <text x="40" y="262" class="et-m">Pink: app down.</text>
</svg>
<figcaption>About 70 minutes from the first DNS record to the last app, with three short outages.</figcaption>
</figure>

### Unraid ate my angle brackets

The obvious Forgejo sender value is `Forgejo <git@mail.teodorkurtev.com>`. After the recreate, Forgejo exited during startup with:

```text
Invalid mailer.FROM (Forgejo git@mail.teodorkurtev.com): mail: no angle-addr
```

Unraid had stripped the `<` and `>` out of the template value on the way to `docker run`, and Forgejo refuses to start with a sender it can't parse, which is the right behaviour. A bare `git@mail.teodorkurtev.com` fixed it after about 35 seconds of downtime. For the other apps I used bare addresses, or each app's separate "from name" field where it had one.

### The rebuild that forgot Tailscale

To recreate containers from their templates without clicking through the web UI, the agent used Unraid's own `rebuild_container` script. It worked for Forgejo, n8n, Mealie and Seerr. Immich came back as `Exited (0)` nine seconds after starting, with a log that ended in:

```text
Serve started and running in the background.
Starting container...
```

The first suspect was the new Post Arguments, so the agent restored the template backup and rebuilt again. Same result. The real cause was in Unraid's PHP. Immich uses Unraid's Tailscale integration, which swaps the container's entrypoint for a Tailscale wrapper and passes the image's original entrypoint along in `ORG_ENTRYPOINT`. The web UI's `CreateDocker.php` adds that variable. The command-line `rebuild_container` doesn't. So the wrapper started Tailscale, had nothing to hand over to, and exited cleanly.

The fix was a small script that does what the web UI does: read the entrypoint from `docker image inspect`, add `-e ORG_ENTRYPOINT="/init"`, and create the container. Immich was down for 8 minutes, the longest outage of the day.

### The template that could have broken my vault

Infisical runs from an all-in-one image that bundles its own Postgres and Redis. Before rebuilding it, the agent compared the template with the running container. They didn't match. The container had 24 environment variables. The template had grown to **230**, probably through a Community Applications update, and **208 of them were empty**.

That matters because of how the image starts up:

<figure>
<svg viewBox="0 0 720 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="er-mine-title er-mine-desc" style="width:100%;height:auto;display:block">
  <title id="er-mine-title">How an empty template field would have hidden the vault's encryption key</title>
  <desc id="er-mine-desc">The Unraid template has 230 fields, 208 of them empty. Unraid passes each as an environment variable, including ENCRYPTION_KEY and AUTH_SECRET set to empty strings. The image's startup wrapper only loads saved values from generated.env for variables that are not already set, so the real key in generated.env is never loaded, and Infisical would start with an empty encryption key.</desc>
  <style>.em-box{fill:var(--bg-raised);stroke:var(--ink);stroke-width:3}.em-bad{fill:var(--pink);stroke:var(--ink);stroke-width:3}.em-good{fill:var(--green);stroke:var(--ink);stroke-width:3}.em-sh{fill:var(--ink)}.em-n{font-family:var(--font-sans);font-size:12.5px;font-weight:600;fill:var(--on-fill)}.em-s{font-family:var(--font-mono);font-size:10px;fill:var(--on-fill);opacity:.8}.em-l{font-family:var(--font-mono);font-size:10px;fill:var(--fg-muted)}.em-arrow{fill:none;stroke:var(--fg-muted);stroke-width:2}.em-dash{stroke-dasharray:6 4}.em-tip{fill:var(--fg-muted)}[data-theme='dark'] .em-bad,[data-theme='dark'] .em-good{fill:var(--bg-raised)}[data-theme='dark'] .em-sh{fill:var(--cyan)}[data-theme='dark'] .em-n{fill:var(--fg)}[data-theme='dark'] .em-s{fill:var(--fg-muted);opacity:1}</style>
  <defs><marker id="em-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="em-tip"/></marker></defs>
  <rect x="24" y="44" width="150" height="70" rx="8" class="em-sh"/><rect x="20" y="40" width="150" height="70" rx="8" class="em-box"/>
  <text x="32" y="64" class="em-n">Unraid template</text><text x="32" y="82" class="em-s">230 fields</text><text x="32" y="98" class="em-s">208 of them empty</text>
  <path d="M170 75 H198" class="em-arrow" marker-end="url(#em-head)"/>
  <rect x="206" y="44" width="150" height="70" rx="8" class="em-sh"/><rect x="202" y="40" width="150" height="70" rx="8" class="em-box"/>
  <text x="214" y="64" class="em-n">docker run</text><text x="214" y="82" class="em-s">-e ENCRYPTION_KEY=''</text><text x="214" y="98" class="em-s">-e AUTH_SECRET=''</text>
  <path d="M352 75 H380" class="em-arrow" marker-end="url(#em-head)"/>
  <rect x="388" y="44" width="150" height="70" rx="8" class="em-sh"/><rect x="384" y="40" width="150" height="70" rx="8" class="em-box"/>
  <text x="396" y="64" class="em-n">startup wrapper</text><text x="396" y="82" class="em-s">loads saved values</text><text x="396" y="98" class="em-s">only if var is unset</text>
  <path d="M534 75 H562" class="em-arrow" marker-end="url(#em-head)"/>
  <rect x="570" y="44" width="134" height="70" rx="8" class="em-sh"/><rect x="566" y="40" width="134" height="70" rx="8" class="em-bad"/>
  <text x="578" y="64" class="em-n">Infisical</text><text x="578" y="82" class="em-s">no encryption key</text><text x="578" y="98" class="em-s">secrets unreadable</text>
  <rect x="388" y="194" width="150" height="62" rx="8" class="em-sh"/><rect x="384" y="190" width="150" height="62" rx="8" class="em-good"/>
  <text x="396" y="214" class="em-n">generated.env</text><text x="396" y="232" class="em-s">the real key</text>
  <path d="M459 190 V122" class="em-arrow em-dash" marker-end="url(#em-head)"/>
  <text x="468" y="160" class="em-l">skipped: already set (to '')</text>
  <text x="20" y="280" class="em-l">Today's container predates the template update, which is the only reason it worked.</text>
</svg>
<figcaption>The wrapper's check is "is it set?", not "is it empty?". An empty string counts as set.</figcaption>
</figure>

The image keeps its generated encryption key, auth secret and database URL in `/config/aio/generated.env`, and its startup script only loads a value from there if the variable isn't already set. Unraid passes empty template fields as `-e 'ENCRYPTION_KEY'=''`, and an empty string counts as set. Recreating from that template would have started Infisical with an empty encryption key and no database settings. Infisical holds the credentials for every MCP server in the lab, so a mistake there takes everything down with it. It's also a trap I'd have walked into one day just by clicking **Apply** in the Unraid web UI.

So the agent did it slowly. First, a `pg_dump` of the database (4.2 MB), a tarball of the config folder and a copy of the template. Then two cleaned templates: one reproducing today's container exactly as a rollback, and one with the email settings added. Then a dry run of each, comparing the generated `docker run` command against `docker inspect` of the live container. The dry run caught one more surprise: two port fields with an empty host port, which Docker would have published on random host ports (one of them Mailpit's web UI). Only when the diff showed nothing but the intended email changes did it recreate the container.

Thirty seconds later Infisical answered with `"emailConfigured": true`, its log said `SMTP - Verified connection to smtp-relay:587`, my Mac could still log in and decrypt the mail key, and all eight root secrets were readable.

### Delivered doesn't mean read

A Mealie invite went to an address with a one-letter typo; the receiving server rejected it, Resend marked it **bounced**, and Resend adds bounced addresses to a suppression list automatically, so it will never send there again. The corrected invite was delivered a minute later.

Also, "delivered" in Resend means the receiving server accepted the message, not that a human saw it. A new sending domain can land in spam folders for a while, so the first few emails are worth checking for there.

## Knowing when mail stops

A relay that dies silently is worse than no relay, because every app will happily report "email sent". So the relay got an [Uptime Kuma](/blog/my-homelab-runs-on-mcp/) monitor the same afternoon. Its port isn't published, so a normal TCP monitor can't reach it. Instead, a small script on the NAS runs every 15 minutes from Unraid's cron and pushes the result:

```bash
[ "$(docker inspect -f '{{.State.Running}}' smtp-relay)" = true ] || fail "container not running"
# … read a 220 banner from port 587 over bash's /dev/tcp …
stuck=$(docker exec smtp-relay postqueue -j | … | awk -v n="$now" 'n - $1 > 900' | wc -l)
[ "$stuck" -eq 0 ] || fail "$stuck message(s) queued > 15 min"
push up OK
```

The queue check catches what the other two miss. If the key is revoked or Resend starts refusing mail, the container stays healthy and port 587 keeps answering, but mail starts piling up in the queue. That's the failure I'd otherwise discover weeks later, when someone mentions they never got their invite. If the push stops arriving entirely, the monitor goes down after 20 minutes on its own, which covers the script or cron itself breaking.

## Frequently asked questions

### Is a free tier really enough for a homelab?

For invites, password resets and the odd notification, yes. My first day, which included all the testing, came to about 17 emails against a cap of 100 a day. What would break it is pointing chatty notifications at email, such as every download a media server grabs. Those belong in Slack or a push notification.

### Do the links in these emails work outside my home?

Only if the app's URL is reachable from where you click. Mine all live on a LAN-only internal domain, so an invite opened on mobile data goes nowhere until you join the home network or VPN. The email side works anywhere; the links are a separate decision about what you expose.

### Why not put the Resend MCP server into my homelab plugin?

The plugin from [my homelab MCP post](/blog/my-homelab-runs-on-mcp/) starts every server through a launcher that fetches its secret from Infisical. Resend's hosted MCP server logs in with OAuth instead, so I kept Resend's own plugin and documented it as a one-time install and login per device.

## What's next

Six apps can now invite people, and I have a checklist I'll reuse: one relay, one subdomain, one send-only key, one health check, and a dry-run diff before recreating any Unraid container. The diff is the part I'd tell anyone to copy: it turned "rebuild the vault and hope" into a change I could read before making it.

Next on the list are Unraid's own alerts (disk, parity, SMART), which need the relay reachable from the host itself, and password resets for Paperless. 📬
