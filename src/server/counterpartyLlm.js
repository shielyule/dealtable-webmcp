import { searchMarket } from './marketSearch.js'
import { formatMoney as formatAmount, withGroupedCurrencyAmounts } from '../lib/formatMoney.js'

export const NEMOTRON_MODEL = 'nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B'
export const TOKEN_FACTORY_BASE = 'https://api.tokenfactory.nebius.com/v1'

const META_LEAK =
  /\b(we need to respond|must return json|must be 1-3|system prompt|stay in character|pushing back, negotiating|no currency symbols|as an ai|output contract)\b/i

function buildSystemPrompt(persona, deal, sources) {
  const behaviors = (persona.behaviors || []).map((b) => `- ${b}`).join('\n') || '- Stay firm but professional.'
  const sourceBlock =
    sources.length > 0
      ? sources
          .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\nSnippet: ${s.content}`)
          .join('\n\n')
      : 'No live market sources available. Do not invent market figures or cite comps.'

  return `You are ${persona.agentName || 'Counterparty Agent'} (${persona.org || persona.name || 'the other side'}).
Speak only as that counterparty in the negotiation. Never narrate instructions, rules, or JSON format.

Role: ${persona.who || 'Negotiate in character for your side.'}
Behaviors:
${behaviors}

Your previous ask was ${
    deal.priorAsk != null ? formatAmount(deal, deal.priorAsk) : formatAmount(deal, deal.currentAsk)
  }${deal.termYears ? ` on a ${deal.termYears}-year term` : ''}.
Currency ${deal.currency || '$'}${deal.unit ? `, unit ${deal.unit}` : ''}.
Deal side: ${
    deal.side === 'seller'
      ? 'The principal is claiming / earning money. You are the payer — prefer lower numbers. Do NOT accept a higher counter just because it is above your current ask; only accept if they come down to your ask or below, otherwise counter partway.'
      : 'The principal is paying you. Prefer higher numbers. Accept when they meet or exceed your current ask.'
  }.

Market evidence (cite a number only if it appears below):
${sourceBlock}

Output contract: one JSON object only, no markdown, no preamble.
{"text":"<1-3 short in-character sentences>","proposedPrice":<number>}
proposedPrice is your next ask as a plain number (no currency symbols, no commas).
In text, always write money with thousand separators (e.g. £2,800 not £2800).`
}

function buildUserPrompt(input) {
  const lines = (input.messages || [])
    .slice(-10)
    .map((m) => `${m.author || m.from}: ${m.text}`)
    .join('\n')

  if (input.kind === 'hold') {
    return `Transcript:\n${lines}\n\nThe principal is holding firm. Give your counter as JSON.`
  }
  if (input.kind === 'instruction') {
    return `Transcript:\n${lines}\n\nLatest principal message: ${input.instruction}\nGive your counter as JSON.`
  }
  return `Transcript:\n${lines}\n\nThe principal offered ${formatAmount(input.deal, input.price)}${
    input.termYears ? ` / ${input.termYears}yr` : ''
  }${input.note ? ` — note: ${input.note}` : ''}.
Give your counter as JSON.`
}

function contentFromParts(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (part?.type === 'text') return part.text || ''
      return ''
    })
    .join('')
}

function stripReasoning(raw) {
  return String(raw || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim()
}

function looksLikeDialogue(text) {
  if (!text || text.length < 4) return false
  if (META_LEAK.test(text)) return false
  if (/^\s*\{/.test(text)) return false
  return true
}

function tryParseJsonObject(candidate) {
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  const slice = candidate.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    // Trailing commas / smart quotes — light repair
    try {
      return JSON.parse(
        slice
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/,\s*([}\]])/g, '$1'),
      )
    } catch {
      return null
    }
  }
}

function coercePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  const n = Number(String(value ?? '').replace(/[,$£€\s]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : NaN
}

function parseModelJson(raw) {
  const text = stripReasoning(raw)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced ? fenced[1] : text).trim()
  const parsed = tryParseJsonObject(candidate)
  if (parsed) {
    const replyText = String(parsed.text || parsed.message || parsed.reply || '').trim()
    const proposedPrice = coercePrice(parsed.proposedPrice ?? parsed.price ?? parsed.ask)
    if (looksLikeDialogue(replyText) && Number.isFinite(proposedPrice)) {
      return { text: replyText, proposedPrice }
    }
    // Price OK but text meta-leaked — still salvage a short counter line
    if (Number.isFinite(proposedPrice) && proposedPrice > 0) {
      const cleaned = replyText.replace(META_LEAK, '').trim()
      if (cleaned.length >= 8 && !META_LEAK.test(cleaned)) {
        return { text: cleaned, proposedPrice }
      }
      return {
        text: `Our best path is ${proposedPrice}.`,
        proposedPrice,
      }
    }
  }

  const priceMatch =
    text.match(/"proposedPrice"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i) ||
    text.match(/proposedPrice\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i) ||
    text.match(/"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)
  const textMatch = text.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/i)
  const proposedPrice = priceMatch ? coercePrice(priceMatch[1]) : NaN
  if (textMatch && Number.isFinite(proposedPrice)) {
    try {
      const replyText = JSON.parse(`"${textMatch[1]}"`)
      if (looksLikeDialogue(replyText)) return { text: replyText, proposedPrice }
      if (Number.isFinite(proposedPrice)) {
        return { text: `Our best path is ${proposedPrice}.`, proposedPrice }
      }
    } catch {
      /* fall through */
    }
  }

  throw new Error('Model did not return usable dialogue JSON')
}

async function callNemotron({ system, user, apiKey }) {
  const res = await fetch(`${TOKEN_FACTORY_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: NEMOTRON_MODEL,
      temperature: 0.15,
      max_tokens: 500,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: `${user}\n\nReturn ONLY valid JSON (no markdown). Example: {"text":"That is below our corridor comps. Best we can do is 50.","proposedPrice":50}`,
        },
      ],
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = data?.error?.message || data?.message || `Token Factory ${res.status}`
    throw new Error(detail)
  }

  const message = data?.choices?.[0]?.message || {}
  const primary = stripReasoning(contentFromParts(message.content))
  const reasoning = typeof message.reasoning === 'string' ? message.reasoning : ''
  const attempts = [primary, reasoning, `${primary}\n${reasoning}`].filter((s) => String(s || '').trim())
  let lastErr
  for (const attempt of attempts) {
    try {
      return parseModelJson(attempt)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr || new Error('Model did not return usable dialogue JSON')
}

export async function generateCounterpartyReply(input, { nebiusKey, tavilyKey }) {
  const deal = input.deal || {}
  const persona = input.persona || {}
  const author = persona.agentName || 'Counterparty Agent'

  if (!nebiusKey) {
    return {
      status: 503,
      error: 'Nebius Token Factory is not configured',
      author,
      sources: [],
      fallback: true,
    }
  }

  const market = await searchMarket(
    { scenario: deal.scenario, title: deal.title },
    tavilyKey,
  )
  const sources = market.sources || []
  const marketError = market.error || null

  try {
    const parsed = await callNemotron({
      apiKey: nebiusKey,
      system: buildSystemPrompt(persona, deal, sources),
      user: buildUserPrompt({ ...input, deal }),
    })

    return {
      author,
      text: withGroupedCurrencyAmounts(parsed.text, deal.currency || '£'),
      proposedPrice: parsed.proposedPrice,
      sources,
      query: market.query,
      marketError,
      model: NEMOTRON_MODEL,
      fallback: false,
    }
  } catch (err) {
    return {
      status: 502,
      error: err.message || 'Nemotron call failed',
      author,
      sources,
      query: market.query,
      marketError,
      model: NEMOTRON_MODEL,
      fallback: true,
    }
  }
}
