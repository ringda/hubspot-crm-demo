# HubSpot CRM + AI Workflow Demo

Portfolio demo: **HubSpot MCP Server + Claude Code.** Shows how an AI *skill*
reads and writes CRM data to support SDR/BDR workflows.

> **Core idea:** CRM stores customer *facts*; skills preserve GTM *judgment*.

The demo runs a single skill in two directions:

| Direction | Flow |
| --------- | ---- |
| **Inbound (write)** | natural-language prospect signal → skill → CRM-ready record → written to HubSpot |
| **Outbound (read)** | HubSpot contact context → skill → GTM action memo (next best action + draft outreach) |

---

## Architecture

```
Claude Code ──(.mcp.json)──► @hubspot/mcp-server (stdio, npx) ──► HubSpot CRM
                  │
                  └── .claude/skills/hubspot-gtm-workflow  (GTM judgment layer)
```

- **MCP server:** [`@hubspot/mcp-server`](https://www.npmjs.com/package/@hubspot/mcp-server)
  (official, public beta), pinned to `0.4.0`. Runs locally over stdio via `npx`.
- **Auth:** a HubSpot **Private App access token**, supplied as the
  `PRIVATE_APP_ACCESS_TOKEN` environment variable — never committed.
- **Skill:** `.claude/skills/hubspot-gtm-workflow/SKILL.md` encodes the GTM
  judgment (qualification, dedupe, memo synthesis).

---

## Setup

### Prerequisites

- Node.js v18+ (`node --version`)
- Claude Code
- A HubSpot account (any tier, including Free)

### 1. Create a HubSpot token

`@hubspot/mcp-server` reads any HubSpot token sent as a Bearer credential, so
either works:

- **Service Key** (recommended; this demo uses one) — HubSpot's current
  account-level API credential. **Development → Keys → Service Keys → Create
  service key.** Cleaner UI and the path HubSpot now steers you toward.
- **Private App token** — **Settings → Integrations → Private Apps → Create a
  private app** (legacy; HubSpot shows a deprecation notice).

Either way, enable these scopes (matching this demo's read/write needs):

```
crm.objects.contacts.read      crm.objects.contacts.write
crm.objects.companies.read     crm.objects.companies.write
crm.objects.deals.read         crm.objects.deals.write
crm.schemas.contacts.read
crm.objects.owners.read
```

Create it, then copy the **token** (starts with `pat-`) — you can only see it once.

### 2. Provide the token (kept out of git)

Copy the template and paste your token:

```bash
cp .env.example .env
# edit .env, set PRIVATE_APP_ACCESS_TOKEN=pat-...
```

Then expose it to Claude Code as an environment variable. On Windows
(PowerShell), set a persistent user variable and **restart Claude Code** so it
inherits it:

```powershell
setx PRIVATE_APP_ACCESS_TOKEN "pat-your-token-here"
```

macOS/Linux:

```bash
export PRIVATE_APP_ACCESS_TOKEN="pat-your-token-here"   # add to ~/.zshrc / ~/.bashrc to persist
```

`.mcp.json` references `${PRIVATE_APP_ACCESS_TOKEN}`, so the token lives only in
your environment / git-ignored `.env`, never in committed files.

### 3. Start Claude Code in this directory

Open Claude Code in the project root and trust the `.mcp.json` when prompted.
The first launch downloads `@hubspot/mcp-server` via `npx` (one-time, ~30–60s) —
give it a moment before the `hubspot` tools appear.

### 4. Verify the connection

Ask Claude: *"List my HubSpot contacts."* It should call `hubspot-list-objects`
and return the demo contacts. If tools don't appear, see Troubleshooting.

---

## Usage

The skill (`hubspot-gtm-workflow`) triggers automatically on intent. Examples:

**Inbound / write:**
> "Just had a call with Priya Patel, VP Eng at Acme (priya@acme.io). They're
> evaluating us against a competitor, want to decide this quarter. Log it."

→ qualifies the signal, dedupes, writes a contact, logs a note with the
reasoning, returns the record link.

**Outbound / read:**
> "Prep me for my next touch with Jamie Chen — what should I do?"

→ pulls Jamie's CRM context + associated deals, returns a GTM action memo with
a recommended next step and draft outreach.

---

## Demo data

The connected portal contains 5 contacts (Jamie Chen, Sarah Kim, David
Martinez, Lisa Wang, Alex Nguyen) and 3 deals for end-to-end dry runs.

---

## Project layout

```
.
├── .mcp.json                 # MCP server config (committed; no secrets)
├── .env.example              # token template (copy to .env)
├── .claude/
│   └── skills/
│       └── hubspot-gtm-workflow/
│           └── SKILL.md      # the GTM judgment layer
├── .gitignore
└── README.md
```

---

## Security notes

- The token is **never** committed: it lives in `.env` (git-ignored) and your
  shell environment; `.mcp.json` only references the variable name.
- HubSpot CLI auth (`~/.hscli/`) and `.env` are git-ignored.
- The skill **confirms before every write** and performs **no delete**
  operations.

---

## Troubleshooting

- **`hubspot` tools don't appear after launch** — the first `npx` download may
  exceed the MCP connect timeout. Pre-warm once, then relaunch:
  `npx -y @hubspot/mcp-server@0.4.0 --help`
- **Auth errors on a tool call** — confirm `PRIVATE_APP_ACCESS_TOKEN` is set in
  the environment Claude Code launched from (re-run `setx` and restart), and
  that the private app has the scopes above.
- **A tool reports a missing property** — property internal names vary by
  portal; ask Claude to run `hubspot-list-properties` for the object first.

---

## Notes

`@hubspot/mcp-server` is in public beta; pin the version for reproducibility.
This is a portfolio demonstration, not an official HubSpot project.
