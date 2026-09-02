# DealTable — Demo Script (Single ChatGPT Window)

**URL:** https://dealtable-webmcp.vercel.app  
**Layout:** Everything in ChatGPT’s **browser panel** — no switching to Chrome, no flipping chat ↔ browser for HITL.

**Record:** Screen-capture **only the DealTable browser panel**. Voiceover while you click. ChatGPT chat can be off-screen or a second mic pass.

---

## Before Record

1. Open **ChatGPT desktop** → open URL in **in-app browser** (maximize that panel).
2. Copy this prompt (stays **above walkaway** — no HITL wait from ChatGPT):

```text
Call get_deal_state, then propose_offer at 44 with note "Structured counter via WebMCP."
```

3. Hard refresh the page once (`Cmd+Shift+R`) so you have the latest build with HITL fixes.

---

## Flow (~2 min) — all clicks in the browser panel

### 1. Home → Lease `[8 sec]`

**CLICK:** Commercial Lease

**SAY:** *"DealTable — mandate, counterparty, ChatGPT advises via WebMCP tools."*

---

### 2. Setup → Start `[12 sec]`

**CLICK:** Target **45**, walkaway **40**, Moderate → **Start Negotiation**

**SAY:** *"Target and walkaway set. Session demo — browser only."*

---

### 3. ChatGPT tools `[25 sec]`

**DO:** Paste prompt in ChatGPT chat (browser stays visible — watch the page update).

**SAY:** *"ChatGPT calls typed tools — get_deal_state, propose_offer — chat updates on the page. Not DOM scraping."*

**CLICK:** Audit tab (2 sec) — optional

**SAY:** *"Audited."*

---

### 4. HITL — UI button, same window `[15 sec]`

**Do NOT use ChatGPT for below-walkaway** — it pauses the tool and feels like switching.

**CLICK:** Amber button **"Counter $39/sqft — triggers HITL"** (Suggested Actions, right rail)

**SAY:** *"Below walkaway — human-in-the-loop. I approve here."*

**CLICK:** **Approve** on the pulsing modal (same panel)

---

### 5. Close `[15 sec]`

**CLICK:** Accept Offer → Summary → Download audit JSON

**SAY:** *"Closure — terms, next steps, audit export. DealTable. Thanks."*

---

## Cue card (one window)

```
Lease → 45/40/Start
(paste ChatGPT prompt — watch page)
Audit tab (optional)
"Counter $39 — triggers HITL" → Approve
Accept → Summary → export
```

---

## Two prompts only

**WebMCP (safe, no wait):**
```text
Call get_deal_state, then propose_offer at 44 with note "Structured counter via WebMCP."
```

**HITL:** use the **amber UI button** — not ChatGPT.

---

## If ChatGPT browser feels cramped

- Maximize the browser pane in ChatGPT desktop.
- Or record 1080p crop of just the DealTable iframe.
- Judges care that tools work on the page — they don’t need to see the chat panel in the video.

---

## Redeploy if HITL button missing

```bash
cd "/Users/shielyule/Desktop/Hackathon - MCP tool"
npm run build
vercel --prod
```
