# Project Notes — Purpose & Scope Decision (2026-05-30)

> The one thing worth remembering from the planning conversation: **what this
> demo is actually for.** Everything else (research, CRM gap scans, the big
> 4-skill plan) is supporting material — this is the decision that governs scope.

## Purpose of this HubSpot demo

**This demo is a lightweight POC that proves one thing: the "skill" concept can
be applied to a hiring manager's own CRM situation.**

- **Capability is proven by the job-search system** (the real, substantial
  project — real system, real data, real results). This HubSpot demo is *not*
  where Xin proves she "can do it."
- **This demo is just the bridge / concept demonstration** — deliberately small
  and clean. It lets an HM see: "an AI skill can read & write my CRM, follow my
  rules, with a human checkpoint — this mechanism is real and portable."

## Explicit scope decisions

- ❌ **Do NOT** loop it back into the job-search-system closed-loop story.
- ❌ **Do NOT** force four skills just to cover the four JD families (A/B/C/D).
- ✅ **Use a clean, easy-to-read standard B2B CRM scenario** (the Jamie / Priya
  style contacts) — the more it looks like a generic B2B CRM, the easier the HM
  bridges "swap in my leads, same engine."
- ✅ The existing `hubspot-gtm-workflow` skill **already achieves this purpose**
  (bidirectional read/write + qualification judgment + human checkpoint before
  write). Concept = proven.

## Honest boundary

Hands-on project. Do **not** claim production HubSpot admin / ownership /
certification. Identity stays: early-career GTM/RevOps candidate with CRM
workflow judgment; the HubSpot+MCP demo is the amplifier, not the headline.

## If we ever expand (optional, NOT required for the POC)

Highest-ROI addition would be a **CRM data-health / hygiene audit skill**
(RevOps JD #1 stated need; real gaps already exist in the demo portal as
material). But that is "making the demo bigger" — a different goal from "prove
the concept." Only start it when explicitly decided.

### Supporting material already gathered (lives elsewhere, not lost)
- Deep-research report on what entry GTM/RevOps JDs actually screen for
  (CRM tooling > AI; AI framed as augmentation; hygiene is the #1 need).
- Real CRM data-gap scan of the demo portal (missing lead_status / company /
  deal-contact associations) — ready material if the hygiene skill is built.
- Job-search project plan: `xin-job-hunting/.specify/plans/hubspot-crm-demo-plan-20260530.md`
