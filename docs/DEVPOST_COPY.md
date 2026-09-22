# Devpost copy — DealTable

## Elevator pitch (tagline field)

**DealTable:** You set the walkaway. ChatGPT calls negotiation tools on the page—not the DOM. Humans approve what agents can't.

---

## Elevator pitch (longer, if separate field)

DealTable is a mandate-driven negotiation room for the agentic web. You define target, walkaway, and concessions; a counterparty agent pushes back; ChatGPT acts as external advisor via seven WebMCP tools (`get_deal_state`, `propose_offer`, and more). Offers below your walkaway hard-stop for human approval. Every move is audited; closed deals export a transcript and JSON audit trail. Built for freelancers, founders, and anyone who needs agent help without agent override.

---

## YouTube description

```
DealTable — WebMCP Hackathon Demo
Negotiation room for the agentic web

Live demo: https://dealtable-webmcp.vercel.app
GitHub: https://github.com/shielyule/dealtable-webmcp

WHAT IT DOES
DealTable lets a human principal set a negotiation mandate (target price, walkaway limit, concessions), role-play against a counterparty agent, and let ChatGPT advise by calling WebMCP tools on the page—instead of scraping the UI.

WHAT YOU'LL SEE
• Pick a scenario and set your mandate
• ChatGPT calls get_deal_state and propose_offer via WebMCP
• Human-in-the-loop (HITL) when an offer crosses the walkaway
• Accept deal → closure summary + audit export

WEB MCP TOOLS
get_deal_state · set_mandate · parse_opening_offer · propose_offer · concede · accept_term · hold_firm

TRY IT (no login)
1. Open https://dealtable-webmcp.vercel.app
2. Commercial Lease → Target 45, Walkaway 40 → Start
3. Open same URL in ChatGPT in-app browser and ask it to call get_deal_state + propose_offer

Built with Vite, React, document.modelContext.registerTool
Hackathon: WebMCP (Chrome / OpenAI)

#WebMCP #Hackathon #AI #Negotiation #HumanInTheLoop
```

*(Update GitHub URL after you push.)*

---

## About the project (Devpost — paste into "About" field)

**Video:** https://youtu.be/-zPTvL9Deso  
**Live demo:** https://dealtable-webmcp.vercel.app  
**Repo:** https://github.com/shielyule/dealtable-webmcp

```markdown
## Inspiration

I've negotiated freelance rates, lease renewals, and vendor terms the slow way — email threads, mental math on walkaway numbers, and no audit trail when things went sideways. When the WebMCP hackathon opened, the fit clicked: **negotiation is exactly the kind of task where an external agent needs structured access to live state**, not a screenshot of a web page.

DealTable is the room I wished existed — you set the rules once (your **mandate**), something role-plays the other side, and ChatGPT can advise by calling tools on the page. The human still owns the lines that matter.

## What we built

DealTable is a mandate-driven negotiation app:

- **You (principal)** set target price, walkaway limit, and concession tolerance
- **Counterparty agent** (rule-based for this build) opens and responds in chat
- **ChatGPT (advisor)** calls seven WebMCP tools registered on the page
- **Human-in-the-loop (HITL)** blocks any offer below walkaway until you Approve or Reject
- **Audit log + closure summary** export transcript and JSON when a deal closes

The core constraint is simple. For any proposed price \(p\):

\[
\text{apply}(p) = \begin{cases}
\text{execute immediately} & \text{if } p \geq w \\
\text{require human approval} & \text{if } p < w
\end{cases}
\]

where \(w\) is your walkaway. Agents can suggest; they cannot silently cross your floor.

## How we built it

**Stack:** Vite + React + Tailwind, deployed on Vercel. No backend API — session state lives in a browser store so judges can run the demo instantly with no login.

**WebMCP:** On load, `App.jsx` registers tools via `document.modelContext.registerTool` in `src/lib/webmcp.js`:

| Tool | Role |
|------|------|
| `get_deal_state` | Read mandate, ask, messages, advisor metrics |
| `set_mandate` | Update target / walkaway / concessions |
| `parse_opening_offer` | Extract numbers from pasted offer text |
| `propose_offer` / `concede` | Send counters (HITL if below walkaway) |
| `accept_term` | Close with approval gate |
| `hold_firm` | Refuse latest concession |

**HITL:** When a tool returns `needsHitl`, a modal opens on the page. The WebMCP tool promise resolves only after the human clicks Approve or Reject — ChatGPT cannot bypass the walkaway.

**Product flow:** entrance → mandate setup → negotiation hub (chat + advisor rail) → optional advisor insights → audit log → summary on accept.

AI coding assistants (Cursor) helped scaffold UI and debug WebMCP flows; the shipped demo is the real app — live URL, working tools, recorded video.

## What I learned

1. **WebMCP changes the integration shape.** Instead of "ChatGPT reads the page," it's "ChatGPT calls typed tools that mutate validated state." That is materially safer and easier to audit than DOM automation.

2. **Split the roles.** One chatbot pretending to be both advisor and counterparty muddies the demo. Separating principal / counterparty / external advisor maps to how real deals work and makes HITL legible to judges.

3. **HITL has to live on the page.** ChatGPT's tool bridge struggled when human approval UI was unclear or nested wrong in tool state. The fix was a prominent modal, a top banner, and a one-click "triggers HITL" demo button in the same browser panel.

4. **Honest scope wins.** The counterparty is rule-based, not an LLM — and that's fine for a WebMCP hackathon entry where the story is the advisor bridge. Saying so clearly beats overclaiming.

## Challenges

- **Deploy friction:** Vercel rejected a project name with capitals and spaces; a `# comment` on the same line as `npm run build` broke Vite. Small things that eat time on deadline day.

- **HITL state bug:** Early builds passed the whole `proposeOffer` result into `openHitl` instead of the inner pending object. Approving produced `$undefined/sqft` in the chat. Fixed by unwrapping pending correctly and guarding invalid prices.

- **ChatGPT single-window demo:** Triggering HITL via a WebMCP tool call pauses ChatGPT while waiting for a page click — awkward on video. We split the demo: ChatGPT calls tools for safe moves above walkaway; HITL is triggered from an in-page button in the same browser panel.

- **Three minutes is tight.** The first script was too essay-heavy. The recorded demo front-loads: mandate → WebMCP tool call → HITL → closure export.

## What's next

- Rules-led **LLM counterparty** conditioned on persona behaviors
- Persist sessions and export to contract workflows
- Deeper document parse for opening offers (PDF)

---

**Try it:** https://dealtable-webmcp.vercel.app (no login)  
**Video:** https://youtu.be/-zPTvL9Deso
```
