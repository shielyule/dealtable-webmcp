# DealTable

**Negotiation room for the agentic web** — WebMCP hackathon entry.

Humans set a **mandate** (target, walkaway, concessions). A counterparty agent role-plays the other side. **ChatGPT** advises via **WebMCP** tools on the page — structured calls, not DOM scraping. **Human-in-the-loop** gates any move past walkaway. Every action is audited; accepted deals get a closure summary.

**Live demo:** https://dealtable-webmcp.vercel.app

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
npm run dev
```

Open http://localhost:5173

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
- In-browser session store (no backend / no API key for demo)
- Rule-based counterparty engine (`src/lib/counterpartyEngine.js`)
- Deployed on Vercel

---

## Docs

| File | Purpose |
|------|---------|
| [docs/DEMO.md](docs/DEMO.md) | Judge / ChatGPT demo script |
| [docs/QA.md](docs/QA.md) | Manual test checklist |
| [docs/DEVPOST_CHECKLIST.md](docs/DEVPOST_CHECKLIST.md) | Submission checklist |
| [docs/VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) | Recorded demo script |

---

## Honest scope (hackathon build)

- Counterparty is **rule-based** (not LLM) — WebMCP integration is the **external advisor** bridge.
- Session state is **in-browser only** (refresh resets).
- Next iteration: rules-led LLM counterparty, persistence, document parse.

---

## License

MIT — see [LICENSE](LICENSE).
