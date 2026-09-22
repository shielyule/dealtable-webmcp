import { loadEnv, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { searchMarket } from './src/server/marketSearch.js'

function marketDevApi(apiKey) {
  return {
    name: 'market-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/market', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
          const result = await searchMarket(body, apiKey)
          const status = result.status || 200
          const { status: _status, ...payload } = result
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        } catch {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Market search failed', sources: [] }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), marketDevApi(env.TAVILY_API_KEY)],
  }
})
