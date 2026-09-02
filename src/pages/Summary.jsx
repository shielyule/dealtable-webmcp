import { ArrowRight, Download, Home, Copy, CheckCircle2 } from 'lucide-react'
import { exportAudit, exportTranscript, goHome } from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

export default function Summary() {
  const { closure, deal, messages } = useDeal()

  if (!closure) {
    return (
      <div className="p-8 text-center text-sm text-neutral">
        No completed negotiation.{' '}
        <button type="button" className="text-primary underline" onClick={() => goHome()}>
          Start from Home
        </button>
      </div>
    )
  }

  const copyTranscript = () => {
    navigator.clipboard?.writeText(exportTranscript())
  }

  const downloadAudit = () => {
    const blob = new Blob([exportAudit()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dealtable-${deal?.sessionId ?? 'session'}-closure.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <CheckCircle2 className="h-8 w-8 text-secondary" strokeWidth={1.5} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Agreement reached</h1>
          <p className="text-sm text-neutral">{deal?.title}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">Final terms</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-neutral">Agreed price</dt>
            <dd className="font-semibold text-slate-900">{closure.finalPrice}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral">Term</dt>
            <dd className="font-semibold text-slate-900">{closure.termYears} year(s)</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral">Your target was</dt>
            <dd>{closure.targetWas}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral">Walkaway was</dt>
            <dd>{closure.walkawayWas}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-neutral">Counterparty</dt>
            <dd>{closure.counterparty}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">{closure.summary}</p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">Next steps</h2>
        <ul className="mt-4 space-y-4">
          {closure.nextSteps.map((step) => (
            <li key={step.action} className="border-l-2 border-primary pl-4">
              <div className="text-xs font-semibold text-primary">{step.who}</div>
              <div className="text-sm text-slate-800">{step.action}</div>
              <div className="text-xs text-neutral">Deadline: {step.deadline}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">Discussion transcript ({messages.length} messages)</h2>
        <pre className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-[10px] leading-relaxed text-slate-700">
          {exportTranscript()}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyTranscript}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy transcript
          </button>
          <button
            type="button"
            onClick={downloadAudit}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download audit JSON
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goHome()}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-indigo-600"
      >
        <Home className="h-4 w-4" />
        Home — new negotiation
      </button>
    </div>
  )
}
