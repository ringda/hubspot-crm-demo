---
name: hubspot-gtm-workflow
description: >-
  Bridge natural-language GTM activity and HubSpot CRM for SDR/BDR workflows.
  Use this skill in two situations: (1) INBOUND/WRITE — the user describes a
  prospect signal in plain language (a meeting note, a LinkedIn reply, an
  inbound form, "just talked to...") and wants it captured as a structured,
  CRM-ready record written to HubSpot; (2) OUTBOUND/READ — the user names a
  contact/company/deal already in HubSpot and wants their CRM context pulled
  and turned into a GTM action memo (qualification + next best action + draft
  outreach). Trigger on phrases like "log this prospect", "add to CRM",
  "capture this signal", "what should I do next with <name>", "prep me for
  <contact>", "write a follow-up plan from the CRM".
---

# HubSpot GTM Workflow

This skill connects unstructured GTM judgment with structured CRM facts via the
official HubSpot MCP server (`@hubspot/mcp-server`). The CRM stores **customer
facts**; this skill preserves **GTM judgment** — how to qualify a signal, what
to record, and what to do next.

It runs in two directions. Decide which the user wants from their phrasing, then
follow that flow.

---

## Direction A — INBOUND (natural-language signal → CRM record)

**Goal:** turn a free-text prospect signal into a clean, deduplicated HubSpot
record (and an optional activity log), preserving GTM qualification judgment.

### Steps

1. **Parse the signal.** Extract every fact present: person name, email,
   company, job title, phone, the source/channel, and any buying signal
   (pain, timeline, budget hint, competitor mention, trigger event).

2. **Apply GTM judgment (do not skip).** Before writing, assess:
   - **ICP fit** — does the company/role match the target profile? Note why.
   - **Signal strength** — explicit intent ("we're evaluating now") vs. soft
     ("looked at pricing"). Map to a lead status.
   - **Lifecycle stage** — lead / marketingqualifiedlead / salesqualifiedlead /
     opportunity, based on the signal.
   Record this judgment in the record's notes — it is the part a raw CRM import
   would lose.

3. **Deduplicate first.** Call `hubspot-search-objects` on `contacts` filtered
   by email (or name + company if no email) BEFORE creating. If a match exists,
   prefer `hubspot-batch-update-objects` over creating a duplicate.

4. **Map to properties** (see Property Reference below) and **confirm with the
   user** the record you're about to write — these are write operations.

5. **Write.** Use `hubspot-batch-create-objects` (new) or
   `hubspot-batch-update-objects` (existing) on the `contacts` object. If a
   company or deal is implied, create/associate it too
   (`hubspot-batch-create-associations`).

6. **Log the signal as an engagement.** Use `hubspot-create-engagement` to add
   a NOTE capturing the original signal text + your qualification judgment, so
   the reasoning is auditable in HubSpot.

7. **Confirm back** with the record link (`hubspot-get-link`).

---

## Direction B — OUTBOUND (CRM context → GTM action memo)

**Goal:** read a contact's full CRM context and synthesize a GTM action memo an
SDR/BDR can act on immediately.

### Steps

1. **Resolve the entity.** `hubspot-search-objects` on `contacts` by name/email
   to get the object ID. If ambiguous, ask which one.

2. **Gather context (read-only):**
   - `hubspot-batch-read-objects` for the contact's properties.
   - `hubspot-list-associations` → associated companies and deals.
   - `hubspot-batch-read-objects` on those deals (stage, amount, close date).
   - `hubspot-get-engagement` for recent notes/tasks if IDs are surfaced.

3. **Synthesize the memo** (this is the GTM judgment layer):
   - **Snapshot** — who they are, company, role, lifecycle stage.
   - **Signals** — what the CRM history implies about intent and timing.
   - **Qualification** — ICP fit + a lightweight MEDDIC/BANT read on what's
     known vs. missing (call out the gaps explicitly).
   - **Recommended next action** — the single best next step and why.
   - **Draft outreach** — 2–4 sentence email/message tailored to the context.

4. **Output the memo as text** (do not write to CRM unless asked). Offer to log
   the recommended action as a task via `hubspot-create-engagement`.

---

## HubSpot MCP Tools Reference

Read: `hubspot-list-objects`, `hubspot-search-objects`,
`hubspot-batch-read-objects`, `hubspot-list-associations`,
`hubspot-get-association-definitions`, `hubspot-list-properties`,
`hubspot-get-property`, `hubspot-get-engagement`, `hubspot-get-schemas`,
`hubspot-get-user-details`, `hubspot-get-link`, `hubspot-list-workflows`,
`hubspot-get-workflow`.

Write (always confirm first): `hubspot-batch-create-objects`,
`hubspot-batch-update-objects`, `hubspot-batch-create-associations`,
`hubspot-create-engagement`, `hubspot-update-engagement`,
`hubspot-create-property`, `hubspot-update-property`.

Objects are addressed by `objectType` (`contacts`, `companies`, `deals`,
`tickets`, ...) plus properties — there is no per-object tool; pass the type.

---

## Property Reference (demo mapping)

**Contact** (`contacts`): `email`, `firstname`, `lastname`, `jobtitle`,
`phone`, `company`, `lifecyclestage`
(`lead`|`marketingqualifiedlead`|`salesqualifiedlead`|`opportunity`),
`hs_lead_status` (`NEW`|`OPEN`|`IN_PROGRESS`|`CONNECTED`|`OPEN_DEAL`).

**Company** (`companies`): `name`, `domain`, `industry`, `numberofemployees`.

**Deal** (`deals`): `dealname`, `amount`, `dealstage`, `pipeline`,
`closedate`.

Always call `hubspot-list-properties` for the target object before a first
write in a new session — property internal names and enum options vary by
portal.

---

## Safety & conventions

- **Confirm before every write.** Show the exact object + properties first.
  The MCP write tools carry data-modification guardrails; respect them.
- **Never delete.** This skill does not perform delete operations.
- **Deduplicate before create** to avoid polluting the CRM.
- **Record the "why".** Always attach qualification reasoning as a note — that
  is the GTM judgment the CRM can't infer on its own.
- Demo portal contains 5 contacts (Jamie Chen, Sarah Kim, David Martinez,
  Lisa Wang, Alex Nguyen) and 3 deals — use them for end-to-end dry runs.
