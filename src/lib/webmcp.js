import {
  acceptTerm,
  applyExtraction,
  concede,
  extractOpeningOffer,
  getState,
  holdFirm,
  openHitl,
  proposeOffer,
  resolveHitl,
  setWebmcpReady,
  snapshot,
  updateSetup,
} from './dealStore.js'

function modelContext() {
  return document.modelContext ?? navigator.modelContext ?? null
}

function jsonResult(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
}

/** Wait for Approve/Reject on the DealTable page (modal). */
async function waitForPageHitl() {
  return new Promise((resolve) => {
    window.__webmcpHitlResolve = (approved) => {
      window.__webmcpHitlResolve = null
      resolve(Boolean(approved))
    }
  })
}

async function withHitl(_client, result) {
  if (!result?.needsHitl) return jsonResult(result)
  openHitl(result)
  const approved = await waitForPageHitl()
  return jsonResult(resolveHitl(approved))
}

const TOOLS = [
  {
    name: 'get_deal_state',
    description:
      'Read the live negotiation: mandate, current ask, last messages, advisor score, and session status. Call this before proposing any move.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async () => jsonResult(snapshot()),
  },
  {
    name: 'set_mandate',
    description:
      'Update the human principal’s mandate: target price, walkaway price, concession threshold (0–0.3), or primary goal. Does not send an offer.',
    inputSchema: {
      type: 'object',
      properties: {
        targetPrice: { type: 'number', description: 'Target price the principal wants to land.' },
        walkawayPrice: { type: 'number', description: 'Hard floor. Offers below this need human approval.' },
        concessionPct: { type: 'number', description: '0 = rigid, 0.15 = moderate, 0.3 = flexible.' },
        primaryGoal: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: false },
    execute: async (input) => {
      updateSetup(input)
      return jsonResult({ ok: true, mandate: snapshot().mandate })
    },
  },
  {
    name: 'propose_offer',
    description:
      'Send a counter-offer from the principal agent. If price is below walkaway, a modal appears ON THE PAGE — the human must click Approve or Reject there; the tool waits until they do.',
    inputSchema: {
      type: 'object',
      properties: {
        price: { type: 'number', description: 'Numeric offer in the deal’s currency/unit.' },
        termYears: { type: 'number' },
        note: { type: 'string', description: 'Short message to put on the table.' },
      },
      required: ['price'],
    },
    annotations: { readOnlyHint: false },
    execute: async (input, client) => withHitl(client, proposeOffer(input)),
  },
  {
    name: 'concede',
    description:
      'Move the principal toward the counterparty on price or term. Same walkaway HITL gate as propose_offer.',
    inputSchema: {
      type: 'object',
      properties: {
        price: { type: 'number' },
        termYears: { type: 'number' },
        note: { type: 'string' },
      },
      required: ['price'],
    },
    annotations: { readOnlyHint: false },
    execute: async (input, client) => withHitl(client, concede(input)),
  },
  {
    name: 'accept_term',
    description: 'Accept a specific term or the current offer. Use only when the human principal intends to close.',
    inputSchema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        summary: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: false },
    execute: async (input) => {
      const s = getState()
      openHitl({
        kind: 'accept',
        reason: `Accept ${input.label || 'current offer'} at ${s.deal.currency}${s.deal.currentAsk}${s.deal.unit ?? ''}?`,
        label: input.label,
        price: s.deal.currentAsk,
        termYears: s.deal.termYears,
        note: input.summary,
      })
      const approved = await waitForPageHitl()
      return jsonResult(resolveHitl(approved))
    },
  },
  {
    name: 'parse_opening_offer',
    description:
      'Parse pasted or uploaded offer text. Returns suggested target, walkaway, and their opening number. Use before set_mandate when the user supplies a document.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Offer letter, email, or claim text. Omit to use text already on the Setup page.' },
        apply: { type: 'boolean', description: 'If true, write extracted values into the mandate automatically.' },
      },
    },
    annotations: { readOnlyHint: false },
    execute: async (input) => {
      const result = extractOpeningOffer(input.text)
      if (!result.ok) return jsonResult(result)
      if (input.apply) {
        const applied = applyExtraction()
        return jsonResult({ ...result, applied })
      }
      return jsonResult(result)
    },
  },
  {
    name: 'hold_firm',
    description: 'Instruct the principal agent to hold at the target price and refuse the latest concession.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false },
    execute: async () => jsonResult(holdFirm()),
  },
]

export async function registerNegotiationTools() {
  const ctx = modelContext()
  if (!ctx?.registerTool) {
    setWebmcpReady(false)
    return { ok: false, reason: 'WebMCP not available in this browser' }
  }
  const controller = new AbortController()
  for (const tool of TOOLS) {
    await ctx.registerTool(tool, { signal: controller.signal })
  }
  setWebmcpReady(true)
  return { ok: true, tools: TOOLS.map((t) => t.name), controller }
}

export function listToolNames() {
  return TOOLS.map((t) => t.name)
}
