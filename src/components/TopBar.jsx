import clsx from 'clsx'
import { BookOpen } from 'lucide-react'
import { setRoute } from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

export default function TopBar({ sessionId, status }) {
  const { webmcpReady, hitlOpen } = useDeal()
  const showSession = status !== 'setup' && sessionId

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6">
      <div className="min-w-0 flex-1">
        {showSession ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-medium text-slate-700">
            <span className={clsx('h-2 w-2 rounded-full', hitlOpen ? 'bg-amber-500' : 'bg-secondary')} />
            SESSION: {sessionId}
          </div>
        ) : (
          <span className="text-xs text-neutral">Pick a scenario to start a practice session</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hitlOpen && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            Approval needed
          </span>
        )}
        <span
          className={clsx(
            'rounded-full border px-3 py-1 text-xs font-medium',
            webmcpReady
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-neutral',
          )}
          title={
            webmcpReady
              ? 'ChatGPT can call DealTable tools in this browser'
              : 'WebMCP not detected — app still works solo'
          }
        >
          {webmcpReady ? 'WebMCP ready' : 'Solo mode'}
        </span>
        <button
          type="button"
          onClick={() => setRoute('playbook')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          title="Open negotiation playbook"
        >
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          Playbook
        </button>
      </div>
    </header>
  )
}
