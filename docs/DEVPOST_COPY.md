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
