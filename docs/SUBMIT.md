# Submit DealTable — WebMCP Hackathon

Deadline: **September 3, 2026 (1pm PDT)** · [Devpost](https://webmcp.devpost.com/)

## What you submit

1. **Live HTTPS URL** (required)
2. **~3 min demo video** showing WebMCP tools + HITL
3. **Devpost form** — description, screenshots

---

## Deploy to Vercel (recommended, ~5 min)

### One-time

```bash
npm i -g vercel
vercel login
```

### From project folder

Run these **one at a time** — do not paste inline comments (e.g. `# must pass`) on the same line; Vite treats `#` as a path and the build will fail.

```bash
cd "/Users/shielyule/Desktop/Hackathon - MCP tool"
npm run build
vercel --prod
```

When Vercel asks **Name?**, use a lowercase slug only, for example:

```text
dealtable-webmcp
```

Not `DealTable — WebMCP Hackathon` (uppercase, spaces, and em-dashes are rejected).

Optional non-interactive first deploy (after `vercel login`):

```bash
cd "/Users/shielyule/Desktop/Hackathon - MCP tool"
npm run build
vercel --prod --yes --name dealtable-webmcp
```

Copy the URL Vercel prints (e.g. `https://dealtable-webmcp.vercel.app`).

**Live production URL:** https://dealtable-webmcp.vercel.app

**Alternative:** Netlify → drag `dist/` folder after `npm run build`, or connect GitHub.

---

## Test before submit

1. Open your **production URL** in Chrome with WebMCP flag (local) or in **ChatGPT in-app browser** (judge path)
2. Run checklist: `docs/QA.md`
3. Record demo using script: `docs/DEMO.md`

---

## ChatGPT / WebMCP — what “hooked up” means

| Piece | How it works |
|-------|----------------|
| **You (principal)** | Use the website — set mandate, chat, approve HITL |
| **Counterparty** | **In the page** — rule-based engine replies to every message (no OpenAI API needed) |
| **Advisor (ChatGPT)** | Open your **same URL** inside ChatGPT → it calls WebMCP tools (`get_deal_state`, `propose_offer`, etc.) |
| **HITL** | Browser modal when offer &lt; walkaway — ChatGPT cannot bypass |

There is **no separate ChatGPT backend to install**. The hackathon integration **is** WebMCP: your page registers tools; ChatGPT invokes them when judges open your site in ChatGPT.

### Enable WebMCP locally

1. `chrome://flags/#enable-webmcp-testing` → Enabled
2. Or use ChatGPT’s browser on your deployed URL (judge environment)

### Quick ChatGPT test

Open your URL in ChatGPT and ask:

> List the WebMCP tools on this page, call get_deal_state, then propose_offer between target and ask.

---

## What is HITL?

**Human-in-the-Loop** — before an agent crosses a line you set (e.g. offer below **walkaway**), the app **stops** and shows:

**“Mandate breach — approval required”** → you click **Approve** or **Reject**.

That is the WebMCP demo story: agents are powerful, but **you** keep veto power on dangerous moves.

---

## Demo video outline (3 min)

| Time | Show |
|------|------|
| 0:00 | Home guide → pick Lease → set mandate |
| 0:45 | Start → counter in Hub → counterparty replies |
| 1:30 | ChatGPT calls `get_deal_state` + `propose_offer` |
| 2:00 | Trigger HITL (counter below walkaway) → Approve/Reject |
| 2:30 | Accept → **Summary** screen → export audit |
| 2:50 | One sentence: “WebMCP = structured tools + human approval” |

---

## Devpost description (starter)

**DealTable** is a negotiation room for the agentic web. Humans set a **mandate** (target, walkaway, concessions). A counterparty agent role-plays the other side. ChatGPT acts as external advisor via **WebMCP** — calling tools on the page instead of scraping the DOM. **HITL** gates any move past the walkaway limit.

Built with: Vite, React, `document.modelContext.registerTool`.

---

## If something breaks on deploy

- **`Project names must be lowercase`** — use `dealtable-webmcp`, not a display title with capitals or spaces
- **`Could not resolve entry module "#/index.html"`** — you ran `npm run build` with `# something` on the same line; run `npm run build` alone
- **`Can't deploy more than one path`** — run `vercel --prod` with no extra arguments; make sure you `cd` into the project folder first (quoted path because of spaces)
- Ensure `npm run build` works locally
- Vercel **Framework Preset**: Vite
- **Output directory**: `dist`
- SPA routing: `vercel.json` included (all routes → index.html)
