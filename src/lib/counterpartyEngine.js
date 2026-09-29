/** Rule-based counterparty replies — deterministic fallback when Nemotron is unavailable. */

import { formatMoney as formatAmount } from './formatMoney.js'

/** buyer = you pay (want lower). seller = you receive (want higher). */
function isSeller(deal) {
  return deal?.side === 'seller'
}

function stepSize(deal, rigidity) {
  const span = Math.abs(deal.currentAsk - deal.targetPrice)
  return Math.max(1, Math.round(span * (0.15 + rigidity * 0.1)))
}

/**
 * Always returns { author, text, proposedPrice } so Current Ask stays in sync with the chat.
 */
export function counterpartyReply(deal, persona, { price, termYears, note, kind = 'offer' }) {
  const rigidity = persona?.rigidity ?? deal.rigidity ?? 0.7
  const author = persona?.agentName ?? 'Counterparty Agent'
  const offer = Number(price)
  const step = stepSize(deal, rigidity)
  const termBit = termYears ? ` on a ${termYears}-year term` : ''

  if (kind === 'hold') {
    return {
      author,
      text: `We can't hold at ${formatAmount(deal, deal.targetPrice)} given market conditions. Our best path is ${formatAmount(deal, deal.currentAsk)}.`,
      proposedPrice: deal.currentAsk,
    }
  }

  if (isSeller(deal)) {
    // You are claiming / earning; counterparty is paying. They push numbers down.
    if (offer <= deal.currentAsk) {
      return {
        author,
        text: `Accepted in principle at ${formatAmount(deal, offer)}${termBit}. We'll circulate paperwork.`,
        proposedPrice: offer,
      }
    }

    // You asked for more than their live ask — move partway, don't auto-accept.
    if (offer <= deal.targetPrice) {
      const counter = Math.round(deal.currentAsk + (offer - deal.currentAsk) * (0.35 + (1 - rigidity) * 0.25))
      return {
        author,
        text: `We can move toward ${formatAmount(deal, counter)}${termBit}, not all the way to ${formatAmount(deal, offer)}.`,
        proposedPrice: counter,
      }
    }

    if (offer <= deal.walkawayPrice || offer > deal.targetPrice) {
      const counter = Math.round(deal.currentAsk + step * (1 - rigidity * 0.5))
      return {
        author,
        text: `${formatAmount(deal, offer)} is above our authorized band. Best counter: ${formatAmount(deal, counter)}${note ? ` (${note})` : ''}.`,
        proposedPrice: Math.min(counter, offer - step),
      }
    }

    const counter = Math.round(deal.currentAsk + step * 0.4)
    return {
      author,
      text: `That figure is outside our settlement range. Final counter: ${formatAmount(deal, counter)} — take it or we pause talks.`,
      proposedPrice: counter,
    }
  }

  // Buyer side: you pay; counterparty wants a higher ask.
  if (offer >= deal.currentAsk) {
    return {
      author,
      text: `Accepted in principle at ${formatAmount(deal, offer)}${termBit}. We'll circulate paperwork.`,
      proposedPrice: offer,
    }
  }

  if (offer >= deal.targetPrice) {
    const counter = Math.max(deal.targetPrice, Math.round(offer + step * 0.5))
    return {
      author,
      text: `We can meet you partway at ${formatAmount(deal, counter)}${termYears ? ` if term extends to ${Math.min(termYears + 1, deal.maxTermYears + 2)} years` : ''}.`,
      proposedPrice: counter,
    }
  }

  if (offer >= deal.walkawayPrice) {
    const counter = Math.max(deal.walkawayPrice + step, Math.round(deal.currentAsk - step))
    return {
      author,
      text: `${formatAmount(deal, offer)} is below our floor. We could consider ${formatAmount(deal, counter)} with tightened terms${note ? ` (${note})` : ''}.`,
      proposedPrice: counter,
    }
  }

  const counter = Math.round(deal.currentAsk - step * (1 - rigidity))
  return {
    author,
    text: `That offer is outside our authorized band. Final counter: ${formatAmount(deal, counter)} — take it or we pause talks.`,
    proposedPrice: counter,
  }
}

/** Reply to free-text principal messages (chat / Use Prompt / win-win proposals). */
export function replyToInstruction(deal, persona, text) {
  const author = persona?.agentName ?? 'Counterparty Agent'
  const rigidity = persona?.rigidity ?? deal.rigidity ?? 0.7
  const lower = text.toLowerCase()
  const step = stepSize(deal, rigidity)

  if (/accept|agree|deal|done|closed/.test(lower)) {
    return {
      author,
      text: `Noted. If we're aligned at ${formatAmount(deal, deal.currentAsk)}, I'll draft the agreement for signature within 5 business days.`,
      proposedPrice: deal.currentAsk,
    }
  }

  if (/propose|offer|counter|term|ti |allowance|duration|lease|bonus|equity|scope|phase/.test(lower)) {
    const concession = isSeller(deal)
      ? Math.round(deal.currentAsk + step * (rigidity > 0.6 ? 0.35 : 0.55))
      : Math.round(deal.currentAsk - step * (rigidity > 0.6 ? 0.4 : 0.7))
    return {
      author,
      text: `Interesting structure. If we incorporate your proposal, we'd need headline value near ${formatAmount(deal, concession)}. Can you clarify non-price terms?`,
      proposedPrice: concession,
    }
  }

  if (/urgent|friday|week|timeline|asap|quickly/.test(lower)) {
    const expedite = isSeller(deal)
      ? Math.round(deal.currentAsk + step * 0.25)
      : Math.round(deal.currentAsk - step * 0.3)
    return {
      author,
      text: `Timeline noted. We can expedite paperwork if economics settle around ${formatAmount(deal, expedite)} with standard terms.`,
      proposedPrice: expedite,
    }
  }

  if (/firm|hold|cannot|won't|final/.test(lower)) {
    return counterpartyReply(deal, persona, { price: deal.targetPrice, kind: 'hold' })
  }

  const counter = isSeller(deal)
    ? Math.round(deal.currentAsk + step * 0.3)
    : Math.round(deal.currentAsk - step * 0.35)
  return {
    author,
    text: `Understood. Our position remains ${formatAmount(deal, deal.currentAsk)}, though we could discuss ${formatAmount(deal, counter)} if you adjust secondary terms.`,
    proposedPrice: counter,
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
  const fmt = (v) => formatAmount(deal, v)

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
        id: 'draft',
        who: persona?.agentName ?? 'Counterparty',
        action: 'Draft formal agreement reflecting agreed economics and standard terms.',
        deadline: '5 business days',
      },
      {
        id: 'review',
        who: 'You',
        action: 'Review draft, confirm mandate compliance, and sign or request redlines.',
        deadline: '3 business days after receipt',
      },
      {
        id: 'audit',
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
