# QA Testing Checklist — DealTable

Run: `npm run dev` → http://localhost:5173

## 1. Entrance & scenarios

- [ ] Landing shows 6 scenario cards + **Build your own**
- [ ] Each card navigates to **Set your mandate**
- [ ] **Build your own** → custom form → Setup

## 2. Setup — mandate & tooltips

- [ ] **Persona brief** visible (who counterparty is + how they act)
- [ ] **Insurance / Adjuster Agent** — read adjuster profile (low open, slow concessions)
- [ ] Click **ⓘ** on Target — popup explains ideal outcome + examples
- [ ] Click **⚠** on Walkaway — popup explains hard limit + HITL
- [ ] Concession threshold tooltip explains Rigid / Moderate / Flexible
- [ ] **Advisor Link** tooltip explains you vs ChatGPT vs counterparty

## 3. Document extraction

- [ ] Paste offer text → **Extract with Advisor** → preview with suggested numbers
- [ ] **Apply suggested values** updates Target / Walkaway fields
- [ ] Upload `.txt` file → auto-runs extraction after load
- [ ] Audit log (after Start) shows `parse_opening_offer` entry if extracted pre-start... (extract before start adds to audit on setup - actually audit only on start for init - extraction adds to audit immediately if we're in setup - yes it appends to audit array even before start)

## 4. Start negotiation

- [ ] **Start Negotiation** → Hub with counterparty opening message (from paste or default)
- [ ] Sidebar nav (Hub / Advisor / Audit) enabled

## 5. Hub — chat & counterparty

- [ ] Target vs Current Ask boxes correct
- [ ] **Suggested Actions → Counter** → principal message + **counterparty reply** (not frozen)
- [ ] **Hold Firm** → counterparty pushes back
- [ ] Right rail **Advisor Insight** tab — tooltips on sections
- [ ] **Real-time Audit** tab — shows recent events + explanation blurb
- [ ] Leverage / probability change after a counter

## 6. HITL

- [ ] Counter below walkaway → **Mandate breach** modal → Reject / Approve
- [ ] Approve applies offer; Reject cancels

## 7. Advisor Insights page

- [ ] Leverage / tone / concession cards reflect live state
- [ ] **Use Prompt** sends suggested move to hub chat

## 8. Audit Log page

- [ ] Full timeline with SYSTEM_INIT, TOOL_CALL, STATE_MUTATION
- [ ] **Export JSON** downloads file

## 9. WebMCP (optional — Chrome flag or ChatGPT browser)

- [ ] `document.modelContext` present → Setup shows “WebMCP tools registered”
- [ ] Tools include `parse_opening_offer`, `get_deal_state`, `propose_offer`
- [ ] See `docs/DEMO.md` for ChatGPT script

## Sample paste for extraction QA

```
AssureCo Claims Reference CLM-903
We can authorize £6,500 based on depreciation.
Please respond within 14 days.
```

Expected: detects £6,500 as their ask; suggests higher target/walkaway for claim scenario.
