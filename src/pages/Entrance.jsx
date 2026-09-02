import clsx from 'clsx'
import { ArrowRight, Wrench } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { SCENARIOS, selectScenario, setRoute } from '../lib/dealStore.js'

const ORDER = ['lease', 'freelance', 'salary', 'vendor', 'residential', 'insurance']

export default function Entrance() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 rounded-xl border border-indigo-100 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-slate-900">Welcome to DealTable</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral">
          A practice negotiation room where <strong>you</strong> set the rules, a <strong>counterparty agent</strong>{' '}
          role-plays the other side, and <strong>ChatGPT</strong> (optional) advises via WebMCP tools.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li>
            <strong>1. Pick a scenario</strong> — lease, salary, insurance claim, etc. This is the situation you want
            to roleplay.
          </li>
          <li>
            <strong>2. Set your Mandate</strong> — your Mandate is basically the scenario rules: target price, walkaway
            limit, and how much you&apos;ll concede. Think of it as your briefing before the meeting.
          </li>
          <li>
            <strong>3. Negotiate</strong> — chat, counter, accept. The counterparty responds. The advisor panel updates.
          </li>
          <li>
            <strong>4. Human approval (HITL)</strong> — if an offer crosses your walkaway, the app pauses and asks you
            to Approve or Reject. No agent can bypass that.
          </li>
        </ol>
      </div>

      <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">Choose your negotiation</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER.map((id) => {
          const s = SCENARIOS[id]
          const Icon = s.icon
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectScenario(id)}
              className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-neutral">
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral">{s.subtitle}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                Set mandate
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setRoute('custom')}
          className={clsx(
            'rounded-xl border-2 border-dashed border-primary/30 bg-indigo-50/40 p-5 text-left transition hover:border-primary hover:bg-indigo-50',
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <Wrench className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Build your own</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral">
            Pick a negotiation type template, then customize title and counterparty name.
          </p>
          <div className="mt-4 text-xs font-semibold text-primary">Customize →</div>
        </button>
      </div>
    </div>
  )
}
