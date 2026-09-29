import { tavily } from '@tavily/core'

const QUERIES = {
  lease: 'class-A office rent per square foot New York 2026',
  freelance: 'freelance software project rates 2026',
  salary: 'UK professional salary bands 2026',
  vendor: 'B2B SaaS annual renewal pricing benchmarks 2026',
  residential: 'apartment rent renewal market rate 2026',
  insurance: 'UK home contents insurance claim settlement amounts 2026',
  usedcar: 'UK used car dealership negotiation average discounts 2026',
  renovation: 'UK home renovation kitchen bathroom contractor quote costs 2026',
  flatbuy: 'England Wales flat purchase price negotiation offers under asking 2026',
}

export function marketQuery(input = {}) {
  const id = input.scenario || input.scenarioId
  if (QUERIES[id]) return QUERIES[id]
  const title = String(input.title || 'commercial negotiation').slice(0, 120)
  return `${title} market rates ${new Date().getFullYear()}`.slice(0, 400)
}

export async function searchMarket(input, apiKey) {
  const query = marketQuery(input)
  if (!apiKey) {
    return {
      status: 503,
      error: 'Tavily is not configured',
      query,
      sources: [],
    }
  }

  const client = tavily({ apiKey })
  const response = await client.search(query, {
    searchDepth: 'basic',
    topic: 'general',
    maxResults: 5,
    includeAnswer: false,
    timeRange: 'year',
  })

  const sources = (response.results || [])
    .slice(0, 5)
    .map((result) => ({
      title: result.title || result.url,
      url: result.url,
      content: String(result.content || '').replace(/\s+/g, ' ').trim().slice(0, 280),
    }))
    .filter((source) => source.url)

  return { query, sources }
}
