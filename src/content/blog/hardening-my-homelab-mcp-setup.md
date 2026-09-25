---
title: 'Hardening my homelab MCP setup: no more logging in every 3 days'
description: 'A follow-up: a vault login that expired every few days, a secret that never does, a launcher that hides it from MCP servers, and a bot that bumps pins.'
pubDate: 2026-09-26T12:00:00+03:00
draft: false
tags:
  - AI
  - Claude Code
---

In [the first post about my homelab](/blog/my-homelab-runs-on-mcp/) I called the secrets vault a single point of failure _on purpose_: if the Infisical CLI isn't authenticated, every MCP server fails together, loudly. I'll take one loud failure mode over five quiet ones, I said.

It turns out that one loud failure happened every two to three days. The CLI rode my personal login session, and on this instance that session expires fast. Every few days I'd open a terminal, find Home Assistant, Unraid, UniFi, n8n and Uptime Kuma all gone, log in again, and restart. The failure was obvious. It was also constant.

So I sat down with the agent for an evening to fix the login. By the end, the fix had turned into a small hardening pass over the whole setup: the auth, how servers launch, what they can see, how versions ship, and how upstream releases arrive. This is what changed, what I measured, and where the agent (and I) tripped.

> **Key takeaways**
>
> - A machine identity with Universal Auth replaced my expiring user login. The client secret never expires; a short-lived access token is created at every server launch, so nothing needs renewing.
> - One launcher script now starts every MCP server. It fails in about 3 seconds when I'm off the home network, and it makes sure third-party servers never see the Infisical credential.
> - Plugin versions bump themselves (pre-commit hook plus a CI backstop), and a weekly bot opens a PR when a pinned package has a new release. Its first run found two stale pins.

## From a login that expires to a secret that doesn't

The fix I'd already written down in [the original post's "next up" list](/blog/my-homelab-runs-on-mcp/#should-you-do-this) was _a machine identity instead of my user session_. Infisical has several auth methods for those. I tried the simple one first.

**Attempt one: Token Auth.** You create an identity, mint a token, and put it where the CLI can see it. I created one per device ("Personal Mac Pro"), and the first test came back with:

```
403: You are not a member of this project
```

A 403 rather than a 401 was actually good news: the server knew exactly who the token belonged to. The identity existed at the organisation level but had never been added to the `homelab` project. One click in the UI, re-test, and all six secrets injected.

The catch surfaced a minute later: [Token Auth](https://infisical.com/docs/documentation/platform/identities/token-auth) on my instance caps the token lifetime at **90 days**. Better than three, but still a date in the calendar I'd eventually forget.

**Attempt two: [Universal Auth](https://infisical.com/docs/documentation/platform/identities/universal-auth).** Here the identity gets a client ID and a client secret, and the secret can be created with **no expiry at all**. The client exchanges it for a short-lived access token whenever it needs one. `infisical run` only needs a token for the second it takes to fetch secrets at startup, so it doesn't matter how quickly the token expires.

That is a real trade-off, and it walks back a claim from the first post. I wrote there that tokens exist nowhere on disk on any client machine. The homelab secrets still don't, but the key to the vault now does: the client secret sits in plain text in `~/.claude/settings.json` on each device, and a leaked one works until I revoke it, where a leaked 90-day token dies on its own. I took that trade because the identity is read-only, scoped to one project, and revocable in one click. Rotating quarterly forever is its own risk: the risk that I don't. (Moving it into the macOS Keychain would at least get it out of plain text.)

## One launcher instead of five copies of the same flags

In the first post, every server in the plugin's `.mcp.json` carried its own copy of the Infisical flags: project ID, domain, environment. Five servers, five copies. Supporting Universal Auth meant adding login logic, so the agent first pulled all of that into one script, `bin/with-infisical`, and every server now launches through it:

```json
"ha-mcp": {
  "command": "${CLAUDE_PLUGIN_ROOT}/bin/with-infisical",
  "args": ["uvx", "ha-mcp@8.5.0"]
}
```

`${CLAUDE_PLUGIN_ROOT}` points at the plugin's install directory, so the same path works on every device. The script does three jobs.

**It fails fast off the LAN.** My vault is only reachable at home. Before, leaving the house meant five servers each hanging until their own timeout and then failing with errors that pointed nowhere. Now the launcher makes one request to Infisical's status endpoint, bounded at 3 seconds. In testing against an address that never answers, it gave up after **3.2 seconds** with `did not answer within 3s (off the home LAN?)`, naming the server it didn't start.

**It picks the auth.** If a token is set, it wins. If a client ID and secret are set instead, the launcher logs in and gets a fresh access token for this one launch. The CLI reads both from environment variables, so the secret never appears on a command line where `ps` would show it.

**It keeps credentials away from the servers.** This is the one I didn't plan. While writing the login step, the agent pointed out that every MCP server inherits the launcher's environment. Those servers are third-party packages pulled from PyPI and npm at launch. With the token setup I'd had for the previous hour, every one of them could read the vault token.

So the launcher now drops the client secret before `infisical run` starts, and runs the server under `env -u INFISICAL_TOKEN`. The server gets the homelab secrets it actually needs, and nothing that could fetch more. We didn't trust the script to be right about this: the agent checked the live processes with `ps -E`, and the wrapper held only the short-lived token while the server held **no Infisical credential at all**.

<figure>
  <svg viewBox="0 0 720 470" role="img" aria-labelledby="creds-diagram-title creds-diagram-desc" style="width:100%;height:auto;font-family:var(--font-sans)">
    <title id="creds-diagram-title">Where the Infisical credential lives, before and after</title>
    <desc id="creds-diagram-desc">Before: a Token Auth token in settings reaches the launcher, the infisical run wrapper and the MCP server itself. After: a never-expiring client secret stops at the launcher, the wrapper holds only a short-lived access token, and the MCP server receives only the homelab secrets it needs.</desc>
    <g fill="var(--fg)" font-size="15" font-weight="600" text-anchor="middle">
      <text x="270" y="30">Before (Token Auth)</text>
      <text x="560" y="30">After (Universal Auth)</text>
    </g>
    <g fill="var(--fg-muted)" font-size="13" font-weight="600" text-anchor="start">
      <text x="10" y="92">settings.json</text>
      <text x="10" y="192">launcher</text>
      <text x="10" y="292">infisical run</text>
      <text x="10" y="392">MCP server</text>
    </g>
    <g stroke="var(--border)" fill="var(--bg-raised)">
      <rect x="140" y="60" width="260" height="56" rx="8"></rect>
      <rect x="140" y="160" width="260" height="56" rx="8"></rect>
      <rect x="140" y="260" width="260" height="56" rx="8"></rect>
      <rect x="430" y="60" width="260" height="56" rx="8"></rect>
      <rect x="430" y="160" width="260" height="56" rx="8"></rect>
      <rect x="430" y="260" width="260" height="56" rx="8"></rect>
    </g>
    <rect x="140" y="360" width="260" height="56" rx="8" fill="var(--pink)" stroke="var(--ink)"></rect>
    <rect x="430" y="360" width="260" height="56" rx="8" fill="var(--green)" stroke="var(--ink)"></rect>
    <g fill="var(--fg)" font-size="13" text-anchor="middle">
      <text x="270" y="84">vault token</text>
      <text x="270" y="184">passes it through</text>
      <text x="270" y="284">vault token</text>
      <text x="560" y="84">client ID + secret</text>
      <text x="560" y="184">logs in, drops the secret</text>
      <text x="560" y="284">short-lived token only</text>
    </g>
    <g fill="var(--fg-muted)" font-size="12" text-anchor="middle">
      <text x="270" y="104">expires in 90 days</text>
      <text x="270" y="204">nothing stripped</text>
      <text x="270" y="304">fetches the homelab secrets</text>
      <text x="560" y="104">never expires</text>
      <text x="560" y="204">bin/with-infisical</text>
      <text x="560" y="304">fetches the homelab secrets</text>
    </g>
    <g fill="var(--on-fill)" font-size="13" text-anchor="middle">
      <text x="270" y="384" font-weight="600">homelab secrets + vault token</text>
      <text x="270" y="404">third-party code sees the key</text>
      <text x="560" y="384" font-weight="600">homelab secrets only</text>
      <text x="560" y="404">no Infisical credential</text>
    </g>
    <g stroke="var(--fg-muted)" fill="none">
      <line x1="270" y1="116" x2="270" y2="156"></line>
      <line x1="270" y1="216" x2="270" y2="256"></line>
      <line x1="270" y1="316" x2="270" y2="356"></line>
      <line x1="560" y1="116" x2="560" y2="156"></line>
      <line x1="560" y1="216" x2="560" y2="256"></line>
      <line x1="560" y1="316" x2="560" y2="356"></line>
    </g>
  </svg>
  <figcaption style="font-size:var(--text-sm);color:var(--fg-muted);text-align:center;margin-top:0.5rem">The credential used to stop nowhere. Now each layer holds only what it needs.</figcaption>
</figure>

One consequence worth knowing: with Universal Auth, a bare `infisical run` in a terminal no longer works as a quick test, because the CLI only swaps a client secret for a token when asked to. It falls back to the expired user login and fails for the wrong reason. Every manual check in the docs now goes through the launcher, the same way the servers do.

## The validator had a blind spot

The marketplace repo has a small validator that runs in CI and enforces the house rules: every server wrapped in Infisical, no secrets in config, every package pinned to an exact version.

Asked to review the repo, the agent found the pin check only looked at the first word after `--` in each server's arguments. For the n8n server that word is `sh`, because the HTTP bridge lives inside a `sh -c '… mcp-remote@latest …'` string. So the one unapproved break from "pin everything" was in the one server the validator couldn't see.

It now checks every word of every argument, including inside shell strings, and it also verifies the launcher exists, is executable and carries the right Infisical coordinates. To make sure the new rules actually fire, the agent ran the validator against four deliberately broken copies of the repo. Running it against the old config was the satisfying part: the old validator had passed it, and the new one flagged `mcp-remote@latest` straight away.

## Versions that ship themselves

Here's a failure mode I hadn't noticed yet but would have eventually. Claude Code [stores installed plugins by version](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces). If I push a change without raising the version number in the manifests, no device ever receives it: they already have "that version" cached. And there are two manifests that must agree: `plugin.json` and `marketplace.json`.

The agent's first suggestion was the tidy one: remove `version` entirely and Claude Code falls back to the commit SHA, so every push ships. I said no, because I want to read "2.6.1" in `/plugin`, not a hash. So it built the other option:

- A **pre-commit hook** raises the patch version in both manifests whenever a commit touches the plugin's folder, and leaves it alone if I've already raised it myself for a minor or major release. Changes to the README or CI never reach devices, so they don't bump.
- A **CI check** fails any push that changes plugin files without raising the version. That covers the ways around the hook: an edit in the Forgejo web UI, a fresh clone without the hook enabled, `--no-verify`.

I didn't take the CI check on faith either. It compares against the previous commit, and I wasn't sure Forgejo passes that the way GitHub does, so I read the log: `kurtevi-homelab-personal: 2.5.2 → 2.5.3`, `version bumps OK`. The plugin went from 2.4.1 to 2.6.1 over the evening, and I never edited a version number by hand.

## A bot that watches upstream

Pinning is right, but pinning has a cost: upstream releases never arrive on their own. Checking five packages by hand is exactly the kind of chore I stop doing.

So there's now a weekly [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/) workflow on [the NAS](/uses/). A small script reads every pin in `.mcp.json`, asks PyPI and npm for the latest release, rewrites what's behind, bumps the plugin version, and opens a single PR listing old and new versions with links. If the same bumps are already waiting in an open PR, it leaves the branch alone rather than rewriting it every Monday.

Its very first run found two stale pins I had no idea about:

- `mcp-uptime-kuma` **0.11.0 → 0.11.18**
- `unifi-network-mcp` **0.26.0 → 0.32.10**

CI can't test those, because it deliberately holds no homelab credentials. So the PR body carries the one command that matters, a local probe that starts every server and completes an MCP handshake. The agent had probed both new versions locally before I even triggered the bot, so I merged, and on the next update my Mac picked up the release (2.5.3 at that point; the evening ended on 2.6.1).

Two details that took a moment to get right. The bot pushes with a personal access token rather than the built-in workflow token, because pushes made with the built-in token typically don't trigger other workflows, and I wanted CI to run on the bot's PR. It did. And `ha-mcp`, which the first post's config deliberately left on `@latest`, is now pinned too. With a bot doing the bumping, there was no reason left for the exception.

## The sharp edges 🙈

- **The marketplace had the wrong name on my own machine.** The repo calls it `kurtevi-homelab`; my Mac had registered it as `homelab`. Every update command in my own docs failed on the one device I use most. Re-registering fixed it, but it silently switched auto-update off, which I only noticed because the agent compared the before and after.
- **The agent pushed a broken commit.** It ran the lint check piped through `tail`, which swallowed the failing exit code, and committed anyway. CI went red on `main`. It said so plainly, pushed the fix within the minute, and switched to checking the real exit code.
- **Old sessions kept old servers alive.** After the switch, two Claude Code sessions I'd left open in other terminals were still running the previous servers, one of them with the old token in its environment. The agent found them by walking the process tree back to each session. Restarting "Claude" isn't one thing when you have three of them open.
- **Leftovers from an app I'd forgotten about.** The agent kept telling me to restart a desktop app I don't remember installing. The app itself was long gone, but it had left 120 permission rules, six hooks, a status line and an MCP server behind in my Claude Code config. The agent listed every file before deleting anything, which is what I'd ask of any engineer.

## What's next

The first post ended with three things for the lab. Two are done: the last server (UniFi) has moved onto the vault, and the machine identity is in, done better than I'd planned. The doorbell is a story for another post. And this evening added something to the list that jumps the queue: **scheduled backups of the vault itself**. Everything, including the never-expiring secret and every homelab credential, now depends on one container on the NAS. The restore drill from the first post proved a backup _can_ work. A nightly job is what makes sure one exists. 🔐

If you run something similar, my one piece of advice from this evening: ask your agent to review the setup it helped build. It found the unpinned package, the leaking token and the missing version bumps. I'd written the rules; it checked whether the code actually followed them.
