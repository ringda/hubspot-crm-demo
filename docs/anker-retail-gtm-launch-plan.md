# Anker Retail GTM Launch Extension Plan

## Goal

Extend the existing HubSpot CRM workflow demo into a small retail GTM launch
workflow that can support an Anker-style GTM Specialist application.

The project should prove one thing: Xin can turn scattered partner, SKU, and
launch-status signals into a clean operating view with risk, owner, next action,
and a human checkpoint before CRM updates.

## Positioning

This is a portfolio demo, not a production claim.

Safe claim:

- Built a HubSpot + launch-tracker demo that converts retail partner signals,
  SKU sales/inventory data, and launch tasks into a weekly GTM action memo.
- Preserved GTM judgment that raw CRM rows would lose: issue type, business
  risk, owner, escalation, and next action.
- Kept a human confirmation step before CRM write-backs.

Do not claim:

- Production HubSpot administration.
- Formal retail account ownership.
- Pricing strategy ownership.
- Demand-planning or forecast ownership.
- End-to-end product launch ownership.

## Gap Coverage

| Anker JD gap | Project proof |
| --- | --- |
| Product launch planning | Launch task view with owner, date, risk, blocker, and next action |
| Channel execution | Amazon, Best Buy, Walmart, and Target readiness status |
| Sales/inventory tracking | SKU-level forecast, actual sales, stock, and risk flag |
| Pricing/product data accuracy | Promo price, product copy, image, UPC, and spec-sheet checks |
| Business reviews | Weekly GTM memo with escalation and next owner |
| Cross-functional coordination | Separate Sales Ops, Channel Marketing, Ops, and Product owners |

## MVP Scenario

Use a consumer-electronics launch scenario with:

- Four retail channels: Amazon, Best Buy, Walmart, Target.
- Four SKUs: charger, power bank, smart camera, wireless earbuds.
- Ten to fifteen launch tasks.
- Five to eight HubSpot records for partner/customer context.
- Three messy partner signals.
- One weekly GTM business review memo.

## Demo Flow

1. **Inbound channel signal**
   - Input: "Best Buy buyer says lifestyle images are missing and promo price
     needs confirmation before launch lock."
   - Output: launch risk memo with issue type, owner, next action, and proposed
     HubSpot note text.

2. **Channel readiness audit**
   - Input: "Audit channel readiness for Amazon, Best Buy, Walmart, and Target."
   - Output: channel table with ready/at-risk/blocked status, risks, owners,
     and next actions.

3. **Weekly business review memo**
   - Input: "Prep a weekly GTM business review memo for the launch manager."
   - Output: launch-manager memo that combines channel blockers and SKU
     sales/inventory risks.

## Web Deliverable

The `web/` app should show:

- Gap coverage matrix.
- Channel readiness snapshot.
- SKU sales/inventory risk table.
- Messy partner signals.
- Prompt buttons for the three demo flows.
- Live assistant connected to the HubSpot MCP workflow.

## Resume-Safe Bullet

Extended a HubSpot CRM workflow demo into a retail GTM launch scenario,
combining partner signals, SKU sales/inventory data, and launch-task status into
channel-readiness memos with risk, owner, next action, and human checkpoint
before CRM updates.

## Proof Boundary

This project is strongest as a bridge: it makes the existing HubSpot demo
relevant to retail GTM execution without overstating Xin's background. The proof
is not "I owned product launches." The proof is "I can structure messy GTM
signals, keep facts clean, and produce operating judgment a launch team can act
on."
