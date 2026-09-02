import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Info, AlertTriangle } from 'lucide-react'

/**
 * Click-to-toggle help popover. Uses fixed positioning so it is never clipped by overflow panels.
 */
export default function HelpTip({ label, children, variant = 'info', className, align = 'auto' }) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState({})
  const id = useId()
  const btnRef = useRef(null)
  const popRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const popW = 288
    const popH = popRef.current?.offsetHeight ?? 200
    const margin = 8
    let left = rect.left
    if (align === 'right' || (align === 'auto' && left + popW > window.innerWidth - margin)) {
      left = rect.right - popW
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - popW - margin))
    let top = rect.bottom + margin
    if (top + popH > window.innerHeight - margin) {
      top = rect.top - popH - margin
    }
    setStyle({ position: 'fixed', left, top, width: popW, zIndex: 9999 })
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!btnRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const iconClass =
    variant === 'warning'
      ? 'text-red-500 hover:text-red-600'
      : className?.includes('on-dark')
        ? 'text-slate-300 hover:text-white'
        : 'text-primary hover:text-indigo-600'

  return (
    <>
      <span className={clsx('relative inline-flex', className)}>
        <button
          ref={btnRef}
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onClick={() => setOpen((v) => !v)}
          className={clsx('rounded p-0.5 transition focus:outline-none focus:ring-2 focus:ring-primary/30', iconClass)}
        >
          {variant === 'warning' ? (
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      </span>
      {open && (
        <div
          ref={popRef}
          id={id}
          role="tooltip"
          style={style}
          className="rounded-xl border border-slate-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-700 shadow-xl"
        >
          <div className="mb-1 font-semibold text-slate-900">{label}</div>
          {children}
        </div>
      )}
    </>
  )
}
