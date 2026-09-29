# DealTable

**Negotiation room for the agentic web** — WebMCP hackathon entry.

Humans set a **mandate** (target, walkaway, concessions). A counterparty agent role-plays the other side. **ChatGPT** advises via **WebMCP** tools on the page — structured calls, not DOM scraping. **Human-in-the-loop** gates any move past walkaway. Every action is audited; accepted deals get a closure summary.

**Live demo:** https://dealtable-webmcp.vercel.app

**Demo video:** https://youtu.be/-zPTvL9Deso

---

## Quick start (judges)

1. Open the live URL (no login).
2. Pick **Commercial Lease Renewal** → Target `45`, Walkaway `40`, Moderate → **Start Negotiation**.
3. **ChatGPT:** open the same URL in the in-app browser and run:
   ```
   Call get_deal_state, then propose_offer at 44 with note "Structured counter via WebMCP."
   ```
4. **HITL:** click **Counter $39/sqft — triggers HITL** → **Approve**.
5. **Accept Offer** → Summary → **Download audit JSON**.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # add TAVILY_API_KEY + NEBIUS_API_KEY (server only)
npm run dev
```

Open http://127.0.0.1:5173

Keys are read by Vite middleware / Vercel `api/*` only — never `VITE_`-prefixed.

**WebMCP local testing:** enable `chrome://flags/#enable-webmcp-testing` in Chrome, or use ChatGPT’s in-app browser on the deployed URL.

---

## WebMCP tools

Registered via `document.modelContext.registerTool` in `src/lib/webmcp.js`:

| Tool | Purpose |
|------|---------|
| `get_deal_state` | Read mandate, ask, messages, advisor metrics |
| `set_mandate` | Update target, walkaway, concessions |
| `parse_opening_offer` | Extract numbers from pasted offer text |
| `propose_offer` | Send counter (HITL if below walkaway) |
| `concede` | Move toward counterparty |
| `accept_term` | Close deal (requires approval) |
| `hold_firm` | Refuse latest concession |

---

## Stack

- Vite + React + Tailwind
- In-browser session store
- Nemotron counterparty on Nebius Token Factory (`POST /api/counterparty`), with rule-engine fallback
- Live market comps via Tavily (same route + opening `POST /api/market`)
- Deployed on Vercel

---

## Docs

| File | Purpose |
|------|---------|
| [docs/DEMO.md](docs/DEMO.md) | Judge / ChatGPT demo script |
| [docs/QA.md](docs/QA.md) | Manual test checklist |
| [docs/DEVPOST_CHECKLIST.md](docs/DEVPOST_CHECKLIST.md) | Submission checklist |
| [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) | v1 recorded demo script (WebMCP) |
| [docs/VIDEO_V2.md](docs/VIDEO_V2.md) | Nebius demo video brief — v1 lessons + beat sheet |
| [docs/HACKATHON_PLAN.md](docs/HACKATHON_PLAN.md) | Nebius × NVIDIA DealTable v2 crib sheet |

---

## Honest scope (hackathon build)

- Counterparty replies come from **Nemotron Nano** on Token Factory when keys are set; otherwise the rule engine.
- Market comps are a live Tavily search shown with the reply.
- Session state is **in-browser only** (refresh resets).
- Walkaway HITL still runs in the browser before any model call.

---

## License

MIT — see [LICENSE](LICENSE).
