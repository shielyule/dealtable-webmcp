/**
 * Extract negotiation fields from pasted/uploaded offer text.
 * Standalone QA: runs in-browser without an API key.
 * With ChatGPT open on the page, the same logic is exposed via WebMCP `parse_opening_offer`.
 */

function parseAmounts(text) {
  const patterns = [
    /(?:£|\$|€)\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:GBP|USD|EUR)/gi,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:per|\/)\s*(?:sqft|sq ft|month|mo|year|yr)/gi,
  ]
  const found = new Set()
  for (const re of patterns) {
    let m
    const r = new RegExp(re.source, re.flags)
    while ((m = r.exec(text)) !== null) {
      const n = Number(m[1].replace(/,/g, ''))
      if (n > 0 && n < 1e9) found.add(n)
    }
  }
  return [...found].sort((a, b) => a - b)
}

function parseTermYears(text) {
  const yr = text.match(/(\d+)[\s-]*(?:year|yr)/i)
  if (yr) return Number(yr[1])
  const mo = text.match(/(\d+)[\s-]*(?:month|mo)/i)
  if (mo) return Math.max(1, Math.round(Number(mo[1]) / 12))
  return null
}

function parseDeadline(text) {
  if (/friday|by week.?end|this week|month.?end|urgent|asap/i.test(text)) {
    return 'Counterparty mentioned a deadline — possible urgency leverage.'
  }
  return null
}

function detectCurrency(text, fallback = '$') {
  if (/£|GBP/i.test(text)) return '£'
  if (/€|EUR/i.test(text)) return '€'
  if (/\$|USD/i.test(text)) return '$'
  return fallback
}

/**
 * @param {string} text
 * @param {{ currency?: string, unit?: string, scenarioDefaults?: object }} context
 */
export function extractOfferFields(text, context = {}) {
  const trimmed = text?.trim() ?? ''
  if (!trimmed) {
    return { ok: false, error: 'No text to parse.' }
  }

  const amounts = parseAmounts(trimmed)
  const termYears = parseTermYears(trimmed)
  const deadlineNote = parseDeadline(trimmed)
  const currency = detectCurrency(trimmed, context.currency ?? '$')
  const defaults = context.scenarioDefaults ?? {}

  let currentAsk = defaults.currentAsk
  let targetPrice = defaults.targetPrice
  let walkawayPrice = defaults.walkawayPrice
  let confidence = 'low'
  const notes = []

  if (amounts.length >= 1) {
    // Their opening number is usually the largest mentioned anchor in buyer-side negotiations,
    // or the explicit "authorize / offer / approved" figure.
    const offerMatch = trimmed.match(
      /(?:offer|authorize|approved|renewal|tops out at|can pay|propose)[^\d]{0,40}(?:£|\$|€)?\s*([\d,]+(?:\.\d+)?)/i,
    )
    if (offerMatch) {
      currentAsk = Number(offerMatch[1].replace(/,/g, ''))
      notes.push(`Detected their stated offer: ${currency}${currentAsk.toLocaleString()}.`)
      confidence = 'high'
    } else {
      currentAsk = amounts[amounts.length - 1]
      notes.push(`Using largest figure as their anchor: ${currency}${currentAsk.toLocaleString()}.`)
      confidence = amounts.length > 1 ? 'medium' : 'low'
    }

    const seekingMore = defaults.targetPrice > defaults.currentAsk // e.g. insurance claim

    if (seekingMore) {
      targetPrice = Math.max(currentAsk * 1.5, defaults.targetPrice * 0.9)
      walkawayPrice = Math.max(currentAsk * 1.1, defaults.walkawayPrice * 0.85)
      notes.push('Claim-style scenario: suggested target above their offer, walkaway above their opening.')
    } else {
      targetPrice = Math.round(currentAsk * 0.88)
      walkawayPrice = Math.round(currentAsk * 0.78)
      notes.push('Suggested target ~12% below their ask; walkaway ~22% below (adjust to your reality).')
    }
  } else {
    notes.push('No clear amounts found — kept scenario defaults. Edit manually or paste a clearer excerpt.')
  }

  if (termYears) notes.push(`Detected term: ${termYears} year(s).`)
  if (deadlineNote) notes.push(deadlineNote)

  const summary = [
    notes[0],
    amounts.length ? `Found ${amounts.length} numeric value(s) in the document.` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    ok: true,
    confidence,
    summary,
    notes,
    extracted: {
      currentAsk,
      targetPrice,
      walkawayPrice,
      termYears,
      currency,
      openingOfferText: trimmed.slice(0, 1500),
    },
    rawAmounts: amounts,
  }
}
