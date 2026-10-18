---
title: 'My homelab runs on MCP: an AI agent with real hands'
description: 'Giving an AI agent real hands on my homelab: MCP servers for Home Assistant, Unraid and UniFi, a private plugin marketplace and self-hosted secrets.'
pubDate: 2026-08-12T12:00:00+03:00
draft: false
tags:
  - AI
  - Claude Code
pillar: homelab
pinned: true
---

Most people use AI assistants to _talk about_ their infrastructure. Mine can actually touch it.

When I open a terminal on any of my machines, the agent comes up with tools for the whole homelab: it can query the NAS, control Home Assistant, inspect the UniFi network, build n8n workflows and manage uptime monitors. Those tools are MCP servers that load automatically, with credentials the agent never sees, so I'm not feeding it copy-pasted `curl` commands.

A quick definition, since it's the backbone of everything here: [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) is an open standard for connecting AI assistants to external systems. A small server wraps a system's API and exposes it as tools; any MCP-capable agent can then discover and call them.

Ever since [rebuilding this site with an AI agent](/blog/rebuilding-my-site-with-an-ai-agent/), I've been pushing the same way of working onto my infrastructure. This post is about how that's wired together, what the agent has actually done with it, and the sharp edges I hit along the way.

## The estate: what the agent can reach

The lab is nothing exotic, which is rather the point: this setup makes _ordinary_ infrastructure agent-operable. The full hardware rundown lives on my [Uses page](/uses/), but the short version:

- **NAS** ("NAS-Boy" 👋): Unraid on an i7-9700K, ~40TB of storage and a fleet of self-hosted Docker services: Paperless, Immich, Caddy, a Forgejo git server and more.
- **Home Assistant** on a mini PC: the smart-home brain for lights, heating, cameras and a couple of in-progress integrations (a video doorbell and an alarm panel).
- **UniFi** networking with segmented VLANs for people, IoT and security devices.
- **n8n** for workflow automation, **Uptime Kuma** for monitoring, and a self-hosted **Infisical** instance for secrets, all fronted by Caddy on a LAN-only internal domain with proper Let's Encrypt certificates.

Each of those has an MCP server. Some are third-party ([`ha-mcp`](https://github.com/homeassistant-ai/ha-mcp), an Unraid GraphQL server, an Uptime Kuma one), n8n ships its own, and UniFi has a community server. What's worth writing about is how they're delivered and authenticated.

## Delivering MCP servers with a private plugin marketplace

Claude Code supports [plugins](https://docs.claude.com/en/docs/claude-code/plugins): bundles of MCP servers, skills and configuration you install from a marketplace. A marketplace is just a git repo. So I run my own, hosted on the Forgejo instance on the NAS. Nothing leaves the network.

Setting up a new machine is four commands:

```
/plugin marketplace add https://git.<internal-domain>/teodor92/homelab-plugins.git
/plugin install kurtevi-homelab-personal@kurtevi-homelab
/plugin install unifi-network@kurtevi-homelab
/plugin install unraid-mcp@claude-homelab
```

Restart the session and the agent knows the whole lab. The plugin also carries **skills**, which are the house rules to go with the hands: instructions the agent loads for specific jobs, like Home Assistant best practices (use entity IDs not device IDs, prefer helpers over templates) or how to authenticate against the n8n instance.

## Secrets: the part everyone gets wrong

Every MCP server needs a credential, and the first version of this handled them the obvious way: tokens pasted into per-device plugin settings. That meant N machines × M services worth of credential sprawl, and rotating a token meant touching every device.

Version two: a self-hosted [Infisical](https://infisical.com/) instance became the single source of truth, and every MCP server in the plugin launches through it:

```json
"ha-mcp": {
  "command": "infisical",
  "args": [
    "run", "--projectId", "<project>", "--env", "prod", "--silent",
    "--", "uvx", "ha-mcp@latest"
  ]
}
```

`infisical run` fetches the secrets at launch and injects them into that process's environment. The tokens exist nowhere on disk on any client machine, the agent never sees them in config, and rotating a credential is one change in one place. A new machine needs exactly one thing: an authenticated Infisical CLI.

Two wrinkles worth knowing:

- **HTTP MCP servers can't be wrapped this way.** n8n's MCP server speaks HTTP with a Bearer header, and that header is expanded by the client, not by `infisical run`. The fix: bridge it to stdio with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) and wrap _that_, so the token still comes from the vault.
- **You've created a single point of failure, on purpose.** If the Infisical CLI isn't authenticated, every server fails together. I'll take one loud, obvious failure mode over five quiet ones.

And yes, the agent helped build its own credential system, including the backup: a restore drill where we stood up a throwaway clone of the secrets store from a cold backup, read the secrets back to confirm the encryption key survived, and tore it down. I don't count a backup until I've restored from it.

The whole chain, in one picture:

<figure>
<svg viewBox="0 0 720 524" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="mcp-diagram-title mcp-diagram-desc" class="hl" style="width:100%;height:auto;display:block">
  <title id="mcp-diagram-title">How the homelab MCP setup fits together</title>
  <style>.hl-zone { fill: none; stroke-width: 2; stroke-dasharray: 6 4; } .hl-outline, .hl-focal { stroke-width: 3; } .hl-outline-thin { stroke-width: 1.5; } .hl-arrow { fill: none; stroke-width: 2; } .hl-arrow-accent { fill: none; stroke-width: 2; stroke-dasharray: 5 4; } .hl-chip { stroke-width: 1.5; } .hl-eyebrow { font-size: 8px; font-weight: 500; letter-spacing: 0.14em; } .hl-arrowlabel { font-size: 7.5px; font-weight: 500; letter-spacing: 0.06em; } .hl-name { font-size: 15px; font-weight: 600; } .hl-name-sm { font-size: 14px; } .hl-sub { font-size: 11px; } .hl-chiptext { font-size: 10px; } .hl-legend { font-size: 11px; } .hl-rule { stroke-width: 1; }  .hl-mask { fill: var(--bg); } .hl-zone { stroke: var(--fg-muted); opacity: 0.6; } .hl-eyebrow, .hl-arrowlabel { fill: var(--fg-muted); font-family: var(--font-mono); } .hl-arrowlabel-accent { fill: var(--accent); } .hl-arrow { stroke: var(--ink); } .hl-arrowhead { fill: var(--ink); } .hl-arrow-accent { stroke: var(--accent); } .hl-arrowhead-accent { fill: var(--accent); } .hl-shadow-me, .hl-shadow-lab { fill: var(--ink); } .hl-fill-me, .hl-swatch-me { fill: var(--yellow); } .hl-fill-lab, .hl-swatch-lab { fill: var(--cyan); } .hl-outline, .hl-outline-thin { stroke: var(--ink); } .hl-focal { stroke: var(--accent); } .hl-chip { fill: var(--bg-raised); stroke: var(--ink); } .hl-chiptext { fill: var(--on-fill); font-family: var(--font-mono); } .hl-name { fill: var(--on-fill); font-family: var(--font-sans); } .hl-sub { fill: var(--on-fill); opacity: 0.8; font-family: var(--font-sans); } .hl-legend { fill: var(--fg); font-family: var(--font-sans); } .hl-rule { stroke: var(--fg); opacity: 0.15; } [data-theme='dark'] .hl-fill-me, [data-theme='dark'] .hl-fill-lab { fill: var(--bg-raised); } [data-theme='dark'] .hl-shadow-me { fill: var(--yellow); } [data-theme='dark'] .hl-shadow-lab { fill: var(--cyan); } [data-theme='dark'] .hl-name, [data-theme='dark'] .hl-chiptext { fill: var(--fg); } [data-theme='dark'] .hl-sub { fill: var(--fg-muted); opacity: 1; } [data-theme='dark'] .hl-chip { fill: var(--bg); stroke: var(--fg); }</style>
  <desc id="mcp-diagram-desc">Claude Code installs a plugin from a private marketplace on the NAS. The plugin defines MCP servers, each launched through an infisical run wrapper that fetches secrets from the Infisical vault. The MCP servers expose tools over JSON-RPC to control Home Assistant, Unraid, UniFi, n8n and Uptime Kuma.</desc>
  <defs>
    <marker id="hl-arrow" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="10" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,4 L0,8 z" class="hl-arrowhead"/></marker>
    <marker id="hl-arrow-accent" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="10" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,4 L0,8 z" class="hl-arrowhead-accent"/></marker>
  </defs>
  <rect x="24" y="24" width="352" height="432" rx="12" class="hl-zone"/>
  <rect x="36" y="16" width="128" height="16" rx="2" class="hl-mask"/>
  <text x="44" y="27" class="hl-eyebrow">ANY OF MY MACHINES</text>
  <rect x="392" y="24" width="304" height="432" rx="12" class="hl-zone"/>
  <rect x="404" y="16" width="176" height="16" rx="2" class="hl-mask"/>
  <text x="412" y="27" class="hl-eyebrow">SELF-HOSTED IN THE HOMELAB</text>
  <line x1="352" y1="96" x2="414" y2="96" class="hl-arrow" marker-end="url(#hl-arrow)"/>
  <path d="M 544,128 V 158 Q 544,166 536,166 H 208 Q 200,166 200,174 V 202" class="hl-arrow" marker-end="url(#hl-arrow)"/>
  <line x1="416" y1="236" x2="354" y2="236" class="hl-arrow-accent" marker-end="url(#hl-arrow-accent)"/>
  <line x1="200" y1="268" x2="200" y2="342" class="hl-arrow" marker-end="url(#hl-arrow)"/>
  <line x1="352" y1="390" x2="414" y2="390" class="hl-arrow" marker-end="url(#hl-arrow)"/>
  <rect x="360" y="76" width="52" height="12" rx="2" class="hl-mask"/>
  <text x="386" y="85" text-anchor="middle" class="hl-arrowlabel">INSTALLS</text>
  <rect x="344" y="146" width="80" height="12" rx="2" class="hl-mask"/>
  <text x="384" y="155" text-anchor="middle" class="hl-arrowlabel">SERVER CONFIG</text>
  <rect x="360" y="216" width="48" height="12" rx="2" class="hl-mask"/>
  <text x="384" y="225" text-anchor="middle" class="hl-arrowlabel hl-arrowlabel-accent">SECRETS</text>
  <rect x="208" y="300" width="36" height="12" rx="2" class="hl-mask"/>
  <text x="226" y="309" text-anchor="middle" class="hl-arrowlabel">STARTS</text>
  <rect x="360" y="370" width="52" height="12" rx="2" class="hl-mask"/>
  <text x="386" y="379" text-anchor="middle" class="hl-arrowlabel">JSON-RPC</text>
  <rect x="52" y="68" width="304" height="64" rx="10" class="hl-shadow-me"/>
  <rect x="48" y="64" width="304" height="64" rx="10" class="hl-fill-me hl-outline"/>
  <text x="64" y="103" class="hl-name">Claude Code</text>
  <rect x="420" y="68" width="256" height="64" rx="10" class="hl-shadow-lab"/>
  <rect x="416" y="64" width="256" height="64" rx="10" class="hl-fill-lab hl-outline"/>
  <text x="432" y="93" class="hl-name hl-name-sm">Private plugin marketplace</text>
  <text x="432" y="112" class="hl-sub">Forgejo, self-hosted on the NAS</text>
  <rect x="52" y="208" width="304" height="64" rx="10" class="hl-shadow-me"/>
  <rect x="48" y="204" width="304" height="64" rx="10" class="hl-fill-me hl-outline"/>
  <text x="64" y="233" class="hl-name">infisical run wrapper</text>
  <text x="64" y="252" class="hl-sub">launches each server, secrets injected</text>
  <rect x="420" y="208" width="256" height="64" rx="10" class="hl-shadow-lab"/>
  <rect x="416" y="204" width="256" height="64" rx="10" class="hl-fill-lab hl-focal"/>
  <text x="432" y="233" class="hl-name">Infisical</text>
  <text x="432" y="252" class="hl-sub">secrets vault</text>
  <rect x="52" y="348" width="304" height="92" rx="10" class="hl-shadow-me"/>
  <rect x="48" y="344" width="304" height="92" rx="10" class="hl-fill-me hl-outline"/>
  <text x="64" y="372" class="hl-name">MCP servers</text>
  <rect x="62" y="388" width="52" height="28" rx="6" class="hl-chip"/>
  <text x="88" y="406" text-anchor="middle" class="hl-chiptext">ha-mcp</text>
  <rect x="118" y="388" width="52" height="28" rx="6" class="hl-chip"/>
  <text x="144" y="406" text-anchor="middle" class="hl-chiptext">unraid</text>
  <rect x="174" y="388" width="48" height="28" rx="6" class="hl-chip"/>
  <text x="198" y="406" text-anchor="middle" class="hl-chiptext">unifi</text>
  <rect x="226" y="388" width="32" height="28" rx="6" class="hl-chip"/>
  <text x="242" y="406" text-anchor="middle" class="hl-chiptext">n8n</text>
  <rect x="262" y="388" width="84" height="28" rx="6" class="hl-chip"/>
  <text x="304" y="406" text-anchor="middle" class="hl-chiptext">uptime-kuma</text>
  <rect x="420" y="348" width="256" height="92" rx="10" class="hl-shadow-lab"/>
  <rect x="416" y="344" width="256" height="92" rx="10" class="hl-fill-lab hl-outline"/>
  <text x="432" y="374" class="hl-name hl-name-sm">Home Assistant · Unraid ·</text>
  <text x="432" y="394" class="hl-name hl-name-sm">UniFi · n8n · Uptime Kuma</text>
  <text x="432" y="416" class="hl-sub">the actual lab</text>
  <line x1="24" y1="476" x2="696" y2="476" class="hl-rule"/>
  <text x="24" y="504" class="hl-eyebrow">LEGEND</text>
  <rect x="104" y="492" width="16" height="16" rx="3" class="hl-swatch-me hl-outline-thin"/>
  <text x="128" y="504" class="hl-legend">Runs on my machine</text>
  <rect x="288" y="492" width="16" height="16" rx="3" class="hl-swatch-lab hl-outline-thin"/>
  <text x="312" y="504" class="hl-legend">Self-hosted in the homelab</text>
  <line x1="508" y1="500" x2="536" y2="500" class="hl-arrow-accent" marker-end="url(#hl-arrow-accent)"/>
  <text x="548" y="504" class="hl-legend">Credential path</text>
</svg>
  <figcaption>From terminal to lab: delivery via the plugin marketplace, credentials via the vault.</figcaption>
</figure>

## What the agent actually does with all this

Mostly unglamorous things, because that's what infrastructure work is.

**It found a real security hole.** While working on the NAS it noticed Redis listening on `0.0.0.0` with no password and protected-mode off. We locked it to the Docker bridge with auth, tracked down which containers actually consumed it (one; two others just looked like they did), and updated the templates so the fix survives a GUI edit.

**It diagnoses like a network engineer.** An alarm panel's IP module refused every connection method. The agent worked the problem from the UniFi side and found the module wasn't on the LAN at all. It was NAT'd behind a forgotten TP-Link travel router in the wall, its WAN side answering nothing. The method was plain port-scanning and topology reasoning, but it turned a "this thing is haunted" problem into a one-line explanation and two clear fix options.

**It does the operational choreography.** Cold backups need a container stop, which trips the uptime monitor, which pings my phone. The agent's backup run pauses the right Uptime Kuma monitor first, does the copy and resumes it, so planned work doesn't page anyone.

**It remembers.** Session-to-session memory means the agent knows the NAS rate-limits rapid SSH connections, that hand-created Docker networks get wiped on service restart because of an Unraid setting, and that a certain upstream MCP server has a bug where an empty-but-set env var silently overrides the `.env` file. Institutional knowledge, except it doesn't leave when the only engineer (me) forgets.

## The sharp edges 🙈

- **MCP servers read config once, at session start.** Every credential or config change means a restart. You will forget this and debug a "broken" server that's simply running stale config.
- **stdout is sacred.** stdio MCP servers speak JSON-RPC on stdout; anything else printed there breaks the protocol. `infisical run --silent` keeps its logging on stderr. Check the same for anything you wrap.
- **Upstream quality varies.** One server hardcoded empty env vars in its manifest, which, thanks to `python-dotenv`'s `override=False`, silently beat the real values in `.env`. The error said "credentials not configured" while the credentials sat there, configured. Patching it locally works until the next plugin update wipes the patch.
- **Give the agent its own identity.** It gets dedicated, least-privilege accounts: a local-only UniFi admin, a scoped API key on the NAS, never my own logins. When something in the audit log did a thing, I want to know _which_ something.

## Should you do this?

If you have a homelab, yes. It's the ideal training ground for working with AI agents. Real infrastructure with real consequences, but the blast radius is your own evening rather than production. The skills transfer directly to how I work at work, too: the same patterns of scoped credentials, skills-as-house-rules and verify-before-trust apply whether the agent is touching a smart home or a payment system.

Start small: one MCP server, read-only, for the system you know best. You'll know within an hour whether this clicks for you. The plugin marketplace and the secrets plumbing can come later. They solve the problems you'll only have once you're hooked.

Next up for the lab (tracked on my [Now page](/now/)): moving the last server onto the vault, a machine identity instead of my user session for the CLI, and, once the building manager coughs up an admin password, a doorbell that tells the agent who's at the door. 🔔
