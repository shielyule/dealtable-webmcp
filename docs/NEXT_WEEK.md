# Pick up Monday 7 Sept 2026

## Done
- WebMCP / DealTable submitted
- Blog: https://shielyule.co.uk/2026/09/03/the-day-i-outsourced-my-backbone-to-an-mcp-bridge/
- Video: https://youtu.be/-zPTvL9Deso
- Repo: https://github.com/shielyule/dealtable-webmcp

---

## Tribunal Ally

**Location:** `~/Desktop/Hackathon_all things agentic/`  
**Repo:** https://github.com/shielyule/tribunal-ally (private)  
**Live:** https://tribunal-ally-828288109486.europe-west2.run.app  
**Stack:** Vite/React, Firebase Auth/Firestore/Storage (EU), Gemini on Cloud Run

### Production — discuss Monday
- Strong real-world problem + your domain knowledge
- Must-haves before charging: legal disclaimer audit, GDPR/privacy policy, data retention, “not legal advice” on every AI output, professional indemnity research
- Monetisation: freemium (guidance free, Case Helper / bundle export paid) — pairs with Shipaton
- Fix known bug: Case Helper blank screen after Google login (from prior session)

---

## RevenueCat Shipaton 2026 — discuss Monday

**Deadline:** Sep 30, 2026  
**Devpost:** https://revenuecat-shipaton-2026.devpost.com/

**Requirements:**
- **New** iOS/Android app first published Aug 1 – Sep 30, 2026
- RevenueCat SDK (IAP or ads)
- Store listing OR **Next Gen Award** (students: video + public repo, no paid dev account)

**Fit:** Tribunal Ally mobile wrapper or native app with premium Case Helper / PDF export — **not** DealTable (web-first).

**Tight timeline:** ~26 days left from Sep 7. App Review buffer matters.

---

## DealTable v2 — Nebius × NVIDIA

Current plan: [HACKATHON_PLAN.md](HACKATHON_PLAN.md). Best Apps and Agents. Nemotron on Token Factory, plus a live Tavily search. Submit by 30 Oct 2026, 18:00 UK.

---

## Voice DealTable — AssemblyAI (Sep 1–30, month-long)

**Lablab · $10k · join anytime in September**

### Scope (2-week comfortable / 1-week sprint)

**Name:** DealTable Voice — negotiate out loud  
**Pitch:** Speak your counter; hear the counterparty respond. Mandate and HITL stay on screen.

### Architecture
```
Mic → AssemblyAI STT → text → existing dealStore (sendInstruction / proposeOffer)
Counterparty reply text → TTS (AssemblyAI or browser) → speaker
Screen: same Hub UI + waveform + transcript
```

### MVP features (Week 1)
| Feature | Notes |
|---------|-------|
| Push-to-talk | One button in Hub — simpler than always-on for demo |
| STT | AssemblyAI streaming or prerecorded |
| Display | Live transcript bubble (you + counterparty) |
| TTS | Read counterparty messages aloud (optional toggle) |
| HITL | Unchanged — visual modal; pause TTS when modal open |

### Week 2 (if time)
- Persona voice settings (pace/formality in prompt, not cloned voices)
- “Read my mandate back” voice command via WebMCP or local intent
- 3-min demo: speak → counterparty speaks → HITL → accept

### Keep rule-based counterparty first
Voice is the hackathon hook; the Nemotron counterparty is the Nebius build in HACKATHON_PLAN.md.

### AssemblyAI checklist
- [ ] AssemblyAI API key
- [ ] Mic permissions in HTTPS deploy
- [ ] Demo video shows **voice in + voice out** clearly

---

## Suggested calendar (from Sep 7)

| Week | Focus |
|------|--------|
| Sep 7–13 | Shipaton decision + Tribunal Ally production gaps |
| Sep 14–30 | Shipaton app OR AssemblyAI Voice DealTable (pick one) |
| Oct 1–30 | DealTable v2 for Nebius × NVIDIA (see HACKATHON_PLAN.md). Submit by 30 Oct, 18:00 UK |

---

## Open Monday with
1. Shipaton: Tribunal Ally mobile vs skip (deadline pressure)
2. Tribunal Ally: production checklist vs side project
3. Voice DealTable (September) vs Nebius DealTable v2 (through 30 Oct)
