# DealTable — Final demo script (Nebius × NVIDIA)

**URL:** https://dealtable-webmcp.vercel.app  
**Record:** QuickTime mute screen → iMovie voiceover.  
**Length:** ~2–2.5 min.

**Film Commercial Lease only.** After a deploy with the hardened parser, hard-refresh and confirm **no** brown “Rule-engine fallback” tag before the real take.

You do **not** need to “boot up” anything local for production — the live site calls Nebius + Tavily on Vercel. Fallback means that API turn failed JSON parse (or keys blipped). Fix = redeploy + hard refresh + Lease scenario. Skip ChatGPT/WebMCP for this Nebius cut if tools aren’t visible.

---

## Before record

1. Open https://dealtable-webmcp.vercel.app → `Cmd+Shift+R`
2. Practice: Lease → Start → Counter → wait for reply  
   - Must see **Market check · Tavily**  
   - Must **not** see **Rule-engine fallback**
3. If fallback appears: wait 10s, **New Negotiation**, try once more. Still bad → stop filming until prod is healthy.
4. Teleprompter / stickies with the SAY lines.

---

## Target 45 vs walkaway 40 — why it’s not backwards

You’re the **tenant** (you pay). Landlord opened at **$52/sqft**.

| Field | Meaning on this deal |
| --- | --- |
| **Target $45** | Where you *want* the rent to land (your goal). |
| **Walkaway $40** | Your **hard floor** for this practice — you will not *offer below* $40 without a human-granted waiver. |
| **Current ask $52** | Their live number. |

You’re negotiating **down** from 52 toward 45. The walkaway is “don’t go lower than 40 without me approving.”  
(It is **not** “I’ll pay up to 40” — that would be a ceiling above the target, which is how some other buyer scenarios are phrased. On Lease, 40 is the concession floor.)

**SAY it this way on Setup** so it doesn’t sound contradictory.

---

## Final script

### 1. Home `[~12 sec]`

**CLICK:** Commercial Lease Renewal

**SAY:**  
*"DealTable is a practice negotiation room. You set a hard floor so agents can’t close a deal past your limits without you. We have nine pre-defined negotiations and you can build your own. Let’s walk a commercial lease."*

---

### 2. Setup — mandate `[~22 sec]`

**SET:** Target **45**, Walkaway **40**, Moderate → **Start Negotiation**

**SAY:**  
*"First, the mandate — the rules of the deal. Target is where you want to land: forty-five dollars a square foot. Walkaway is your hard floor: you won’t counter below forty without human approval. Concession is how flexible you’ll be. Their opening ask is fifty-two — we’re negotiating down. No login — the session runs in the browser so you can rehearse instantly."*

---

### 3. Live counterparty + market comps `[~40 sec]`

**CLICK:** Counter above walkaway (suggested mid / ~44)  
**WAIT:** reply + **Market check · Tavily** (no fallback badge)

**SAY:**  
*"The other side isn’t a canned script. NVIDIA Nemotron on Nebius Token Factory plays the landlord. Under the reply, Market check from Tavily pulls live market sources — so the numbers they lean on come from real comps and articles, not invented rates. You can open a source link if you want proof."*

*(Optional: hover/scroll the Market check links 2 sec.)*

---

### 4. Scoped waiver `[~25 sec]`

**CLICK:** amber **Counter $39… scoped waiver**  
**EDIT** floor/time if you want → **Grant waiver**

**SAY:**  
*"If I push below my walkaway — thirty-nine, under forty — DealTable doesn’t quietly accept. It opens a scoped waiver: I set the lowest floor I’ll allow and how long that authority lasts, then grant or reject. Agents ask; humans shape the boundary."*

---

### 5. Close `[~20 sec]`

**CLICK:** Accept Offer → approve if asked → Summary / handoff

**SAY:**  
*"When we’re aligned, Accept closes the deal. You get a summary, next-step handoffs, and an audit trail — practice that becomes paperwork for the real conversation. That’s DealTable."*

---

### 6. Advisor Insights? — optional 8 sec, or skip

**Nebius judges care most about:** Nemotron + Tavily + waiver. Advisor is nice, not required.

**If you have time** (after step 3, before waiver):

**CLICK:** left nav **Advisor Insights** (brief) → back to Hub

**SAY:**  
*"Advisor Insights is your side’s read — leverage, tone, and win-win trades — updating as the deal moves. Optional coach, not the other party."*

If the cut is already long, **skip Advisor** entirely.

---

## ChatGPT / WebMCP — skip for this take

ChatGPT saying it can’t see `get_deal_state` / `propose_offer` means WebMCP tools aren’t connected in that chat (needs ChatGPT **in-app browser / Work mode** on the live URL with WebMCP enabled — and even then it’s flaky on video).

For Nebius: **manual Counter in Hub is enough.** Don’t block filming on WebMCP.

---

## Full VO (continuous)

> DealTable is a practice negotiation room. You set a hard floor so agents can’t close a deal past your limits without you. We have nine pre-defined negotiations and you can build your own. Let’s walk a commercial lease.  
>   
> First, the mandate — the rules of the deal. Target is where you want to land: forty-five dollars a square foot. Walkaway is your hard floor: you won’t counter below forty without human approval. Concession is how flexible you’ll be. Their opening ask is fifty-two — we’re negotiating down. No login — the session runs in the browser so you can rehearse instantly.  
>   
> The other side isn’t a canned script. NVIDIA Nemotron on Nebius Token Factory plays the landlord. Under the reply, Market check from Tavily pulls live market sources — so the numbers they lean on come from real comps and articles, not invented rates.  
>   
> If I push below my walkaway, DealTable doesn’t quietly accept. It opens a scoped waiver: I set the floor and how long that authority lasts, then grant or reject. Agents ask; humans shape the boundary.  
>   
> When we’re aligned, Accept closes the deal. You get a summary, handoffs, and an audit trail — practice that becomes paperwork. That’s DealTable.

---

## Cue card

```
Lease → 45 target / 40 walkaway / Moderate → Start
Counter ~44 → Market check visible — NO fallback
$39 scoped waiver → Grant
Accept → Summary
(optional) Advisor Insights flash
```

---

## Checklist

- [ ] No Rule-engine fallback in the final cut  
- [ ] Market check · Tavily on screen  
- [ ] Waiver grant on camera  
- [ ] Under 3 min, no copyrighted music  
