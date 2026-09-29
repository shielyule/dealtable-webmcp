import { useId, useState } from 'react'
import clsx from 'clsx'
import {
  ChevronDown,
  Ear,
  Handshake,
  Lightbulb,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { FIVE_CS, RULE_PHASES } from '../lib/negotiationPlaybook.js'

const C_ICONS = {
  collaboration: Handshake,
  communication: Ear,
  compromise: Scale,
  creativity: Lightbulb,
  credibility: ShieldCheck,
}

const C_TONES = {
  collaboration: 'border-sky-200 bg-sky-50 text-sky-800',
  communication: 'border-teal-200 bg-teal-50 text-teal-800',
  compromise: 'border-amber-200 bg-amber-50 text-amber-900',
  creativity: 'border-violet-200 bg-violet-50 text-violet-800',
  credibility: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

function FiveCsStrip({ interactive = true }) {
  const [active, setActive] = useState(FIVE_CS[0].id)
  const current = FIVE_CS.find((c) => c.id === active) || FIVE_CS[0]

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-5">
        {FIVE_CS.map((c) => {
          const Icon = C_ICONS[c.id]
          const selected = active === c.id
          return (
            <button
              key={c.id}
              type="button"
              disabled={!interactive}
              onClick={() => setActive(c.id)}
              className={clsx(
                'rounded-xl border px-3 py-3 text-left transition',
                C_TONES[c.id],
                selected ? 'ring-2 ring-primary/40 shadow-sm' : 'opacity-90 hover:opacity-100',
                !interactive && 'cursor-default',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <div className="mt-2 text-xs font-bold leading-tight">{c.label}</div>
              <div className="mt-0.5 text-[10px] font-medium opacity-80">{c.short}</div>
            </button>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{current.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">{current.dealtable}</p>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-neutral">
          {current.points.map((p) => (
            <li key={p}>· {p}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RulesAccordion({ defaultOpen = false }) {
  const baseId = useId()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${baseId}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-slate-900">10 golden rules</div>
          <div className="text-[11px] text-neutral">Prep → conduct — mapped to Mandate, Hub, HITL, and handoffs</div>
        </div>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-neutral transition', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div id={`${baseId}-panel`} className="space-y-5 border-t border-slate-100 px-4 py-4">
          {RULE_PHASES.map((phase) => (
            <section key={phase.id}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">{phase.title}</h3>
              <p className="mt-0.5 text-[11px] text-neutral">{phase.subtitle}</p>
              <ol className="mt-3 space-y-3">
                {phase.rules.map((rule, i) => (
                  <li key={rule.title} className="rounded-lg bg-page px-3 py-2.5">
                    <div className="flex gap-2">
                      <span className="font-mono text-[10px] font-semibold text-primary">
                        {phase.id === 'prep' ? i + 1 : i + 5}.
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{rule.title}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{rule.body}</p>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-primary">
                          <span className="font-semibold">In DealTable:</span> {rule.dealtable}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @param {{ variant?: 'embed' | 'page', rulesOpen?: boolean }} props
 * embed = Entrance collapsible block; page = full Art of Negotiation view
 */
export default function NegotiationPlaybook({ variant = 'embed', rulesOpen = false }) {
  const [goldOpen, setGoldOpen] = useState(variant === 'page')
  const panelId = useId()

  if (variant === 'page') {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm leading-relaxed text-neutral">
            A compact playbook for practice deals — the five C’s for mindset, then ten rules for prep and conduct.
            Each tip points at a DealTable control so coaching sticks to the room you’re in.
          </p>
        </div>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">The five C’s</h2>
          <FiveCsStrip />
        </section>
        <RulesAccordion defaultOpen />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <button
        type="button"
        aria-expanded={goldOpen}
        aria-controls={panelId}
        onClick={() => setGoldOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-slate-900">Golden rules of negotiation</div>
          <div className="text-xs text-neutral">Five C’s overview · prep &amp; conduct playbook for this tool</div>
        </div>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-neutral transition', goldOpen && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      {goldOpen && (
        <div id={panelId} className="space-y-5 border-t border-slate-100 px-5 py-5">
          <FiveCsStrip />
          <RulesAccordion defaultOpen={rulesOpen} />
        </div>
      )}
    </div>
  )
}
