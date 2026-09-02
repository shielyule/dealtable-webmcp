# Devpost Submission Checklist — DealTable

Use this line-by-line on [webmcp.devpost.com](https://webmcp.devpost.com/). Tick each box before you hit Submit.

---

## ⚠️ Fix before submit (gaps in repo today)

| Item | Status | Action |
|------|--------|--------|
| Live URL | ✅ | https://dealtable-webmcp.vercel.app |
| GitHub repo | ❌ | No commits yet — push code if Devpost asks for repo link |
| README | ❌ | Add minimal README (see below) or paste Testing Instructions into Devpost |
| LICENSE | ❌ | Add MIT `LICENSE` if form requires open-source license |
| Video | ✅ (you) | Upload to YouTube — **public**, with audio |

---

## 1. Video 🎬

| Check | Notes |
|-------|-------|
| [ ] Uploaded to **YouTube** | Not Drive, not unlisted-only if rules say public |
| [ ] **Public** visibility | Judges must be able to open without login |
| [ ] **Audio** explains what you built + WebMCP | Your voice or AI narration — both OK per rules |
| [ ] **Best material in first 3 minutes** | Judges may stop at 3:00 — yours is longer, that's OK if opening shows: mandate → WebMCP tool call → HITL → summary |
| [ ] YouTube title | e.g. `DealTable — WebMCP Negotiation Room (Hackathon Demo)` |
| [ ] YouTube description | Paste Devpost summary + live URL + "WebMCP tools: get_deal_state, propose_offer, …" |

**Optional YouTube chapter markers** (helps judges who scrub):

```
0:00 Intro + scenario
0:30 Mandate setup
1:00 ChatGPT WebMCP tools
1:45 HITL approval
2:15 Accept + audit export
```

---

## 2. Devpost form fields

### Project name
- [ ] **DealTable** (specific, not AI-generic ✅)

### Tagline / elevator pitch (if asked, ~1 line)
```
Mandate-driven negotiation where ChatGPT advises via WebMCP tools and humans veto walkaway breaches.
```

### Live demo URL
- [ ] https://dealtable-webmcp.vercel.app
- [ ] Quick test in incognito before submit — loads Home, Lease → Setup works

### Video URL
- [ ] Your YouTube link

### Repository URL (if required)
- [ ] Push to GitHub first — see "Fix before submit" above
- [ ] Repo should include `README.md` with run + test steps

### License (if required)
- [ ] MIT recommended for hackathons

### Teammates
- [ ] Solo — list only yourself, or leave blank per form rules

### Login / credentials
- [ ] **N/A — no login required** ✅  
  Write in Testing Instructions: *"No account needed. Open URL, pick scenario, start negotiation."*

---

## 3. Description — copy/paste draft 📝

Judges want **four answers**. Use this structure (edit if form has separate boxes, or combine into one description field):

---

### Why is this a strong fit for WebMCP?

Deal negotiation is a natural WebMCP use case: an external advisor (ChatGPT) needs **structured access to live deal state** — mandate, current ask, audit trail — without brittle DOM scraping. DealTable registers **seven typed tools** on `document.modelContext` (`get_deal_state`, `set_mandate`, `parse_opening_offer`, `propose_offer`, `concede`, `accept_term`, `hold_firm`). ChatGPT reads state and executes moves on the page in one turn, e.g. *"call get_deal_state, then propose_offer at 44"* — instead of the user manually clicking through Setup → Hub → counter fields.

---

### How does WebMCP create a better experience?

Before WebMCP, an advisor agent would guess from page text or require custom APIs. Here, tools return **JSON deal state** and apply **validated mutations** (counters, holds, accepts) with schemas and descriptions. Offers below the human's **walkaway** trigger **human-in-the-loop** approval on the page — the tool waits until the principal clicks Approve. The advisor gets power; the human keeps veto authority.

---

### What can people and agents do together now that was hard before?

**Together:** A freelancer (or founder, tenant, claims handler) sets a **mandate** (target, walkaway, concessions), role-plays against a counterparty agent, and lets **ChatGPT call negotiation tools** while they watch leverage metrics and audit logs update in real time.

**Previously difficult:** Separating roles (principal vs advisor vs counterparty), enforcing walkaway limits on agent actions, and producing an **audited closure record** — usually scattered across email, spreadsheets, and ad-hoc chat. DealTable runs mandate → negotiate → HITL → **summary + JSON export** in one session.

---

### How did you implement WebMCP?

- **Stack:** Vite + React; tools in `src/lib/webmcp.js`
- **Registration:** `document.modelContext.registerTool()` on app load (`App.jsx`)
- **Tools:** Seven negotiation tools with JSON Schema inputs, read-only hints where appropriate
- **HITL:** `propose_offer` / `concede` check walkaway; modal blocks until Approve/Reject; tool promise resolves with result
- **State:** Single in-browser session store (`dealStore.js`) — snapshot exposed via `get_deal_state`
- **Judge path:** Open deployed URL in **ChatGPT in-app browser** → tools visible → call as advisor
- **Local path:** Chrome `enable-webmcp-testing` flag + Model Context Tool Inspector

**Honest scope:** Counterparty is rule-based for this hackathon build; WebMCP integration is the external advisor bridge. Session state is in-browser only (no database). Next iteration: rules-led LLM counterparty.

---

## 4. Testing instructions for judges 🔎

Paste into the "Try it out" / Testing Instructions field:

```
1. Open https://dealtable-webmcp.vercel.app (no login required).

2. Pick "Commercial Lease Renewal" → set Target 45, Walkaway 40, Moderate concessions → Start Negotiation.

3. WebMCP (ChatGPT desktop): open the same URL in ChatGPT's in-app browser and ask:
   "Call get_deal_state, then propose_offer at 44 with note Structured counter via WebMCP."
   Watch the chat thread update on the page.

4. HITL: click "Counter $39/sqft — triggers HITL" in Suggested Actions (right rail) → Approve.

5. Accept Offer → Summary page → Download audit JSON.

Optional local WebMCP: chrome://flags/#enable-webmcp-testing → Enabled, then reload.
```

---

## 5. Scoring criteria — self-check 🎯

| Criterion | You tick? | Evidence in submission |
|-----------|-----------|------------------------|
| **WebMCP Leverage** | ✅ Strong | 7 tools, HITL gate, tested in ChatGPT desktop + Chrome MCP extension; video shows tool calls |
| **Execution** | ✅ Strong | Full product flow: 6 scenarios, mandate, hub, advisor, audit, summary, live deploy |
| **Potential Impact** | ✅ Good | Description spells out real audience (freelancers, tenants, negotiators) + mandate/audit problem |
| **Creativity & Ambition** | ✅ Solid | Three-role split (principal / counterparty / ChatGPT advisor) vs single chatbot |

**Do not overclaim in text:** No LLM counterparty yet, no CRM integration, no persistence — you already say this honestly ✅

---

## 6. AI usage — be transparent 🤖

If Devpost asks how you built it:

```
AI assistants (Cursor/ChatGPT) were used to scaffold UI, debug WebMCP/HITL flows, and draft documentation. All demo behavior runs in the shipped app: rule-based counterparty, real WebMCP tool registration, live Vercel deploy. Video shows the actual product.
```

This matches hackathon rules — OK to use AI to build and narrate.

---

## 7. Screenshots (if Devpost allows uploads)

Capture these from production URL:

- [ ] Home — welcome guide + scenario grid
- [ ] Setup — mandate + "WebMCP tools registered" tooltip
- [ ] Hub — chat + Advisor rail
- [ ] HITL modal (amber pulsing dialog)
- [ ] Summary — closure + export buttons
- [ ] Optional: ChatGPT panel showing tool invocation

---

## 8. Final pre-submit smoke test (5 min)

- [ ] Live URL loads on phone or incognito
- [ ] Lease → 45/40 → Start → Hub has messages
- [ ] ChatGPT tool call updates chat (or you know video already proves this)
- [ ] HITL button → Approve works
- [ ] Accept → Summary → JSON download
- [ ] YouTube link opens public while logged out
- [ ] Description pasted — no "Lorem ipsum" or empty sections
- [ ] Spell-check project name: **DealTable**

---

## 9. Minimal README (if pushing GitHub)

```markdown
# DealTable

Negotiation room for the agentic web — WebMCP hackathon entry.

**Live demo:** https://dealtable-webmcp.vercel.app

## Run locally

npm install
npm run dev

## WebMCP test

Open site in ChatGPT in-app browser, or enable chrome://flags/#enable-webmcp-testing

## Docs

- docs/DEMO.md — judge script
- docs/QA.md — test checklist
```

---

## 10. Submit

- [ ] Devpost form complete — nothing blank
- [ ] Submit before **Sep 3, 2026 1:00pm PDT**
- [ ] Screenshot confirmation email / Devpost project page

Good luck — you're in good shape on substance. Biggest remaining item: **GitHub repo + README** if the form requires a repo link.
