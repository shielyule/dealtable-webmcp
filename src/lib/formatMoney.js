/** Always use en-GB so thousands keep commas in browser and Node. */
export function formatNumber(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value ?? '')
  return n.toLocaleString('en-GB')
}

export function formatMoney(deal, value) {
  const amount = formatNumber(value)
  const currency = deal?.currency ?? ''
  const unit = deal?.unit || ''
  return `${currency}${amount}${unit}`
}

/** Rewrite bare currency amounts in free text (e.g. LLM replies) with commas. */
export function withGroupedCurrencyAmounts(text, currency = '£') {
  if (!text || !currency) return text
  const escaped = currency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Prefer already-grouped amounts, else take the full digit run (not just first 1–3 digits).
  const re = new RegExp(`${escaped}(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d+))?`, 'g')
  return String(text).replace(re, (_, intPart, frac) => {
    const digits = String(intPart).replace(/,/g, '')
    const formatted = formatNumber(digits)
    return frac != null ? `${currency}${formatted}.${frac}` : `${currency}${formatted}`
  })
}
