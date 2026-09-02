import clsx from 'clsx'
import { Brain, HelpCircle, LogOut, MessageSquare, Plus, ScrollText } from 'lucide-react'
import Logo from './Logo.jsx'
import { goHome, setRoute } from '../lib/dealStore.js'

const NAV_ITEMS = [
  { id: 'hub', label: 'Negotiation Hub', icon: MessageSquare },
  { id: 'advisor', label: 'Advisor Insights', icon: Brain },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
]

export default function Sidebar({ route, status }) {
  const inSession = status === 'active' || status === 'accepted'

  const handleNav = (id) => {
    if (!inSession) return
    setRoute(id)
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <button
        type="button"
        onClick={() => goHome()}
        title="Home — back to start"
        className="flex items-center gap-3 px-5 py-5 text-left transition hover:bg-slate-50"
      >
        <Logo className="h-7 w-7" />
        <div>
          <div className="text-sm font-bold text-slate-900">DealTable</div>
          <div className="text-xs text-neutral">WebMCP Negotiation · Home</div>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => goHome()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Negotiation
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = route === id || (route === 'summary' && id === 'hub')
          const disabled = !inSession
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNav(id)}
              disabled={disabled}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-indigo-50 text-primary'
                  : 'text-neutral hover:bg-slate-50 hover:text-slate-800',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        <button
          type="button"
          onClick={() => goHome()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral hover:bg-slate-50 hover:text-slate-800"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
          Home / Scenarios
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral hover:bg-slate-50 hover:text-slate-800"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  )
}
