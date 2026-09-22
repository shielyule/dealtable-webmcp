import clsx from 'clsx'
import { AlertTriangle, Bot, Clock, Play, Sparkles } from 'lucide-react'
import HelpTip from '../components/HelpTip.jsx'
import { getPersona, proposeWinWinTerm, sendInstruction, setRoute } from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

export default function Advisor() {
  const { advisor, liveTools, personaId, customScenario } = useDeal()
  const persona = personaId ? getPersona(personaId) : null

  const handlePropose = (term) => {
    setRoute('hub')
    proposeWinWinTerm(term)
  }

  const handleUsePrompt = () => {
    setRoute('hub')
    sendInstruction(advisor.suggestedMove)
  }

  const toneSegments = 5
  const filledSegments = advisor.tone === 'Collaborative' ? 4 : advisor.tone === 'Neutral' ? 3 : 2

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Advisor Insights</h1>
        <p className="mt-1 text-sm text-neutral">
          In-page strategic telemetry — recalculates as the deal moves. ChatGPT (via WebMCP) can also advise externally.
        </p>
      </div>

      {advisor.offTrack && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            {advisor.offTrack}{' '}
            <button type="button" className="font-semibold underline" onClick={() => setRoute('setup')}>
              Review mandate
            </button>{' '}
            or use <strong>Home</strong> for a fresh scenario.
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="font-mono text-xs font-medium uppercase tracking-wide text-neutral">Leverage Index</div>
                <div className="mt-2 text-4xl font-bold text-primary">{advisor.leverage}%</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${advisor.leverage}%` }} />
                </div>
                <p className="mt-2 text-xs text-neutral">Higher = more room to push toward your target.</p>
              </div>
              <div>
                <div className="font-mono text-xs font-medium uppercase tracking-wide text-neutral">Current Tone</div>
                <div className="mt-2 text-4xl font-bold text-secondary">{advisor.tone}</div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: toneSegments }).map((_, i) => (
                    <div key={i} className={clsx('h-2 flex-1 rounded-full', i < filledSegments ? 'bg-secondary' : 'bg-slate-100')} />
                  ))}
                </div>
                <p className="mt-2 text-xs text-neutral">{advisor.toneHint}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="font-mono text-xs font-medium uppercase tracking-wide text-neutral">Concession headroom</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">${advisor.concessionRemaining.toLocaleString()}</div>
              <p className="mt-1 text-xs text-neutral">Estimated room before hard limit (${advisor.hardLimit.toLocaleString()}).</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="font-mono text-xs font-medium uppercase tracking-wide text-neutral">Key Motivator</div>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <span className="text-lg font-semibold text-slate-900">{advisor.motivator.label}</span>
              </div>
              <p className="mt-1 text-xs text-neutral">{advisor.motivator.detail}</p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-slate-900">Suggested Next Move</span>
              </div>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-primary">
                Auto-Generated
              </span>
            </div>
            <p className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-slate-700">
              &ldquo;{advisor.suggestedMove}&rdquo;
            </p>
            <p className="mt-2 text-[11px] text-neutral">Use Prompt sends this to the Hub chat — counterparty will reply.</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleUsePrompt}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
              >
                <Play className="h-3.5 w-3.5" strokeWidth={2} />
                Use Prompt
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-1 flex items-center gap-1">
              <h2 className="text-sm font-semibold text-slate-900">Hidden Win-Win Terms</h2>
              <HelpTip label="Hidden win-win terms" align="right">
                <p>
                  Trade-offs that move headline price less — e.g. longer term for lower rent, signing bonus instead of
                  base. <strong>Propose Term</strong> sends them to the counterparty in chat and triggers a reply.
                </p>
              </HelpTip>
            </div>
            <p className="mb-3 text-[11px] text-neutral">Creative structures the advisor spotted — not automatic price cuts.</p>
            <div className="space-y-3">
              {advisor.winWins.map((term) => (
                <div key={term.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{term.title}</span>
                    <span className={clsx('rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase', term.tag === 'High Value' ? 'bg-emerald-50 text-secondary' : 'bg-slate-100 text-neutral')}>
                      {term.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-neutral">{term.body}</p>
                  <button type="button" onClick={() => handlePropose(term)} className="mt-3 w-full rounded-xl border border-emerald-200 py-2 text-xs font-semibold text-secondary hover:bg-emerald-50">
                    Propose Term →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Live Agent Tools
            </div>
            <p className="mb-2 text-[11px] text-neutral">
              Market comps are a live Tavily search when the negotiation starts. Sentiment is still a demo label.
            </p>
            <ul className="space-y-2">
              {liveTools.map((tool) => (
                <li key={tool.id} className="flex items-center gap-2 font-mono text-xs text-neutral">
                  {tool.status === 'running' ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  ) : tool.status === 'error' ? (
                    <span className="text-amber-600">!</span>
                  ) : tool.status === 'idle' ? (
                    <span className="text-slate-300">·</span>
                  ) : (
                    <span className="text-secondary">✓</span>
                  )}
                  {tool.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
