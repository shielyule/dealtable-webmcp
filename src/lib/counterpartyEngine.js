/** Rule-based counterparty replies — deterministic, no LLM required for demo. */

function formatAmount(deal, value) {
  const n = Number(value)
  if (deal.unit) return `${deal.currency}${n}${deal.unit}`
  return `${deal.currency}${n.toLocaleString()}`
}

export function counterpartyReply(deal, persona, { price, termYears, note, kind = 'offer' }) {
  const rigidity = persona?.rigidity ?? deal.rigidity ?? 0.7
  const author = persona?.agentName ?? 'Counterparty Agent'
  const offer = Number(price)
  const step = Math.max(1, Math.round((deal.currentAsk - deal.targetPrice) * (0.15 + rigidity * 0.1)))

  if (kind === 'hold') {
    return {
      author,
      text: `We can't hold at ${formatAmount(deal, deal.targetPrice)} given market conditions. Our best path is ${formatAmount(deal, deal.currentAsk)}.`,
    }
  }

  if (offer >= deal.currentAsk) {
    return {
      author,
      text: `Accepted in principle at ${formatAmount(deal, offer)}${termYears ? ` on a ${termYears}-year term` : ''}. We'll circulate paperwork.`,
    }
  }

  if (offer >= deal.targetPrice) {
    const counter = Math.max(deal.targetPrice, Math.round(offer + step * 0.5))
    return {
      author,
      text: `We can meet you partway at ${formatAmount(deal, counter)}${termYears ? ` if term extends to ${Math.min(termYears + 1, deal.maxTermYears + 2)} years` : ''}.`,
    }
  }

  if (offer >= deal.walkawayPrice) {
    const counter = Math.max(deal.walkawayPrice + step, Math.round(deal.currentAsk - step))
    return {
      author,
      text: `${formatAmount(deal, offer)} is below our floor. We could consider ${formatAmount(deal, counter)} with tightened terms${note ? ` (${note})` : ''}.`,
    }
  }

  const counter = Math.round(deal.currentAsk - step * (1 - rigidity))
  return {
    author,
    text: `That offer is outside our authorized band. Final counter: ${formatAmount(deal, counter)} — take it or we pause talks.`,
  }
}

/** Reply to free-text principal messages (chat / Use Prompt / win-win proposals). */
export function replyToInstruction(deal, persona, text) {
  const author = persona?.agentName ?? 'Counterparty Agent'
  const rigidity = persona?.rigidity ?? deal.rigidity ?? 0.7
  const lower = text.toLowerCase()
  const step = Math.max(1, Math.round((deal.currentAsk - deal.targetPrice) * (0.12 + rigidity * 0.08)))

  if (/accept|agree|deal|done|closed/.test(lower)) {
    return {
      author,
      text: `Noted. If we're aligned at ${formatAmount(deal, deal.currentAsk)}, I'll draft the agreement for signature within 5 business days.`,
    }
  }

  if (/propose|offer|counter|term|ti |allowance|duration|lease|bonus|equity|scope|phase/.test(lower)) {
    const concession = Math.round(deal.currentAsk - step * (rigidity > 0.6 ? 0.4 : 0.7))
    return {
      author,
      text: `Interesting structure. If we incorporate your proposal, we'd need headline value near ${formatAmount(deal, Math.max(concession, deal.targetPrice))}. Can you clarify non-price terms?`,
    }
  }

  if (/urgent|friday|week|timeline|asap|quickly/.test(lower)) {
    return {
      author,
      text: `Timeline noted. We can expedite paperwork if economics settle around ${formatAmount(deal, Math.round(deal.currentAsk - step * 0.3))} with standard terms.`,
    }
  }

  if (/firm|hold|cannot|won't|final/.test(lower)) {
    return counterpartyReply(deal, persona, { price: deal.targetPrice, kind: 'hold' })
  }

  const counter = Math.round(deal.currentAsk - step * 0.35)
  return {
    author,
    text: `Understood. Our position remains ${formatAmount(deal, deal.currentAsk)}, though we could discuss ${formatAmount(deal, counter)} if you adjust secondary terms.`,
  }
}

export function seedOpeningMessages(deal, persona, openingOfferText) {
  const opening = openingOfferText?.trim() || getDefaultOpening(deal)

  return [
    {
      id: crypto.randomUUID(),
      from: 'system',
      text: deal.contextLine ?? 'Negotiation initialized.',
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    },
    {
      id: crypto.randomUUID(),
      from: 'counterparty',
      author: persona.agentName,
      text: opening,
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    },
  ]
}

function getDefaultOpening(deal) {
  return `Opening at ${formatAmount(deal, deal.currentAsk)}${deal.termYears ? ` on a ${deal.termYears}-year term` : ''}.`
}

export function buildClosure(deal, persona, { label, summary }) {
  const fmt = (v) => (deal.unit ? `${deal.currency}${v}${deal.unit}` : `${deal.currency}${Number(v).toLocaleString()}`)

  return {
    agreedAt: new Date().toISOString(),
    headline: label || summary,
    finalPrice: fmt(deal.currentAsk),
    termYears: deal.termYears,
    targetWas: fmt(deal.targetPrice),
    walkawayWas: fmt(deal.walkawayPrice),
    counterparty: persona?.org ?? persona?.agentName,
    nextSteps: [
      {
        who: persona?.agentName ?? 'Counterparty',
        action: 'Draft formal agreement reflecting agreed economics and standard terms.',
        deadline: '5 business days',
      },
      {
        who: 'You (Principal)',
        action: 'Review draft, confirm mandate compliance, and sign or request redlines.',
        deadline: '3 business days after receipt',
      },
      {
        who: 'Advisor / Audit',
        action: 'Retain exported audit log for compliance and dispute reference.',
        deadline: 'Immediate — export from Summary or Audit Log',
      },
    ],
    summary:
      summary ||
      `Agreement in principle at ${fmt(deal.currentAsk)} for ${deal.title}. Session ${deal.sessionId}.`,
  }
}
