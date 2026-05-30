# Demo Script

A 2-minute walkthrough of the `hubspot-gtm-workflow` skill running in both
directions against live HubSpot CRM data. Run each prompt in Claude Code with
this project open.

> **Thesis to narrate:** the CRM stores customer *facts*; the skill preserves
> GTM *judgment* — the qualification reasoning and next-best-action a raw CRM
> import would lose.

---

## 0. Pre-flight (10 seconds)

Prove the connection is live:

> **Prompt:** "Check my HubSpot connection and list my contacts."

Expect: `hubspot-get-user-details` returns the authorized scopes, then
`hubspot-list-objects` returns the demo contacts (Jamie Chen, Sarah Kim, David
Martinez, Lisa Wang, Alex Nguyen).

---

## 1. Outbound — CRM context → GTM action memo (read)

> **Prompt:** "Prep me for my next touch with Jamie Chen — pull their CRM
> context and associated deals, then give me a GTM action memo with the next
> best action and a draft outreach."

**What the skill does**
1. `hubspot-search-objects` resolves Jamie Chen → contact ID.
2. `hubspot-list-associations` + `hubspot-search-objects` surface the related
   **Northstar Ops – AI Triage Pilot** deal ($5,000) via the email domain.
3. Synthesizes a memo: snapshot, signals, BANT read (calling out gaps in
   Authority/Budget/Timing), recommended next action, and a draft email.

**Talking point:** the deal wasn't formally associated in the CRM — the skill
*inferred* the connection from the email domain and flagged it as a data gap.
That inference is judgment, not a lookup.

---

## 2. Inbound — natural-language signal → CRM record (write)

> **Prompt:** "Just had a call with Priya Patel, VP Eng at Acme
> (priya@acme.io). They're evaluating us against a competitor, want to decide
> this quarter. Log it."

**What the skill does**
1. Parses the signal into structured facts (name, email, title, company).
2. Applies GTM judgment: ICP fit, signal strength, maps to
   `lifecyclestage = salesqualifiedlead` (active eval + authority + timeline).
3. `hubspot-search-objects` **deduplicates** by email before creating.
4. **Confirms the record with you**, then `hubspot-batch-create-objects`
   writes the contact.
5. `hubspot-create-engagement` logs a NOTE with the original signal *and* the
   qualification reasoning — auditable in HubSpot.

**Talking point:** the NOTE is the whole thesis. Anyone can write a contact
row; the skill records *why* it's an SQL and *what to do next* — the GTM
judgment that would otherwise live only in a rep's head.

---

## 3. Optional — repair a data gap (write)

> **Prompt:** "Associate Jamie Chen with the Northstar Ops deal."

Uses `hubspot-get-association-definitions` then
`hubspot-batch-create-associations` to formally link the contact and deal the
memo flagged in step 1.

---

## Safety notes to mention

- Every **write** is confirmed with you before execution.
- The skill performs **no deletes** by design — cleanup is done by hand in the
  HubSpot UI. (This is a deliberate guardrail, not a limitation.)
- The token is a HubSpot Service Key in an environment variable, never in git.

---

## Reset between demos

Recommended state: **keep Priya Patel** as a living write-direction sample
(the contact + qualification NOTE make the best portfolio screenshot, and a
re-run will then demo the dedupe/update path instead of a fresh create).

The skill — and the HubSpot MCP server — perform **no delete or un-associate
operations** by design, so any teardown is done by hand in the HubSpot UI:

1. **Remove the Jamie Chen ↔ Northstar Ops association** (so the outbound memo
   keeps re-demonstrating the "inferred, not stored" insight): open Jamie's
   record → Deals card → unlink the deal.
2. **Only if fully resetting** — delete the **Priya Patel** contact: open her
   record → Actions → Delete (HubSpot will offer to remove the attached NOTE
   too).

This hands-only teardown is itself part of the demo: writes go through the
agent, destructive actions stay with the human.
