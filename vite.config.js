import { loadEnv, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { searchMarket } from './src/server/marketSearch.js'
import { generateCounterpartyReply } from './src/server/counterpartyLlm.js'

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString() || '{}')
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function dealtableDevApi(env) {
  return {
    name: 'dealtable-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/market', async (req, res) => {
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' })
          return
        }
        try {
          const body = await readJsonBody(req)
          const result = await searchMarket(body, env.TAVILY_API_KEY)
          const status = result.status || 200
          const { status: _status, ...payload } = result
          json(res, status, payload)
        } catch {
          json(res, 500, { error: 'Market search failed', sources: [] })
        }
      })

      server.middlewares.use('/api/counterparty', async (req, res) => {
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' })
          return
        }
        try {
          const body = await readJsonBody(req)
          const result = await generateCounterpartyReply(body, {
            nebiusKey: env.NEBIUS_API_KEY,
            tavilyKey: env.TAVILY_API_KEY,
          })
          const status = result.status || 200
          const { status: _status, ...payload } = result
          json(res, status, payload)
        } catch {
          json(res, 500, { error: 'Counterparty generation failed', fallback: true, sources: [] })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), dealtableDevApi(env)],
  }
})
