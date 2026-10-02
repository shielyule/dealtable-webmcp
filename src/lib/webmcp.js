import {
  acceptTerm,
  applyExtraction,
  concede,
  extractOpeningOffer,
  getState,
  getWaiver,
  holdFirm,
  isWaiverLive,
  onWebmcpRefresh,
  openHitl,
  proposeOffer,
  proposeWaiver,
  revokeWaiver,
  setWebmcpReady,
  setWebmcpTools,
  snapshot,
  updateSetup,
} from './dealStore.js'
import { formatMoney } from './formatMoney.js'

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
  // resolveHitl already ran from the modal when approved (waiver grant + offer).
  return jsonResult(approved ? { ok: true, override: true, state: snapshot() } : { ok: false, cancelled: true })
}

function baseTools() {
  return [
    {
      name: 'get_deal_state',
      description:
        'Read the live negotiation: mandate, waiver, current ask, last messages, advisor score, and registered WebMCP tools. Call before proposing any move.',
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
          walkawayPrice: { type: 'number', description: 'Hard floor. Offers below this need human approval or a live waiver.' },
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
        'Send a counter-offer. Below walkaway without a covering waiver: a scoped-waiver card appears on the page (floor + duration). Human edits then Grants; the tool waits.',
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
      description: 'Move toward the counterparty. Same walkaway / waiver gate as propose_offer.',
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
      name: 'propose_waiver',
      description:
        'Ask the human for scoped authority below walkaway (floor + minutes). They edit the card on the page, then Grant or Reject. Prefer this before deep counters.',
      inputSchema: {
        type: 'object',
        properties: {
          floor: { type: 'number', description: 'Lowest price the agent may go under the waiver.' },
          minutes: { type: 'number', description: 'Waiver lifetime: 5, 15, or 30.' },
          reason: { type: 'string' },
        },
      },
      annotations: { readOnlyHint: false },
      execute: async (input, client) => withHitl(client, proposeWaiver(input)),
    },
    {
      name: 'get_mandate',
      description: 'Read walkaway, any live scoped waiver, and which WebMCP tools are currently registered.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () =>
        jsonResult({
          mandate: snapshot().mandate,
          waiver: getWaiver()
            ? {
                floor: getWaiver().floor,
                minutes: getWaiver().minutes,
                expiresAt: getWaiver().expiresAt,
              }
            : null,
          tools: snapshot().webmcpTools,
        }),
    },
    {
      name: 'parse_opening_offer',
      description:
        'Parse pasted or uploaded offer text. Returns suggested target, walkaway, and their opening number.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          apply: { type: 'boolean' },
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
      description: 'Hold at the target price and refuse the latest concession.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: async () => jsonResult(holdFirm()),
    },
  ]
}

function waiverOnlyTools() {
  return [
    {
      name: 'counter_under_waiver',
      description:
        'ONLY available while a scoped waiver is live. Counter down to the waiver floor without a new HITL prompt. If price is below the floor, the call is refused with a plain-English reason.',
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
      execute: async (input) => {
        const w = getWaiver()
        if (!w) {
          return jsonResult({
            ok: false,
            blocked: true,
            reason: 'No live waiver. Call propose_waiver or propose_offer (HITL will open a scoped card).',
            tryInstead: ['propose_waiver', 'propose_offer'],
          })
        }
        const price = Number(input.price)
        if (price < Number(w.floor)) {
          return jsonResult({
            ok: false,
            blocked: true,
            reason: `Below waiver floor (${w.floor}). Tighten with propose_waiver or stay at/above the floor.`,
            tryInstead: ['propose_waiver', 'hold_firm'],
          })
        }
        return jsonResult(proposeOffer(input))
      },
    },
    {
      name: 'revoke_waiver',
      description: 'Revoke the live scoped waiver immediately. Removes counter_under_waiver from the tool surface.',
      inputSchema: {
        type: 'object',
        properties: { reason: { type: 'string' } },
      },
      annotations: { readOnlyHint: false },
      execute: async (input) => jsonResult(revokeWaiver(input)),
    },
    {
      name: 'accept_term',
      description:
        'Accept the current offer (available under a live waiver or with page HITL). Prefer when the human intends to close.',
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
          reason: `Accept ${input.label || 'current offer'} at ${formatMoney(s.deal, s.deal.currentAsk)}?`,
          label: input.label,
          price: s.deal.currentAsk,
          termYears: s.deal.termYears,
          note: input.summary,
        })
        const approved = await waitForPageHitl()
        // Modal already ran resolveHitl when the human clicked.
        return jsonResult(approved ? { ok: true, state: snapshot() } : { ok: false, cancelled: true })
      },
    },
  ]
}

function alwaysAcceptTool() {
  // Accept stays available but always HITL — so agents can try to close; human still gates.
  return {
    name: 'accept_term',
    description: 'Accept the current offer. Always opens page HITL for the human principal.',
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
        reason: `Accept ${input.label || 'current offer'} at ${formatMoney(s.deal, s.deal.currentAsk)}?`,
        label: input.label,
        price: s.deal.currentAsk,
        termYears: s.deal.termYears,
        note: input.summary,
      })
      const approved = await waitForPageHitl()
      return jsonResult(approved ? { ok: true, state: snapshot() } : { ok: false, cancelled: true })
    },
  }
}

function toolsForState() {
  const tools = [...baseTools()]
  if (isWaiverLive()) {
    tools.push(...waiverOnlyTools())
  } else {
    tools.push(alwaysAcceptTool())
  }
  // Dedupe by name (accept_term only once)
  const seen = new Set()
  return tools.filter((t) => {
    if (seen.has(t.name)) return false
    seen.add(t.name)
    return true
  })
}

let activeController = null
let refreshTimer = null

export async function registerNegotiationTools() {
  const ctx = modelContext()
  if (!ctx?.registerTool) {
    setWebmcpReady(false)
    setWebmcpTools([])
    return { ok: false, reason: 'WebMCP not available in this browser' }
  }

  // Abort previous surface (Mandate-style re-register). Defer so in-flight HITL tools can return.
  if (activeController) {
    const prev = activeController
    activeController = null
    queueMicrotask(() => prev.abort())
  }

  const controller = new AbortController()
  activeController = controller
  const tools = toolsForState()
  for (const tool of tools) {
    await ctx.registerTool(tool, { signal: controller.signal })
  }
  setWebmcpTools(tools.map((t) => t.name))
  setWebmcpReady(true)
  return { ok: true, tools: tools.map((t) => t.name), controller }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  // Macrotask after pending tool return — avoids aborting propose_waiver mid-flight (Mandate lesson).
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    registerNegotiationTools().catch(() => {})
  }, 0)
}

onWebmcpRefresh(scheduleRefresh)

export function listToolNames() {
  return toolsForState().map((t) => t.name)
}
