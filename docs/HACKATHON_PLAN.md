# DealTable v2 — Nebius × NVIDIA

DealTable v2 enters the [Nebius × NVIDIA Global AI Hackathon](https://nebiusglobalaihackathon.devpost.com/) only. Nebius runs it; Devpost administers it. Submission deadline: **30 Oct 2026, 10:00am Pacific** (18:00 UK). The window has been open since 26 Aug 2026, so building can start now.

Must ship: a live call to Nebius Token Factory using Nemotron, and a live Tavily search on the negotiation path.

## Where we are

Devpost registration is done. Tavily and Nebius Token Factory keys are in `.env.local` (gitignored). Model: `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` via `https://api.tokenfactory.nebius.com/v1/`. Do not pay the AI Cloud $25 deposit.

The negotiation screen calls `POST /api/market` on start and `POST /api/counterparty` on each turn (Tavily comps, then Nemotron). Keys never go in the client.

## Your next steps

1. Claim Token Factory credits: the form on the [hackathon resources page](https://nebiusglobalaihackathon.devpost.com/resources), activation code `NEBIUS-DEVPOST-GLOBAL26`.
2. Join the Nebius Builders Program from that same page (second $25 of Token Factory credits, plus Tavily credits). Copy the Tavily key from there if it appears.
3. Stop there. Paste neither key into chat. When both exist, say so and we will put them in local env and Vercel ourselves.
4. Leave the Tavily billing page. No card until a live search is the only remaining step and the Builders key is unavailable.



### Category: Best Apps and Agents

**Best Apps and Agents.** DealTable is a finished negotiation app: a person sets a mandate, an agent plays the other side, and a human approves anything past walkaway.

Personal AI is the other track people might reach for. That track is an always-on private assistant with persistent memory, reusable skills, and tasks that continue across daily workflows (NemoClaw, OpenShell, Hermes, Nebius Serverless). DealTable is one session, one deal, in the browser. Stage-one judging passes a project when it is a genuine attempt at the track’s stated goal. Best Apps and Agents is that goal.

Track prize if we don’t place overall: NVIDIA Jetson Orin Nano.

A project can win **one** of grand / 2nd / 3rd **or** the track award, **plus one bonus**. The Tavily bonus stacks with either.


| Prize                  | Amount            | How we qualify                                                                                                                                            |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grand / 2nd / 3rd      | $20k / $10k / $6k | Overall score                                                                                                                                             |
| Best Apps and Agents   | Jetson Orin Nano  | This track                                                                                                                                                |
| Best Use of Tavily     | $3,000            | A functional runtime call to the Tavily API as part of the solution                                                                                       |
| Most Valuable Feedback | Swag pack         | Complete the Token Factory feedback section on the form                                                                                                   |
| City Winner            | $500              | Only if you attended a listed Builders & Brews. London was 15 Sep 2026. Later European dates: Warsaw 22 Sep, Amsterdam 25 Sep, Berlin 29 Sep, Paris 1 Oct |




### One line for the form

DealTable already lets a person set a mandate and approve anything past walkaway. v2 replaces the scripted counterparty with Nemotron on Nebius Token Factory, and grounds that counterparty’s market claim with a live Tavily search.

### What changed (required, because v1 existed before 26 Aug)

Before this window the counterparty was `counterpartyReply()` in `src/lib/counterpartyEngine.js`. During the window it becomes a Nemotron call on Token Factory, with a Tavily search supplying the comps that reply cites. The shell stays: mandate, WebMCP tools, HITL modal, audit, scenarios.

### Requirements checklist

- [x] Join the hackathon on Devpost.
- [x] Token Factory credits: activation code `NEBIUS-DEVPOST-GLOBAL26` on the [resources page](https://nebiusglobalaihackathon.devpost.com/resources).
- [x] Nebius Builders Program (second $25, and Tavily credits). No personal card on Tavily unless this path does not issue a key.
- [x] Tavily API key in hand (1,000 credits). Put it in `.env.local` as `TAVILY_API_KEY`. Not in git, not in chat.
- [x] Live `POST` to Token Factory, key only in the server function: `https://api.tokenfactory.nebius.com/v1/` with Nemotron Nano (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`).
- [x] Live `POST https://api.tavily.com/search` from that same server function, on the negotiation path (see below). Key only on the server. Header: `Authorization: Bearer $TAVILY_API_KEY`.
- [ ] Public repo, MIT license visible in the GitHub About line. README says how to run, and where Nemotron, Token Factory, and Tavily are called.
- [ ] Live demo URL, free for judges through mid-December.
- [ ] YouTube video under 3 minutes, public, no copyrighted music. Show a Tavily-backed market line in the counterparty reply, then the walkaway modal blocking a low offer. **Use the v1 lessons + beat sheet in [`VIDEO_V2.md`](./VIDEO_V2.md)** (problem-first, first 45s = problem + one live proof, visuals then VO).
- [ ] Written “what changed” note on the form.
- [ ] Token Factory feedback section filled in.
- [ ] English throughout.



### Architecture

```
User or ChatGPT (WebMCP)
    → existing mandate UI, tools, HITL modal, audit
    → walkaway gate in the browser (runs first)
    → POST /api/counterparty          (Vercel; keys never in the client)
         1. POST https://api.tavily.com/search
         2. POST Token Factory chat completions (Nemotron Nano or Super)
              prompt includes the Tavily snippets and their URLs
    → reply text + proposed price + sources
    → audit log and a Market check on screen
```

Walkaway stays deterministic and runs before either API call. An offer under walkaway opens the modal and is not sent to the model as an accepted move. The prompt receives persona, the counterparty’s own ask, the transcript, and the Tavily snippets. It does not receive the user’s target or walkaway.

If Token Factory fails or the price is nonsense, fall back to `counterpartyReply()`. If Tavily fails, the turn can continue, the audit records the failure, and the reply must not invent a market figure.

### The Tavily call (this is the bonus, and it has to be real)

One search per counterparty turn, from the server, using the scenario in play. `search_depth: "basic"`, `max_results: 5`. Pass the returned `title`, `url`, and `content` into Nemotron and keep them on the audit record.


| Scenario                   | Query the server sends                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Commercial lease (`lease`) | Current class-A office rent per sq ft for the corridor named in the deal, this year |
| Freelance (`freelance`)    | Current freelance day rate or project band for the scope in the deal, this year     |
| Any other scenario         | A comps query built from `title`, unit, and currency — same shape                   |


The reply may cite a number only when that number appears in a snippet. The UI shows a Market check with the source link, so a judge can see the call did work without opening the network panel. The 3-minute video needs that line on screen.

A search that fires and is thrown away does not count as “part of the solution.” The snippet has to change what the counterparty says, and the source has to be visible.

### Build order

1. You: Token Factory credits and a Builders Program Tavily key. No card yet.
2. Code can start before those keys exist: `POST /api/counterparty` reading `NEBIUS_API_KEY` and `TAVILY_API_KEY` from the server env.
3. Once the keys exist: one curl to Token Factory (model id and latency), one curl to `POST /search` (lease comps).
4. Wire the route behind the walkaway check. Structured reply: text, proposed price, sources.
5. Market check in the thread plus an audit entry per search.
6. Lease and freelance both demo-clean. Keys go in Vercel env, never in the client.
7. Video, “what changed” paragraph, feedback box, submit before 30 Oct 2026, 18:00 UK.



### How they score

Equal weight. Ties break in this order:

1. **Technological implementation** — Nemotron is the counterparty; Tavily is the evidence it cites. Both are on the request path.
2. **Design** — the existing room stays coherent. Market check belongs in the thread, not a new dashboard.
3. **Potential impact** — who negotiates under a mandate, and what the demo shows them getting.
4. **Quality of the idea** — an open model on Token Factory plays the other side, and live comps keep it from inventing the market.



### Out of scope for this entry

PDF parsing, a persistence database, mobile, multi-user, Nebius Serverless Endpoints (encouraged by the track, not required). Token Factory plus the Vercel function is the deploy.

### Shelf — DealTable v3 (circle back after Nebius submit)

**Zero-emotion sealed mediation:** each party privately uploads walk-away, priorities, and concessions into a sealed sandbox; an agent finds Pareto overlap and only reveals terms at binding equilibrium. Not for this hackathon. Revisit after 30 Oct.

**Multi-advisor picker:** Setup already lists ChatGPT / Claude / Gemini / Other; only ChatGPT is enabled for this entry. Wire the others when WebMCP (or equivalent) exists for each.