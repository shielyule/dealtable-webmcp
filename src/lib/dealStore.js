/**
 * Session-only negotiation store.
 * Flow: entrance → setup → hub (+ advisor / audit).
 */

import { computeAdvisor } from './advisorEngine.js'
import { buildClosure, counterpartyReply, replyToInstruction, seedOpeningMessages } from './counterpartyEngine.js'
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
      { id: 'comps', label: '@ querying market_comps...', status: 'running' },
      { id: 'sentiment', label: '@ analyzing sentiment...', status: 'done' },
    ],
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
}

export function setRoute(route) {
  setState({ route })
}

function appendCounterparty(reply) {
  setState((s) =>
    withAdvisor({
      ...s,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          from: 'counterparty',
          author: reply.author,
          text: reply.text,
          time: nowStamp(),
        },
      ],
      audit: [
        ...s.audit,
        audit('STATE_MUTATION', 'Counterparty response', reply.text.slice(0, 120), {
          trigger: reply.author,
        }),
      ],
    }),
  )
}

export function sendInstruction(text) {
  const trimmed = text.trim()
  if (!trimmed || state.status === 'accepted') return
  const persona = activePersona()
  const deal = state.deal

  setState((s) => ({
    ...s,
    messages: [
      ...s.messages,
      { id: crypto.randomUUID(), from: 'principal', author: 'You', text: trimmed, time: nowStamp() },
    ],
    audit: [...s.audit, audit('TOOL_CALL', 'instruct_principal_agent', trimmed, { agent: 'Principal' })],
  }))

  appendCounterparty(replyToInstruction(deal, persona, trimmed))
}

export function proposeWinWinTerm(term) {
  sendInstruction(`I'd like to propose: ${term.title} — ${term.body}`)
}

function crossesWalkaway(price) {
  return Number(price) < Number(state.deal.walkawayPrice)
}

function applyOffer(price, termYears, note) {
  const nextPrice = Number(price)
  if (Number.isNaN(nextPrice)) {
    return { ok: false, error: 'Invalid offer price.' }
  }
  const persona = activePersona()
  const previous = { currentAsk: state.deal.currentAsk, termYears: state.deal.termYears }
  const deal = {
    ...state.deal,
    currentAsk: nextPrice,
    termYears: termYears ?? state.deal.termYears,
  }

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
          author: 'Principal Agent',
          text: note || `Counter at ${deal.currency}${nextPrice}${deal.unit}${termYears ? ` / ${termYears}yr` : ''}.`,
          time: nowStamp(),
        },
      ],
      audit: [
        ...s.audit,
        audit('STATE_MUTATION', 'Offer applied', 'Principal agent updated the live ask.', {
          trigger: 'Principal',
          previous,
          next: { currentAsk: nextPrice, termYears: termYears ?? deal.termYears },
        }),
      ],
    }),
  )

  const reply = counterpartyReply(deal, persona, { price: nextPrice, termYears, note })
  appendCounterparty(reply)
}

export function proposeOffer({ price, termYears, note }) {
  const nextPrice = Number(price)
  if (Number.isNaN(nextPrice)) return { ok: false, error: 'Price must be a number.' }
  if (crossesWalkaway(nextPrice)) {
    return {
      ok: false,
      needsHitl: true,
      reason: `Offer ${state.deal.currency}${nextPrice} is below walkaway ${state.deal.currency}${state.deal.walkawayPrice}.`,
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
  const persona = activePersona()
  const deal = state.deal
  setState((s) => ({
    ...s,
    messages: [
      ...s.messages,
      {
        id: crypto.randomUUID(),
        from: 'principal',
        author: 'Principal Agent',
        text: `Holding firm at ${deal.currency}${deal.targetPrice}${deal.unit}.`,
        time: nowStamp(),
      },
    ],
    audit: [...s.audit, audit('TOOL_CALL', 'hold_firm', 'Principal refused latest concession.', { agent: 'Principal' })],
  }))
  appendCounterparty(counterpartyReply(deal, persona, { price: deal.targetPrice, kind: 'hold' }))
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
