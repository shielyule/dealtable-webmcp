import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Shield } from 'lucide-react'
import { formatMoney } from '../lib/formatMoney.js'
import { getState, resolveHitl } from '../lib/dealStore.js'

export default function HitlModal({ hitlOpen }) {
  const panelRef = useRef(null)
  const pending = hitlOpen?.pending
  const kind = pending?.kind || 'propose'
  const isScoped = kind === 'propose' || kind === 'waiver'
  const deal = getState().deal

  const [floor, setFloor] = useState(pending?.floor ?? pending?.price ?? '')
  const [minutes, setMinutes] = useState(pending?.minutes ?? 15)

  useEffect(() => {
    if (!hitlOpen) return
    panelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setFloor(hitlOpen.pending?.floor ?? hitlOpen.pending?.price ?? '')
    setMinutes(hitlOpen.pending?.minutes ?? 15)
  }, [hitlOpen])

  if (!hitlOpen) return null

  const handleResolve = (approved) => {
    const overrides = isScoped
      ? { floor: Number(floor), minutes: Number(minutes) }
      : {}
    const pendingCb = window.__webmcpHitlResolve
    if (typeof pendingCb === 'function') {
      window.__webmcpHitlResolve = null
      // WebMCP path: resolveHitl must run so waiver is granted before returning to the tool.
      if (approved) resolveHitl(true, overrides)
      else resolveHitl(false)
      pendingCb(approved)
      return
    }
    resolveHitl(approved, overrides)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-2xl ring-4 ring-amber-200/80"
      >
        <div className="mb-3 flex items-center gap-2 text-amber-800">
          {isScoped ? (
            <Shield className="h-5 w-5 shrink-0" strokeWidth={2} />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} />
          )}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {isScoped ? 'Shape authority — then grant' : 'Action required — tap below'}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{hitlOpen.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral">{hitlOpen.body}</p>

        {isScoped && deal && (
          <div className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-[11px] leading-relaxed text-amber-900">
              Grant a <strong>scoped waiver</strong>: the agent may go as low as this floor for a limited time. Edit
              before Approve — like Mandate, authority is shaped here, not after the fact.
            </p>
            <label className="block text-xs font-semibold text-slate-800">
              Floor (lowest allowed under waiver)
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <span className="mt-1 block font-normal text-neutral">
                Walkaway is {formatMoney(deal, deal.walkawayPrice)}
                {pending?.price != null ? ` · offer ${formatMoney(deal, pending.price)}` : ''}
              </span>
            </label>
            <label className="block text-xs font-semibold text-slate-800">
              Duration
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </label>
          </div>
        )}

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
            {isScoped ? 'Grant waiver' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}
