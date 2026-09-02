import clsx from 'clsx'
import { Bot, Shield } from 'lucide-react'

export default function PersonaBrief({ persona, orgOverride }) {
  if (!persona?.guide) return null

  const g = persona.guide

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Bot className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{persona.agentName}</div>
          <div className="text-xs text-neutral">{orgOverride || persona.org}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-700">{g.who}</p>
      <div className="mt-3">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-wide text-neutral">How they act</div>
        <ul className="mt-2 space-y-1.5">
          {g.behaviors.map((b) => (
            <li key={b} className="flex gap-2 text-xs text-slate-700">
              <Shield className="mt-0.5 h-3 w-3 shrink-0 text-primary" strokeWidth={1.5} />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <p className={clsx('mt-3 rounded-lg bg-white/80 px-3 py-2 text-[11px] text-neutral')}>{g.tip}</p>
    </div>
  )
}
