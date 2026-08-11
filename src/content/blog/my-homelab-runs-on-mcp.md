---
title: 'My homelab runs on MCP: an AI agent with real hands'
description: 'Giving an AI agent real hands on my homelab: MCP servers for Home Assistant, Unraid and UniFi, a private plugin marketplace and self-hosted secrets.'
pubDate: 2026-08-12T12:00:00+03:00
draft: true
tags:
  - AI
  - Claude Code
  - MCP
  - Homelab
---

Most people use AI assistants to _talk about_ their infrastructure. Mine can actually touch it.

When I open a terminal on any of my machines, the agent comes up with tools for the whole homelab: it can query the NAS, control Home Assistant, inspect the UniFi network, build n8n workflows and manage uptime monitors. Not through copy-pasted `curl` commands I feed it, but through MCP servers that load automatically, with credentials the agent never sees.

A quick definition, since it's the backbone of everything here: [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) is an open standard for connecting AI assistants to external systems. A small server wraps a system's API and exposes it as tools; any MCP-capable agent can then discover and call them. One protocol, any system.

Ever since [rebuilding this site with an AI agent](/blog/rebuilding-my-site-with-an-ai-agent/), I've been pushing the same way of working onto my infrastructure. This post is about how that's wired together, what the agent has actually done with it, and the sharp edges I hit along the way.

## The estate: what the agent can reach

The lab is nothing exotic, which is rather the point: this setup makes _ordinary_ infrastructure agent-operable. The full hardware rundown lives on my [Uses page](/uses/), but the short version:

- **NAS** ("NAS-Boy" 👋): Unraid on an i7-9700K, ~40TB of storage and a fleet of self-hosted Docker services: Paperless, Immich, Caddy, a Forgejo git server and more.
- **Home Assistant** on a mini PC: the smart-home brain for lights, heating, cameras and a couple of in-progress integrations (a video doorbell and an alarm panel).
- **UniFi** networking with segmented VLANs for people, IoT and security devices.
- **n8n** for workflow automation, **Uptime Kuma** for monitoring, and a self-hosted **Infisical** instance for secrets, all fronted by Caddy on a LAN-only internal domain with proper Let's Encrypt certificates.

Each of those has an MCP server. Some are third-party ([`ha-mcp`](https://github.com/homeassistant-ai/ha-mcp), an Unraid GraphQL server, an Uptime Kuma one), n8n ships its own, and UniFi has a community server. The interesting part isn't any single server. It's how they're delivered and authenticated.

## Delivering MCP servers with a private plugin marketplace

Claude Code supports [plugins](https://docs.claude.com/en/docs/claude-code/plugins): bundles of MCP servers, skills and configuration you install from a marketplace. A marketplace is just a git repo. So I run my own, hosted on the Forgejo instance on the NAS. Nothing leaves the network.

Setting up a new machine is four commands:

```
/plugin marketplace add https://git.<internal-domain>/teodor92/homelab-plugins.git
/plugin install kurtevi-homelab-personal@kurtevi-homelab
/plugin install unifi-network@kurtevi-homelab
/plugin install unraid-mcp@claude-homelab
```

Restart the session and the agent knows the whole lab. The plugin also carries **skills**: instructions the agent loads for specific jobs, like Home Assistant best practices (use entity IDs not device IDs, prefer helpers over templates) or how to authenticate against the n8n instance. The MCP servers give it hands; the skills give it house rules.

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

And yes, the agent helped build its own credential system, including the backup: a restore drill where we stood up a throwaway clone of the secrets store from a cold backup, read the secrets back to confirm the encryption key survived, and tore it down. Backups you haven't restored from are hopes, not backups.

The whole chain, in one picture:

<figure>
  <svg viewBox="0 0 720 585" role="img" aria-labelledby="mcp-diagram-title mcp-diagram-desc" style="width:100%;height:auto;font-family:var(--font-sans)">
    <title id="mcp-diagram-title">How the homelab MCP setup fits together</title>
    <desc id="mcp-diagram-desc">Claude Code installs a plugin from a private marketplace on the NAS. The plugin defines MCP servers, each launched through an infisical run wrapper that fetches secrets from the Infisical vault. The MCP servers expose tools over JSON-RPC to control Home Assistant, Unraid, UniFi, n8n and Uptime Kuma.</desc>
    <defs>
      <marker id="mcp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg-muted)"></path>
      </marker>
    </defs>
    <g stroke="var(--border)" fill="var(--bg-raised)">
      <rect x="210" y="20" width="300" height="68" rx="8"></rect>
      <rect x="185" y="136" width="350" height="68" rx="8"></rect>
      <rect x="195" y="252" width="330" height="68" rx="8"></rect>
      <rect x="560" y="252" width="140" height="68" rx="8" stroke="var(--accent)"></rect>
      <rect x="60" y="368" width="600" height="88" rx="8"></rect>
      <rect x="60" y="504" width="600" height="64" rx="8"></rect>
    </g>
    <g fill="var(--fg)" font-size="15" font-weight="600" text-anchor="middle">
      <text x="360" y="48">Claude Code</text>
      <text x="360" y="162">Private plugin marketplace</text>
      <text x="360" y="278">infisical run wrapper</text>
      <text x="630" y="278">Infisical</text>
      <text x="360" y="392">MCP servers</text>
      <text x="360" y="530">Home Assistant · Unraid · UniFi · n8n · Uptime Kuma</text>
    </g>
    <g fill="var(--fg-muted)" font-size="13" text-anchor="middle">
      <text x="360" y="70">on any of my machines</text>
      <text x="360" y="184">Forgejo, self-hosted on the NAS</text>
      <text x="360" y="300">launches each server, secrets injected</text>
      <text x="630" y="300">secrets vault</text>
      <text x="360" y="550">the actual lab</text>
    </g>
    <g fill="var(--code-bg)" stroke="var(--border)">
      <rect x="117" y="408" width="88" height="32" rx="6"></rect>
      <rect x="221" y="408" width="84" height="32" rx="6"></rect>
      <rect x="321" y="408" width="70" height="32" rx="6"></rect>
      <rect x="407" y="408" width="60" height="32" rx="6"></rect>
      <rect x="483" y="408" width="120" height="32" rx="6"></rect>
    </g>
    <g fill="var(--fg)" font-size="13" text-anchor="middle" style="font-family:var(--font-mono)">
      <text x="161" y="428">ha-mcp</text>
      <text x="263" y="428">unraid</text>
      <text x="356" y="428">unifi</text>
      <text x="437" y="428">n8n</text>
      <text x="543" y="428">uptime-kuma</text>
    </g>
    <g stroke="var(--fg-muted)" fill="none" marker-end="url(#mcp-arrow)">
      <line x1="360" y1="88" x2="360" y2="130"></line>
      <line x1="360" y1="204" x2="360" y2="246"></line>
      <line x1="360" y1="320" x2="360" y2="362"></line>
      <line x1="360" y1="456" x2="360" y2="498"></line>
      <line x1="558" y1="286" x2="531" y2="286" stroke="var(--accent)" stroke-dasharray="4 4"></line>
    </g>
    <g fill="var(--fg-muted)" font-size="12.5" text-anchor="start">
      <text x="372" y="113">installs the plugin</text>
      <text x="372" y="229">plugin defines the MCP servers</text>
      <text x="372" y="345">starts the servers</text>
      <text x="372" y="481">tools over JSON-RPC</text>
    </g>
  </svg>
  <figcaption>From terminal to lab: delivery via the plugin marketplace, credentials via the vault.</figcaption>
</figure>

## What the agent actually does with all this

The honest answer: mostly unglamorous things, which is exactly what infrastructure work is.

**It found a real security hole.** While working on the NAS it noticed Redis listening on `0.0.0.0` with no password and protected-mode off. We locked it to the Docker bridge with auth, tracked down which containers actually consumed it (one; two others just looked like they did), and updated the templates so the fix survives a GUI edit.

**It diagnoses like a network engineer.** An alarm panel's IP module refused every connection method. The agent worked the problem from the UniFi side and found the module wasn't on the LAN at all. It was NAT'd behind a forgotten TP-Link travel router in the wall, its WAN side answering nothing. That's not "AI magic". It's methodical port-scanning and topology reasoning. But it turned a "this thing is haunted" problem into a one-line explanation and two clear fix options.

**It does the operational choreography.** Cold backups need a container stop, which trips the uptime monitor, which pings my phone. The agent's backup run pauses the right Uptime Kuma monitor first, does the copy, resumes it. Nobody gets paged for planned work.

**It remembers.** Session-to-session memory means the agent knows the NAS rate-limits rapid SSH connections, that hand-created Docker networks get wiped on service restart because of an Unraid setting, and that a certain upstream MCP server has a bug where an empty-but-set env var silently overrides the `.env` file. Institutional knowledge, except it doesn't leave when the only engineer (me) forgets.

## The sharp edges 🙈

- **MCP servers read config once, at session start.** Every credential or config change means a restart. You will forget this and debug a "broken" server that's simply running stale config.
- **stdout is sacred.** stdio MCP servers speak JSON-RPC on stdout; anything else printed there breaks the protocol. `infisical run --silent` keeps its logging on stderr. Check the same for anything you wrap.
- **Upstream quality varies.** One server hardcoded empty env vars in its manifest, which, thanks to `python-dotenv`'s `override=False`, silently beat the real values in `.env`. The error said "credentials not configured" while the credentials sat there, configured. Patching it locally works until the next plugin update wipes the patch.
- **Give the agent its own identity.** It gets dedicated, least-privilege accounts: a local-only UniFi admin, a scoped API key on the NAS. Never my own logins. When something in the audit log did a thing, I want to know _which_ something.

## Should you do this?

If you have a homelab, genuinely: yes. It's the ideal training ground for working with AI agents. Real infrastructure with real consequences, but the blast radius is your own evening rather than production. The skills transfer directly to how I work at work, too: the same patterns of scoped credentials, skills-as-house-rules and verify-before-trust apply whether the agent is touching a smart home or a payment system.

Start small: one MCP server, read-only, for the system you know best. You'll know within an hour whether this clicks for you. The plugin marketplace and the secrets plumbing can come later. They solve the problems you'll only have once you're hooked.

Next up for the lab (tracked on my [Now page](/now/)): moving the last server onto the vault, a machine identity instead of my user session for the CLI, and, once the building manager coughs up an admin password, a doorbell that tells the agent who's at the door. 🔔
