import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { resolveHitl } from '../lib/dealStore.js'

export default function HitlModal({ hitlOpen }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!hitlOpen) return
    panelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [hitlOpen])

  if (!hitlOpen) return null

  const handleResolve = (approved) => {
    const pending = window.__webmcpHitlResolve
    if (typeof pending === 'function') {
      window.__webmcpHitlResolve = null
      pending(approved)
      return
    }
    resolveHitl(approved)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        className="w-full max-w-md animate-pulse rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-2xl ring-4 ring-amber-200/80"
        style={{ animationDuration: '2s' }}
      >
        <div className="mb-3 flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wide">Action required — tap below</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{hitlOpen.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral">{hitlOpen.body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleResolve(false)}
            className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleResolve(true)}
            className="min-h-[44px] rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
