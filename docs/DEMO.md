# DealTable — WebMCP Demo Script

Use this when recording your hackathon video or walking judges through the app in **ChatGPT's in-app browser**.

## What judges should see

1. **Human principal** sets a mandate (target, walkaway, concessions).
2. **Counterparty agent** opens with their offer; responds to counters (rule-based demo engine).
3. **Advisor panel** updates leverage / probability as numbers move.
4. **Audit log** shows tool calls and state mutations.
5. **ChatGPT (external advisor)** calls WebMCP tools on the page — structured, not DOM scraping.
6. **HITL** — offers below walkaway or risky accepts pause for human approval.

---

## Before the demo

### 1. Run or deploy the app

```bash
cd "/Users/shielyule/Desktop/Hackathon - MCP tool"
npm install
npm run dev
# or: npm run build && npm run preview
```

Deploy to Vercel / Netlify / Cloud Run and copy the **HTTPS** URL.

### 2. Enable WebMCP in Chrome (local testing)

1. Open `chrome://flags/#enable-webmcp-testing`
2. Set **Enabled** → Relaunch Chrome

For production judges on origin trial, add your origin trial token per [Chrome WebMCP docs](https://developer.chrome.com/docs/ai/webmcp).

### 3. Optional: Model Context Tool Inspector

Install the **Model Context Tool Inspector** extension to verify tools register and to manually invoke them.

---

## ChatGPT setup (advisor agent)

The **advisor** is ChatGPT opened on your live URL. The page exposes tools; ChatGPT calls them.

### Step A — Open your site in ChatGPT

1. Submit your project URL to the WebMCP hackathon (Devpost).
2. In **ChatGPT**, open your deployed URL in the **in-app browser** (how judges will experience it).

### Step B — Confirm tools are visible

Ask ChatGPT:

> What WebMCP tools are available on this page?

Expected tools:

- `get_deal_state`
- `set_mandate`
- `parse_opening_offer` *(extract target/walkaway from pasted offer text)*
- `propose_offer`
- `concede`
- `accept_term`
- `hold_firm`

If none appear, WebMCP is not active in that browser (flag / origin trial / unsupported client).

### Step C — Run the table (2-minute script)

**On the page (you, the human):**

1. Pick **Commercial Lease Renewal** on the entrance screen.
2. Set target **$45/sqft**, walkaway **$40/sqft**, Moderate concession.
3. Paste an opening offer (or keep default).
4. Click **Start Negotiation**.

**In ChatGPT (advisor):**

```
Call get_deal_state and summarize my leverage vs the counterparty.
Then propose_offer at a price between my target and current ask with a short note.
If the page asks for approval, wait for me to click Approve in the UI.
```

**Back on the page:**

5. Show counterparty reply after the offer.
6. Show **Advisor Insights** — leverage / probability changed.
7. Click **Accept Offer** with a bad term → **HITL modal** appears.
8. Open **Audit Log** → Export JSON.

---

## Prompts for judges (copy-paste)

**Read state**

```
Use get_deal_state. What is my target, walkaway, and current ask? Am I above or below target?
```

**Adjust mandate**

```
Use set_mandate to set walkaway to 41000 and concessionPct to 0.1. Confirm with get_deal_state.
```

**Counter (may trigger HITL)**

```
Use propose_offer at 39 with note "Final counter before walkaway." Tell me if human approval is required.
```

**Hold**

```
Use hold_firm and read back the latest messages from get_deal_state.
```

---

## Architecture (one slide)

| Role | Who | How |
|------|-----|-----|
| Principal | Human | Sets mandate, approves HITL |
| Counterparty | In-page engine | Rule-based replies (demo) |
| Advisor | ChatGPT | WebMCP tools on the page |
| Protocol | WebMCP | `document.modelContext.registerTool` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No tools in ChatGPT | Enable WebMCP flag; use HTTPS; check origin trial |
| Tools register locally but not in ChatGPT | Judge environment may differ — test in ChatGPT browser before submit |
| HITL modal stuck | Approve or Reject **on the DealTable page** (not in ChatGPT chat); tool waits until you click |
| ChatGPT says "can't complete human interaction" | Click **Approve** on the page modal while the tool is running; fixed in latest deploy — was a pending-state bug |
| `Accepted at $undefined` in chat | Caused by bad HITL resolve — refresh and redeploy; fixed |
| Counterparty silent | Send a counter via **Suggested Actions** or `propose_offer` |

---

## Post-hackathon roadmap

- LLM counterparty (persona-conditioned)
- LLM advisor analyzing each turn (or deeper ChatGPT integration)
- PDF parse for opening offers
- AI-guided custom scenario builder
- Google Drive — only if OAuth scope is worth it
