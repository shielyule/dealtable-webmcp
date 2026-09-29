/**
 * Session-only negotiation store.
 * Flow: entrance → setup → hub (+ advisor / audit).
 */

import { computeAdvisor } from './advisorEngine.js'
import { buildClosure, counterpartyReply, replyToInstruction, seedOpeningMessages } from './counterpartyEngine.js'
import { formatMoney, withGroupedCurrencyAmounts } from './formatMoney.js'
import { extractOfferFields } from './offerParser.js'
import { getPersona, getScenario, scenarioToDeal, SCENARIOS } from './scenarios.js'

export { SCENARIOS, PERSONAS, getScenario, getPersona } from './scenarios.js'

const listeners = new Set()

function nowStamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

function audit(type, title, detail, extra = {}) {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    detail,
    timestamp: nowStamp(),
    sessionId: extra.sessionId,
    agent: extra.agent,
    trigger: extra.trigger,
    json: extra.json,
    previous: extra.previous,
    next: extra.next,
  }
}

function initialState() {
  return {
    route: 'entrance',
    status: 'idle',
    scenarioId: null,
    customScenario: null,
    personaId: null,
    advisorEnabled: true,
    primaryGoal: '',
    openingOfferText: '',
    openingFileName: null,
    extractionPreview: null,
    personaBehaviors: null,
    closure: null,
    hitlOpen: null,
    webmcpReady: false,
    liveTools: [
      { id: 'comps', label: '@ market comps via Tavily', status: 'idle' },
      { id: 'sentiment', label: '@ analyzing sentiment...', status: 'done' },
    ],
    market: null,
    deal: null,
    messages: [],
    advisor: computeAdvisor(scenarioToDeal(getScenario('lease')), getPersona('aggressive_landlord')),
    audit: [],
  }
}

let state = initialState()

function emit() {
  for (const fn of listeners) fn(state)
}

function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : { ...state, ...updater }
  state = next
  emit()
}

function activePersona() {
  let p = getPersona('aggressive_landlord')
  if (state.personaId) p = getPersona(state.personaId)
  else if (state.scenarioId && state.scenarioId !== 'custom') p = getPersona(getScenario(state.scenarioId).personaId)
  if (state.personaBehaviors?.length) {
    return { ...p, guide: { ...p.guide, behaviors: state.personaBehaviors } }
  }
  return p
}

function withAdvisor(patch) {
  const deal = patch.deal ?? state.deal
  if (!deal) return patch
  return {
    ...patch,
    advisor: computeAdvisor(deal, activePersona(), patch.messages ?? state.messages),
  }
}

export function getState() {
  return state
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetSession() {
  state = initialState()
  emit()
}

export function goHome() {
  resetSession()
}

export function selectScenario(scenarioId) {
  const scenario = getScenario(scenarioId)
  const deal = scenarioToDeal(scenario)
  deal.contextLine = scenario.contextLine
  setState(
    withAdvisor({
      route: 'setup',
      status: 'setup',
      scenarioId,
      customScenario: null,
      personaId: scenario.personaId,
      primaryGoal: scenario.primaryGoal,
      openingOfferText: scenario.openingOffer,
      openingFileName: null,
      deal,
      messages: [],
      audit: [],
    }),
  )
}

export function startCustomScenario({ title, counterparty, targetPrice, walkawayPrice, openingOffer, templateId }) {
  const template = getScenario(templateId || 'freelance')
  const deal = {
    scenario: 'custom',
    title: title || template.title,
    sessionId: `CUS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    unit: template.unit,
    currency: template.currency,
    side: template.side || 'buyer',
    targetPrice: Number(targetPrice) || template.targetPrice,
    walkawayPrice: Number(walkawayPrice) || template.walkawayPrice,
    currentAsk: Number(targetPrice) ? Math.round(Number(targetPrice) * 1.12) : template.currentAsk,
    termYears: template.termYears,
    maxTermYears: template.maxTermYears,
    concessionPct: template.concessionPct,
    rigidity: template.rigidity,
    contextLine: 'Custom scenario initialized. Advisor and counterparty agents connected.',
  }
  setState(
    withAdvisor({
      route: 'setup',
      status: 'setup',
      scenarioId: 'custom',
      customScenario: { title, counterparty, templateId: templateId || 'freelance' },
      personaId: template.personaId,
      primaryGoal: template.primaryGoal,
      openingOfferText: openingOffer || template.openingOffer,
      personaBehaviors: null,
      deal,
      messages: [],
      audit: [],
    }),
  )
}

export function setPersonaBehaviors(behaviors) {
  setState({ personaBehaviors: behaviors })
}

export function addPersonaBehavior(text) {
  const t = text?.trim()
  if (!t) return
  const base = state.personaBehaviors ?? activePersona().guide?.behaviors ?? []
  setState({ personaBehaviors: [...base, t] })
}

export function removePersonaBehavior(index) {
  const base = state.personaBehaviors ?? activePersona().guide?.behaviors ?? []
  setState({ personaBehaviors: base.filter((_, i) => i !== index) })
}

export function extractOpeningOffer(text) {
  const deal = state.deal
  if (!deal) return { ok: false, error: 'No scenario loaded.' }

  const result = extractOfferFields(text ?? state.openingOfferText, {
    currency: deal.currency,
    unit: deal.unit,
    scenarioDefaults: deal,
  })

  if (!result.ok) return result

  setState((s) => ({
    ...s,
    extractionPreview: result,
    audit: [
      ...s.audit,
      audit('TOOL_CALL', 'parse_opening_offer', result.summary, {
        agent: 'Advisor',
        json: { confidence: result.confidence, notes: result.notes, extracted: result.extracted },
      }),
    ],
  }))

  return result
}

export function applyExtraction() {
  const preview = state.extractionPreview
  if (!preview?.extracted) return { ok: false, error: 'Nothing to apply.' }

  const { currentAsk, targetPrice, walkawayPrice, termYears, openingOfferText } = preview.extracted
  setState((s) =>
    withAdvisor({
      ...s,
      openingOfferText: openingOfferText ?? s.openingOfferText,
      extractionPreview: null,
      deal: {
        ...s.deal,
        currentAsk,
        targetPrice,
        walkawayPrice,
        termYears: termYears ?? s.deal.termYears,
      },
      audit: [
        ...s.audit,
        audit('STATE_MUTATION', 'Applied parsed offer', 'Mandate updated from document extraction.', {
          trigger: 'Advisor',
          next: { currentAsk, targetPrice, walkawayPrice },
        }),
      ],
    }),
  )
  return { ok: true, extracted: preview.extracted }
}

export function clearExtraction() {
  setState({ extractionPreview: null })
}

export function updateSetup({
  targetPrice,
  walkawayPrice,
  concessionPct,
  advisorEnabled,
  primaryGoal,
  openingOfferText,
  openingFileName,
  currentAsk,
}) {
  setState((s) =>
    withAdvisor({
      ...s,
      advisorEnabled: advisorEnabled ?? s.advisorEnabled,
      primaryGoal: primaryGoal ?? s.primaryGoal,
      openingOfferText: openingOfferText ?? s.openingOfferText,
      openingFileName: openingFileName ?? s.openingFileName,
      deal: {
        ...s.deal,
        targetPrice: targetPrice ?? s.deal?.targetPrice,
        walkawayPrice: walkawayPrice ?? s.deal?.walkawayPrice,
        concessionPct: concessionPct ?? s.deal?.concessionPct,
        currentAsk: currentAsk ?? s.deal?.currentAsk,
      },
    }),
  )
}

export function startNegotiation() {
  const persona = activePersona()
  const deal = { ...state.deal }
  const messages = seedOpeningMessages(deal, persona, state.openingOfferText)

  if (state.openingFileName) {
    messages.push({
      id: crypto.randomUUID(),
      from: 'system',
      kind: 'tool',
      text: `Loaded attachment: ${state.openingFileName}`,
      time: nowStamp(),
    })
  }

  setState((s) =>
    withAdvisor({
      ...s,
      route: 'hub',
      status: 'active',
      messages,
      audit: [
        audit('SYSTEM_INIT', 'Negotiation Engine Boot', 'Multi-agent session initialized.', {
          sessionId: deal.sessionId,
          json: {
            session: deal.sessionId,
            scenario: deal.scenario,
            target: deal.targetPrice,
            walkaway: deal.walkawayPrice,
            concession: deal.concessionPct,
          },
        }),
        audit('TOOL_CALL', 'load_opening_context', 'Principal supplied opening terms.', {
          agent: 'Principal',
          json: { opening: state.openingOfferText?.slice(0, 240), file: state.openingFileName },
        }),
        audit('STATE_MUTATION', 'Mandate loaded', 'Target thresholds applied to live session.', {
          trigger: 'Setup',
          previous: { target: null, walkaway: null },
          next: { target: deal.targetPrice, walkaway: deal.walkawayPrice },
        }),
      ],
    }),
  )
  loadMarket()
}

export function setRoute(route) {
  setState({ route })
}

let marketRequest = 0

function loadMarket() {
  const deal = state.deal
  if (!deal) return
  const requestId = ++marketRequest
  setState((s) => ({
    ...s,
    market: { status: 'loading', query: '', sources: [], error: null },
    liveTools: s.liveTools.map((tool) =>
      tool.id === 'comps' ? { ...tool, status: 'running', label: '@ querying market comps via Tavily...' } : tool,
    ),
  }))

  fetch('/api/market', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario: deal.scenario,
      title: deal.title,
    }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, data }
    })
    .then(({ ok, data }) => {
      if (requestId !== marketRequest) return
      const sources = Array.isArray(data.sources) ? data.sources : []
      const error = ok ? null : data.error || 'Market search failed'
      setState((s) =>
        withAdvisor({
          ...s,
          market: {
            status: error ? 'error' : 'ready',
            query: data.query || '',
            sources,
            error,
          },
          liveTools: s.liveTools.map((tool) =>
            tool.id === 'comps'
              ? {
                  ...tool,
                  status: error ? 'error' : 'done',
                  label: error
                    ? '@ market comps unavailable'
                    : `@ market comps via Tavily (${sources.length} sources)`,
                }
              : tool,
          ),
          audit: [
            ...s.audit,
            audit(
              error ? 'WARNING' : 'TOOL_CALL',
              'tavily_search',
              error || data.query || 'Market comps loaded',
              {
                agent: 'Tavily',
                json: {
                  query: data.query || null,
                  sources: sources.map((source) => ({ title: source.title, url: source.url })),
                  error,
                },
              },
            ),
          ],
        }),
      )
    })
    .catch(() => {
      if (requestId !== marketRequest) return
      setState((s) => ({
        ...s,
        market: { status: 'error', query: '', sources: [], error: 'Market search failed' },
        liveTools: s.liveTools.map((tool) =>
          tool.id === 'comps' ? { ...tool, status: 'error', label: '@ market comps unavailable' } : tool,
        ),
      }))
    })
}

function appendCounterparty(reply, extras = {}) {
  const proposedPrice = Number(extras.proposedPrice)
  const hasPrice = Number.isFinite(proposedPrice) && proposedPrice > 0
  const currency = state.deal?.currency || '£'
  const text = withGroupedCurrencyAmounts(reply.text, currency)
  setState((s) =>
    withAdvisor({
      ...s,
      deal: hasPrice && s.deal ? { ...s.deal, currentAsk: proposedPrice } : s.deal,
      messages: [
        ...s.messages.filter((m) => !m.processing),
        {
          id: crypto.randomUUID(),
          from: 'counterparty',
          author: reply.author,
          text,
          time: nowStamp(),
          sources: extras.sources || undefined,
          model: extras.model || undefined,
          fallback: Boolean(extras.fallback),
        },
      ],
      market:
        extras.sources || extras.query || extras.marketError
          ? {
              status: extras.marketError && !(extras.sources || []).length ? 'error' : 'ready',
              query: extras.query || s.market?.query || '',
              sources: extras.sources || s.market?.sources || [],
              error: extras.marketError || null,
            }
          : s.market,
      audit: [
        ...s.audit,
        audit('STATE_MUTATION', 'Counterparty response', text.slice(0, 120), {
          trigger: reply.author,
          json: {
            model: extras.model || null,
            proposedPrice: hasPrice ? proposedPrice : null,
            fallback: Boolean(extras.fallback),
            sources: (extras.sources || []).map((source) => ({ title: source.title, url: source.url })),
          },
        }),
      ],
    }),
  )
}

function buildCounterpartyPayload(kind, fields = {}) {
  const persona = activePersona()
  const deal = state.deal
  return {
    kind,
    price: fields.price,
    termYears: fields.termYears,
    note: fields.note,
    instruction: fields.instruction,
    deal: {
      scenario: deal.scenario,
      title: deal.title,
      currency: deal.currency,
      unit: deal.unit,
      side: deal.side || 'buyer',
      currentAsk: deal.currentAsk,
      priorAsk: fields.priorAsk ?? deal.currentAsk,
      termYears: deal.termYears,
      maxTermYears: deal.maxTermYears,
    },
    persona: {
      agentName: persona.agentName,
      org: persona.org,
      name: persona.name,
      rigidity: persona.rigidity,
      behaviors: persona.guide?.behaviors || [],
      who: persona.guide?.who || '',
    },
    messages: state.messages
      .filter((m) => !m.processing && m.from !== 'system')
      .slice(-12)
      .map(({ from, author, text }) => ({ from, author, text })),
  }
}

function fallbackReply(kind, fields = {}) {
  const persona = activePersona()
  const deal = state.deal
  if (kind === 'instruction') return replyToInstruction(deal, persona, fields.instruction || '')
  return counterpartyReply(deal, persona, {
    price: fields.price ?? deal.currentAsk,
    termYears: fields.termYears,
    note: fields.note,
    kind: kind === 'hold' ? 'hold' : 'offer',
  })
}

function requestCounterpartyTurn(kind, fields = {}) {
  const persona = activePersona()
  const author = persona.agentName || 'Counterparty Agent'
  setState((s) => ({
    ...s,
    messages: [
      ...s.messages.filter((m) => !m.processing),
      {
        id: crypto.randomUUID(),
        from: 'counterparty',
        author,
        text: 'Nemotron is drafting a reply…',
        time: nowStamp(),
        processing: true,
      },
    ],
  }))

  fetch('/api/counterparty', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildCounterpartyPayload(kind, fields)),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}))
      return { ok: res.ok, data }
    })
    .then(({ ok, data }) => {
      if (ok && data?.text && !data.fallback) {
        appendCounterparty(
          { author: data.author || author, text: data.text },
          {
            proposedPrice: data.proposedPrice,
            sources: data.sources,
            query: data.query,
            marketError: data.marketError,
            model: data.model,
            fallback: false,
          },
        )
        return
      }
      const reply = fallbackReply(kind, fields)
      appendCounterparty(reply, {
        proposedPrice: reply.proposedPrice,
        sources: data?.sources,
        query: data?.query,
        marketError: data?.error || data?.marketError || 'Nemotron unavailable — used rule engine',
        model: data?.model,
        fallback: true,
      })
    })
    .catch(() => {
      const reply = fallbackReply(kind, fields)
      appendCounterparty(reply, {
        proposedPrice: reply.proposedPrice,
        marketError: 'Nemotron unavailable — used rule engine',
        fallback: true,
      })
    })
}

export function sendInstruction(text) {
  const trimmed = text.trim()
  if (!trimmed || state.status === 'accepted') return

  setState((s) => ({
    ...s,
    messages: [
      ...s.messages,
      { id: crypto.randomUUID(), from: 'principal', author: 'You', text: trimmed, time: nowStamp() },
    ],
    audit: [...s.audit, audit('TOOL_CALL', 'instruct_principal_agent', trimmed, { agent: 'Principal' })],
  }))

  requestCounterpartyTurn('instruction', { instruction: trimmed })
}

export function proposeWinWinTerm(term) {
  sendInstruction(`I'd like to propose: ${term.title} — ${term.body}`)
}

function crossesWalkaway(price) {
  const deal = state.deal
  const n = Number(price)
  // Seller (claim/salary): walkaway is your floor — going below needs approval.
  // Buyer (lease etc.): walkaway is your ceiling — going below needs approval (same numeric test).
  return n < Number(deal.walkawayPrice)
}

function formatOfferLine(deal, price, termYears) {
  const amount = formatMoney(deal, price)
  return termYears ? `${amount} / ${termYears}yr` : amount
}

function applyOffer(price, termYears, note) {
  const nextPrice = Number(price)
  if (Number.isNaN(nextPrice)) {
    return { ok: false, error: 'Invalid offer price.' }
  }
  const previous = { currentAsk: state.deal.currentAsk, termYears: state.deal.termYears }
  const deal = {
    ...state.deal,
    // Keep Current Ask as the counterparty's number until they reply.
    termYears: termYears ?? state.deal.termYears,
  }
  const offerLine = formatOfferLine(deal, nextPrice, termYears ?? deal.termYears)
  const text = note?.trim()
    ? `You countered at ${offerLine}. ${note.trim()}`
    : `You countered at ${offerLine}.`

  setState((s) =>
    withAdvisor({
      ...s,
      hitlOpen: null,
      deal,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          from: 'principal',
          author: 'You',
          text,
          time: nowStamp(),
        },
      ],
      audit: [
        ...s.audit,
        audit('STATE_MUTATION', 'Offer applied', 'You updated the live counter.', {
          trigger: 'You',
          previous,
          next: { offered: nextPrice, termYears: termYears ?? deal.termYears },
        }),
      ],
    }),
  )

  requestCounterpartyTurn('offer', {
    price: nextPrice,
    termYears,
    note,
    priorAsk: previous.currentAsk,
  })
}

export function proposeOffer({ price, termYears, note }) {
  const nextPrice = Number(price)
  if (Number.isNaN(nextPrice)) return { ok: false, error: 'Price must be a number.' }
  if (crossesWalkaway(nextPrice)) {
    const deal = state.deal
    const offerLine = formatOfferLine(deal, nextPrice, termYears ?? deal.termYears)
    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          from: 'principal',
          author: 'You',
          text: `You proposed ${offerLine} — below walkaway ${formatOfferLine(deal, deal.walkawayPrice)}. Waiting for your approval.`,
          time: nowStamp(),
        },
      ],
    }))
    return {
      ok: false,
      needsHitl: true,
      reason: `Offer ${formatMoney(deal, nextPrice)} is below walkaway ${formatMoney(deal, deal.walkawayPrice)}.`,
      pending: { kind: 'propose', price: nextPrice, termYears, note },
    }
  }
  applyOffer(nextPrice, termYears, note)
  return { ok: true, state: snapshot() }
}

export function concede(args) {
  return proposeOffer(args)
}

export function acceptTerm({ label, summary }) {
  const persona = activePersona()
  const closure = buildClosure(state.deal, persona, { label, summary })
  setState((s) => ({
    ...s,
    status: 'accepted',
    route: 'summary',
    closure,
    messages: [
      ...s.messages,
      { id: crypto.randomUUID(), from: 'system', text: summary || `Accepted: ${label}`, time: nowStamp() },
    ],
    audit: [...s.audit, audit('STATE_MUTATION', 'Term accepted', summary || label, { trigger: 'Principal' })],
  }))
  return { ok: true, state: snapshot() }
}

export function exportTranscript() {
  const lines = state.messages.map((m) => `[${m.time}] ${m.author || m.from}: ${m.text}`)
  return lines.join('\n')
}

export function holdFirm() {
  const deal = state.deal
  const holdLine = formatOfferLine(deal, deal.targetPrice, deal.termYears)
  setState((s) => ({
    ...s,
    messages: [
      ...s.messages,
      {
        id: crypto.randomUUID(),
        from: 'principal',
        author: 'You',
        text: `You are holding firm at your target ${holdLine}.`,
        time: nowStamp(),
      },
    ],
    audit: [...s.audit, audit('TOOL_CALL', 'hold_firm', 'You refused the latest concession.', { agent: 'You' })],
  }))
  requestCounterpartyTurn('hold', { price: deal.targetPrice, priorAsk: deal.currentAsk })
  return { ok: true, state: snapshot() }
}

export function openHitl(payload) {
  const pending = payload.pending ?? payload
  const reason =
    payload.reason ??
    pending.reason ??
    'This action requires your explicit approval.'
  setState({
    hitlOpen: { title: 'Mandate breach — approval required', body: reason, pending },
  })
}

function unwrapHitlPending(raw) {
  if (!raw) return null
  if (raw.pending && (raw.needsHitl || raw.kind === undefined)) {
    return raw.pending
  }
  return raw
}

export function resolveHitl(approved) {
  const pending = unwrapHitlPending(state.hitlOpen?.pending)
  if (!pending) {
    setState({ hitlOpen: null })
    return { ok: false, error: 'No pending approval.' }
  }
  if (!approved) {
    setState((s) => ({
      ...s,
      hitlOpen: null,
      audit: [
        ...s.audit,
        audit('WARNING', 'HITL rejected', 'Human principal blocked the pending action.', { trigger: 'RuleEngine' }),
      ],
    }))
    return { ok: false, cancelled: true }
  }
  if (pending.kind === 'accept') {
    setState({ hitlOpen: null })
    return acceptTerm({ label: pending.label, summary: pending.note })
  }
  applyOffer(pending.price, pending.termYears, pending.note)
  return { ok: true, override: true, state: snapshot() }
}

export function snapshot() {
  const s = state
  const persona = activePersona()
  return {
    route: s.route,
    status: s.status,
    scenarioId: s.scenarioId,
    sessionId: s.deal?.sessionId,
    title: s.deal?.title,
    persona: persona?.name,
    advisorEnabled: s.advisorEnabled,
    mandate: s.deal
      ? {
          targetPrice: s.deal.targetPrice,
          walkawayPrice: s.deal.walkawayPrice,
          concessionPct: s.deal.concessionPct,
          maxTermYears: s.deal.maxTermYears,
          primaryGoal: s.primaryGoal,
        }
      : null,
    live: s.deal
      ? { currentAsk: s.deal.currentAsk, termYears: s.deal.termYears, unit: s.deal.unit }
      : null,
    lastMessages: s.messages.slice(-6).map(({ from, author, text }) => ({ from, author, text })),
    advisor: {
      leverage: s.advisor.leverage,
      tone: s.advisor.tone,
      probability: s.advisor.probability,
      winWins: s.advisor.winWins.map((w) => w.title),
    },
  }
}

export function exportAudit() {
  return JSON.stringify({ exportedAt: new Date().toISOString(), snapshot: snapshot(), audit: state.audit }, null, 2)
}

export function setWebmcpReady(ready) {
  setState({ webmcpReady: Boolean(ready) })
}
