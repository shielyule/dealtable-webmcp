import { generateCounterpartyReply } from '../src/server/counterpartyLlm.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const result = await generateCounterpartyReply(body, {
      nebiusKey: process.env.NEBIUS_API_KEY,
      tavilyKey: process.env.TAVILY_API_KEY,
    })
    const status = result.status || 200
    const { status: _status, ...payload } = result
    res.status(status).json(payload)
  } catch {
    res.status(500).json({ error: 'Counterparty generation failed', fallback: true, sources: [] })
  }
}
