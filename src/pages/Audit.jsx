import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  AlertTriangle,
  ArrowLeftRight,
  Download,
  Power,
  Search,
  Sparkles,
} from 'lucide-react'
import { exportAudit } from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

const TYPE_STYLES = {
  SYSTEM_INIT: {
    icon: Power,
    badge: 'bg-blue-50 text-blue-600',
    dot: 'bg-blue-500',
    ring: 'ring-blue-100',
  },
  TOOL_CALL: {
    icon: Sparkles,
    badge: 'bg-purple-50 text-purple-600',
    dot: 'bg-purple-500',
    ring: 'ring-purple-100',
  },
  STATE_MUTATION: {
    icon: ArrowLeftRight,
    badge: 'bg-emerald-50 text-emerald-600',
    dot: 'bg-secondary',
    ring: 'ring-emerald-100',
  },
  WARNING: {
    icon: AlertTriangle,
    badge: 'bg-amber-50 text-amber-600',
    dot: 'bg-tertiary',
    ring: 'ring-amber-100',
  },
}

function AuditEntry({ entry }) {
  const style = TYPE_STYLES[entry.type] ?? TYPE_STYLES.WARNING
  const Icon = style.icon

  return (
    <div className="relative pl-10">
      <div
        className={clsx(
          'absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4',
          style.ring,
          'bg-white',
        )}
      >
        <div className={clsx('flex h-6 w-6 items-center justify-center rounded-full text-white', style.dot)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-neutral">{entry.timestamp}</span>
            <span className={clsx('rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase', style.badge)}>
              {entry.type}
            </span>
          </div>
          <div className="text-right font-mono text-[10px] text-neutral">
            {entry.sessionId && `Session ID: ${entry.sessionId}`}
            {entry.agent && `Agent: ${entry.agent}`}
            {entry.trigger && `Trigger: ${entry.trigger}`}
          </div>
        </div>

        <h3 className="mt-2 font-mono text-sm font-semibold text-slate-900">{entry.title}</h3>
        {entry.detail && (
          <p className="mt-1 text-sm text-neutral">{entry.detail}</p>
        )}

        {entry.json && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-purple-50 p-3 font-mono text-[11px] leading-relaxed text-purple-900">
            {JSON.stringify(entry.json, null, 2)}
          </pre>
        )}

        {(entry.previous || entry.next) && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {entry.previous && (
              <div>
                <div className="mb-1 font-mono text-[10px] font-semibold uppercase text-neutral">
                  Previous State
                </div>
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-700">
                  {JSON.stringify(entry.previous, null, 2)}
                </pre>
              </div>
            )}
            {entry.next && (
              <div>
                <div className="mb-1 font-mono text-[10px] font-semibold uppercase text-neutral">
                  New State
                </div>
                <pre className="overflow-x-auto rounded-lg bg-emerald-50 p-3 font-mono text-[11px] leading-relaxed text-emerald-800">
                  {JSON.stringify(entry.next, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Audit() {
  const { audit } = useDeal()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return audit
    return audit.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.detail?.toLowerCase().includes(q) ||
        e.type?.toLowerCase().includes(q),
    )
  }, [audit, query])

  const handleExport = () => {
    const blob = new Blob([exportAudit()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'negotiation-audit.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">State Audit Log</h1>
          <p className="mt-1 text-sm text-neutral">
            Detailed chronological trace of agent interactions and system mutations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Export JSON
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search logs..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-neutral">
            {audit.length === 0
              ? 'No audit entries yet. Start a negotiation to populate the log.'
              : 'No entries match your search.'}
          </p>
        </div>
      ) : (
        <div className="relative space-y-6 border-l-2 border-slate-200 pl-6">
          {filtered.map((entry) => (
            <AuditEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
