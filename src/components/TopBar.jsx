import { Bell, Settings } from 'lucide-react'

export default function TopBar({ sessionId, status }) {
  const showSession = status !== 'setup' && sessionId

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6">
      <div className="w-48" />

      <div className="flex items-center gap-4">
        {showSession && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            SESSION: {sessionId}
          </div>
        )}
        <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-primary">
          Status: Active Agents
        </div>
      </div>

      <div className="flex w-48 items-center justify-end gap-3">
        <button type="button" className="rounded-lg p-2 text-neutral hover:bg-slate-50">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button type="button" className="rounded-lg p-2 text-neutral hover:bg-slate-50">
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-primary">
          U
        </div>
      </div>
    </header>
  )
}
