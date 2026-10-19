# Token Factory & stack crib sheets (DealTable path)

Missed the live workshops? Do these **small builds** in order. ~15–45 min each. You already ship most of this in DealTable — these make the concepts stick.

Official docs beat random YouTube for Token Factory (product moves fast). Use video for *intuition*; use docs + curl for *muscle memory*.

---

## Map: email marketing → what you actually need

| Email says | DealTable already does | Learn next |
| --- | --- | --- |
| Try 60+ models in one flow | Nemotron Nano only (by design) | Playground: swap Nano ↔ Super once |
| Fine-tune / distill | Prompt-only today | Optional later (Sheet D) |
| Dedicated inference / scale | Serverless API on Vercel | Not needed for hackathon |
| LangChain / LlamaIndex / MCP | WebMCP on the page; fetch to Token Factory | Sheet B + C |
| Enterprise SSO / HIPAA | N/A for demo | Skip |

---

## Links (bookmark these)

| Resource | URL |
| --- | --- |
| Token Factory console / Playground | https://tokenfactory.nebius.com |
| Quickstart | https://docs.tokenfactory.nebius.com/quickstart |
| Nemotron on Token Factory | https://nebius.com/services/token-factory/nemotron |
| Fine-tune how-to | https://docs.tokenfactory.nebius.com/post-training/how-to-fine-tune |
| Official cookbook (examples) | https://github.com/nebius/token-factory-cookbook |
| Nebius × NVIDIA hackathon | https://nebiusglobalaihackathon.devpost.com/ |
| Tavily docs | https://docs.tavily.com |
| Your DealTable live | https://dealtable-webmcp.vercel.app |

**YouTube / video:** search these titles on YouTube (quality varies; prefer Nebius / NVIDIA official channels):

- `Nebius Token Factory` + `OpenAI compatible API`
- `NVIDIA Nemotron` + `Token Factory` or `NIM`
- `Tavily AI search API tutorial` (short RAG grounding videos)

If a video is older than ~6 months, trust **docs.tokenfactory.nebius.com** over the video for base URLs and model IDs.

---

## Sheet A — Mental model (10 min, no code)

1. **Token Factory** = hosted inference (and optional fine-tune). You send chat messages; you get tokens back. Same shape as OpenAI’s API.
2. **Model ID** = which brain (e.g. `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`). Change the string to try another model.
3. **API key** = server secret (`NEBIUS_API_KEY`). Never `VITE_` / never in the browser.
4. **Playground** = UI to try prompts; export/copy the same request your app should make.
5. DealTable flow:

```
You counter in Hub
  → POST /api/counterparty (Vercel)
       → Tavily search (comps)
       → Token Factory chat.completions (Nemotron)
  → text + proposedPrice + sources on screen
```

---

## Sheet B — Mini build: one curl to Nemotron (15 min)

**Goal:** See a raw Token Factory reply outside DealTable.

```bash
# From project root — key stays in .env.local (do not paste into chat)
export NEBIUS_API_KEY="$(grep '^NEBIUS_API_KEY=' .env.local | cut -d= -f2-)"

curl -s https://api.tokenfactory.nebius.com/v1/chat/completions \
  -H "Authorization: Bearer $NEBIUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
    "temperature": 0.2,
    "messages": [
      {"role": "system", "content": "You are a landlord agent. Reply with JSON only: {\"text\":\"...\",\"proposedPrice\":52}"},
      {"role": "user", "content": "Tenant offers 44 per sqft. Counter."}
    ]
  }' | python3 -m json.tool
```

**Check you understand:**

- [ ] Where is `base_url`? (`…/v1/`)
- [ ] Which field is the model reply? (`choices[0].message.content` — sometimes reasoning exists too)
- [ ] Why DealTable parses JSON server-side and rejects meta leaks

**Stretch:** In Playground, paste the same system prompt, export the request, compare to `src/server/counterpartyLlm.js`.

---

## Sheet C — Mini build: Tavily → then Nemotron (20 min)

**Goal:** Feel why Market check exists.

```bash
export TAVILY_API_KEY="$(grep '^TAVILY_API_KEY=' .env.local | cut -d= -f2-)"

# 1) Search (or hit your running app)
curl -s -X POST http://127.0.0.1:5173/api/market \
  -H 'Content-Type: application/json' \
  -d '{"scenario":"lease","title":"Commercial Lease"}' | python3 -m json.tool | head -80

# 2) Full turn (Tavily + Nemotron together)
curl -s -X POST http://127.0.0.1:5173/api/counterparty \
  -H 'Content-Type: application/json' \
  -d '{
    "kind":"offer","price":44,"termYears":5,
    "deal":{"scenario":"lease","title":"Commercial Lease","currency":"$","unit":"/sqft","side":"buyer","currentAsk":52,"priorAsk":52,"termYears":5},
    "persona":{"agentName":"Apex Agent","org":"Apex","behaviors":["Anchors high"]},
    "messages":[{"from":"principal","author":"You","text":"Counter at 44"}]
  }' | python3 -m json.tool | head -100
```

**Check:**

- [ ] `sources` length > 0
- [ ] `fallback` is `false` and `model` mentions Nemotron
- [ ] Reply should not invent a $/sqft that never appeared in snippets (ideal; prompt enforces this)

---

## Sheet D — Fine-tune (optional, 45–90 min later)

Only after Sheets B–C feel boring.

1. Read: https://docs.tokenfactory.nebius.com/post-training/how-to-fine-tune  
2. Cookbook notebook: https://github.com/nebius/token-factory-cookbook (fine-tuning examples)  
3. Build a tiny JSONL of DealTable-style pairs:

```json
{"messages":[{"role":"system","content":"...persona + JSON contract..."},{"role":"user","content":"...offer 44..."},{"role":"assistant","content":"{\"text\":\"...\",\"proposedPrice\":50}"}]}
```

4. Upload → create fine-tune job (LoRA) → deploy private model → point `model:` in `/api/counterparty` at the new ID.  
5. Keep HITL + Tavily — fine-tune does **not** replace the floor.

DealTable does **not** need this for Nebius submit.

---

## Sheet E — Weekend QA checklist (15 min)

On https://dealtable-webmcp.vercel.app :

1. Lease → mandate → Start  
2. Counter once → see **Market check · Tavily**  
3. Confirm reply is not “RULE-ENGINE FALLBACK”  
4. Hit below walkaway → **Grant waiver** (floor + time)  
5. Revoke → authority panel updates  
6. Accept → Summary / handoff  

---

## Suggested 3-day catch-up plan

| Day | Do |
| --- | --- |
| 1 | Sheet A + B + 20 min Playground with Nano |
| 2 | Sheet C + one Hub session on live URL |
| 3 | Skim fine-tune docs (Sheet D) *or* film video beats from `docs/VIDEO_V2.md` |

Skip Zetaris / Meterless unless you also enter **Open Agent** — they are not required for Nebius DealTable.
