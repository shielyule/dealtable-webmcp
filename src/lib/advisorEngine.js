/** Derive advisor telemetry from live deal state — no LLM required for demo. */

function formatAmount(deal, value) {
  const n = Number(value)
  if (deal.unit) return `${deal.currency}${n}${deal.unit}`
  return `${deal.currency}${n.toLocaleString()}`
}

function gapPct(deal) {
  const span = deal.currentAsk - deal.targetPrice
  const range = Math.max(deal.currentAsk - deal.walkawayPrice, 1)
  return Math.round(Math.min(100, Math.max(0, (span / range) * 100)))
}

function probabilityLabel(deal) {
  const gap = deal.currentAsk - deal.targetPrice
  const room = deal.currentAsk - deal.walkawayPrice
  const ratio = room <= 0 ? 1 : gap / room
  if (ratio <= 0.25) return 'High'
  if (ratio <= 0.55) return 'Medium'
  if (ratio <= 0.8) return 'Medium-Low'
  return 'Low'
}

function toneFromRigidity(rigidity, gapRatio) {
  if (rigidity >= 0.75 && gapRatio > 0.5) return { tone: 'Adversarial', hint: 'Counterparty is anchoring hard — avoid matching their frame.' }
  if (rigidity >= 0.65) return { tone: 'Guarded', hint: 'Expect slow concessions; trade non-price terms first.' }
  if (gapRatio < 0.35) return { tone: 'Collaborative', hint: 'Counterparty is open to finding mutual value.' }
  return { tone: 'Neutral', hint: 'Room to explore creative structures before price moves.' }
}

function winWinsForScenario(deal) {
  if (deal.scenario === 'lease') {
    return [
      { id: 'ti', title: 'TI Allowance Trade', tag: 'High Value', body: 'Accept modest rent if landlord funds tenant improvements.' },
      { id: 'term', title: 'Shorter Term Premium', tag: 'Low Cost', body: 'Offer 3-year term in exchange for rate closer to target.' },
    ]
  }
  if (deal.scenario === 'freelance') {
    return [
      { id: 'scope', title: 'Scope Phase Split', tag: 'High Value', body: 'Deliver MVP now; defer nice-to-haves to phase two at fixed rate.' },
      { id: 'timeline', title: 'Expedited Timeline Premium', tag: 'Low Cost', body: 'Hold rate if client accepts async check-ins only.' },
    ]
  }
  if (deal.scenario === 'salary') {
    return [
      { id: 'equity', title: 'Equity Top-Up', tag: 'High Value', body: 'Accept lower base if RSU grant bridges to target TC.' },
      { id: 'signing', title: 'Signing Bonus Bridge', tag: 'Low Cost', body: 'One-time signing payment to close the gap this year.' },
    ]
  }
  return [
    { id: 'term', title: 'Term Length Trade', tag: 'High Value', body: 'Extend commitment in exchange for better unit economics.' },
    { id: 'bundle', title: 'Bundle Concession', tag: 'Low Cost', body: 'Trade a low-cost perk for movement on headline price.' },
  ]
}

export function computeAdvisor(deal, persona, messages = []) {
  const rigidity = persona?.rigidity ?? deal.rigidity ?? 0.7
  const gap = deal.currentAsk - deal.targetPrice
  const room = Math.max(deal.currentAsk - deal.walkawayPrice, 1)
  const gapRatio = gap / room
  const leverage = Math.round(Math.min(92, Math.max(28, 72 - gapPct(deal) * 0.45 + (1 - rigidity) * 18)))
  const { tone, hint: toneHint } = toneFromRigidity(rigidity, gapRatio)

  const concessionRemaining = Math.round(Math.max(0, gap * (1 - deal.concessionPct)))
  const hardLimit = Math.round(deal.concessionPct * deal.targetPrice || deal.targetPrice * 0.12)

  let termAlert = null
  if (deal.maxTermYears && deal.termYears > deal.maxTermYears) {
    termAlert = `A ${deal.termYears}-year term violates the predefined mandate (Max ${deal.maxTermYears} years). Recommend a counter on non-price terms instead of term length.`
  } else if (gap > 0 && rigidity >= 0.7) {
    termAlert = 'Counterparty is using term length or urgency as a pressure lever. Check mandate before conceding on duration.'
  }

  const position =
    gap <= 0
      ? `Current ask ${formatAmount(deal, deal.currentAsk)} is at or below your target ${formatAmount(deal, deal.targetPrice)}. Focus on closing cleanly.`
      : `Counter-party is ${formatAmount(deal, gap)} above target, anchoring at ${formatAmount(deal, deal.currentAsk)} while you hold ${formatAmount(deal, deal.targetPrice)}.`

  const lastCounterparty = [...messages].reverse().find((m) => m.from === 'counterparty')
  const motivator =
    lastCounterparty?.text?.toLowerCase().includes('week') || lastCounterparty?.text?.toLowerCase().includes('friday')
      ? { label: 'Time-to-Close', detail: "Counterparty mentioned urgency or a deadline." }
      : { label: 'Price Anchor', detail: 'Latest move centered on headline number.' }

  const suggestedMove =
    gap <= 0
      ? `We're aligned on economics at ${formatAmount(deal, deal.currentAsk)}. Can we confirm standard terms and close this week?`
      : `I understand the constraints. We can move toward ${formatAmount(deal, Math.round(deal.targetPrice + gap * 0.35))} if we lock standard terms and avoid extending beyond ${deal.maxTermYears} years.`

  const offTrack =
    (tone === 'Adversarial' || tone === 'Guarded') && leverage < 40
      ? 'Negotiation may be off-mandate. Consider reviewing your Negotiation Parameters or starting a new scenario from Home.'
      : null

  return {
    leverage,
    tone,
    toneHint,
    probability: probabilityLabel(deal),
    position,
    termAlert,
    motivator,
    concessionRemaining,
    hardLimit,
    winWins: winWinsForScenario(deal),
    suggestedMove,
    offTrack,
  }
}
