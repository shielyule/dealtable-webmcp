import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight, Check, Sparkles, Upload } from 'lucide-react'
import HelpTip from '../components/HelpTip.jsx'
import PersonaBrief from '../components/PersonaBrief.jsx'
import PersonaBehaviorEditor from '../components/PersonaBehaviorEditor.jsx'
import {
  applyExtraction,
  clearExtraction,
  extractOpeningOffer,
  getPersona,
  setRoute,
  startNegotiation,
  updateSetup,
} from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

const CONCESSION_OPTIONS = [
  { value: 0, label: 'Rigid', sub: '0%' },
  { value: 0.15, label: 'Moderate', sub: '15%' },
  { value: 0.3, label: 'Flexible', sub: '30%+' },
]

const TARGET_HELP = (
  <>
    <p>Your <strong>ideal outcome</strong> — the number you&apos;re negotiating toward.</p>
    <p className="mt-2">Examples:</p>
    <ul className="mt-1 list-inside list-disc space-y-1 text-neutral">
      <li>Lease: $45/sqft rent you want to pay</li>
      <li>Salary: £95,000 base you&apos;re aiming for</li>
      <li>Insurance claim: £12,500 settlement you believe is fair</li>
    </ul>
  </>
)

const WALKAWAY_HELP = (
  <>
    <p>
      Your <strong>hard limit</strong>. Offers below this trigger a human approval modal — the app will not
      auto-concede past this without you clicking Approve.
    </p>
    <p className="mt-2">Must be worse for you than target (lower if you&apos;re paying; higher if you&apos;re claiming).</p>
    <p className="mt-2 text-amber-700">If target and walkaway are reversed, counters may behave unexpectedly.</p>
  </>
)

const CONCESSION_HELP = (
  <>
    <p>How far your agent may move from target toward their ask before needing a rethink.</p>
    <ul className="mt-2 list-inside list-disc space-y-1">
      <li><strong>Rigid (0%)</strong> — hold line; minimal movement</li>
      <li><strong>Moderate (15%)</strong> — standard demo setting</li>
      <li><strong>Flexible (30%+)</strong> — more room to close quickly</li>
    </ul>
  </>
)

export default function Setup() {
  const {
    scenarioId,
    personaId,
    customScenario,
    deal,
    advisorEnabled,
    openingOfferText,
    openingFileName,
    extractionPreview,
    webmcpReady,
    personaBehaviors,
  } = useDeal()
  const basePersona = personaId ? getPersona(personaId) : null
  const persona =
    basePersona && personaBehaviors?.length
      ? { ...basePersona, guide: { ...basePersona.guide, behaviors: personaBehaviors } }
      : basePersona
  const counterpartyLabel = customScenario?.counterparty || persona?.org || 'Counterparty Agent'
  const fileRef = useRef(null)

  const [targetPrice, setTargetPrice] = useState(deal?.targetPrice ?? 0)
  const [walkawayPrice, setWalkawayPrice] = useState(deal?.walkawayPrice ?? 0)
  const [concessionPct, setConcessionPct] = useState(deal?.concessionPct ?? 0.15)
  const [advisor, setAdvisor] = useState(advisorEnabled)
  const [openingText, setOpeningText] = useState(openingOfferText ?? '')
  const [extracting, setExtracting] = useState(false)

  useEffect(() => {
    if (!deal) return
    setTargetPrice(deal.targetPrice)
    setWalkawayPrice(deal.walkawayPrice)
    setConcessionPct(deal.concessionPct)
    setOpeningText(openingOfferText ?? '')
  }, [scenarioId, deal?.targetPrice, deal?.walkawayPrice, openingOfferText])

  if (!deal) {
    return (
      <div className="p-8 text-center text-sm text-neutral">
        No scenario selected.{' '}
        <button type="button" className="text-primary underline" onClick={() => setRoute('entrance')}>
          Go back
        </button>
      </div>
    )
  }

  const sync = (patch) => {
    updateSetup({
      targetPrice,
      walkawayPrice,
      concessionPct,
      advisorEnabled: advisor,
      openingOfferText: openingText,
      ...patch,
    })
  }

  const priceLabel = deal.unit ? 'Rate' : 'Price'

  const runExtract = async (text = openingText) => {
    setExtracting(true)
    sync({ openingOfferText: text })
    extractOpeningOffer(text)
    setExtracting(false)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '').slice(0, 8000)
      setOpeningText(text)
      sync({ openingOfferText: text, openingFileName: file.name })
      runExtract(text)
    }
    reader.readAsText(file)
  }

  const handleApplyExtraction = () => {
    const r = applyExtraction()
    if (r.ok && r.extracted) {
      setTargetPrice(r.extracted.targetPrice)
      setWalkawayPrice(r.extracted.walkawayPrice)
      if (r.extracted.openingOfferText) setOpeningText(r.extracted.openingOfferText)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        type="button"
        onClick={() => setRoute('entrance')}
        className="mb-4 flex items-center gap-2 text-sm text-neutral hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Change scenario
      </button>

      <div className="mb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-primary">{deal.title}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Set your mandate</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral">
          You are the <strong>principal</strong> (decision-maker). <strong>{counterpartyLabel}</strong> is the
          simulated counterparty — see profile below.
        </p>
      </div>

      <div className="mb-6">
        <PersonaBrief persona={persona} orgOverride={customScenario?.counterparty} />
        <PersonaBehaviorEditor behaviors={persona?.guide?.behaviors ?? []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-base font-semibold text-slate-900">Negotiation Parameters</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-neutral">
                  Target {priceLabel}
                  <HelpTip label="Target price" variant="info">
                    {TARGET_HELP}
                  </HelpTip>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral">{deal.currency}</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      setTargetPrice(n)
                      sync({ targetPrice: n })
                    }}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-7 pr-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {deal.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral">{deal.unit}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-neutral">
                  Walkaway {priceLabel}
                  <HelpTip label="Walkaway price — hard limit" variant="warning">
                    {WALKAWAY_HELP}
                  </HelpTip>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral">{deal.currency}</span>
                  <input
                    type="number"
                    value={walkawayPrice}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      setWalkawayPrice(n)
                      sync({ walkawayPrice: n })
                    }}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-7 pr-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-neutral">
                Concession Threshold
                <HelpTip label="Concession threshold" variant="info">
                  {CONCESSION_HELP}
                </HelpTip>
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                {CONCESSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setConcessionPct(opt.value)
                      sync({ concessionPct: opt.value })
                    }}
                    className={clsx(
                      'flex flex-1 flex-col items-center rounded-lg px-2 py-2 text-center transition',
                      concessionPct === opt.value
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-neutral hover:text-slate-700',
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="font-mono text-xs">({opt.sub})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Their opening offer</h2>
                <p className="mt-1 text-xs text-neutral">
                  Paste or upload text — then extract key numbers into your mandate.
                </p>
              </div>
              <HelpTip label="Document extraction" variant="info">
                <p>
                  Click <strong>Extract with Advisor</strong> to parse amounts and suggest target / walkaway /
                  their ask. Works offline (rule-based). In ChatGPT&apos;s browser, the same logic is available as
                  the <code className="font-mono">parse_opening_offer</code> WebMCP tool for richer interpretation.
                </p>
              </HelpTip>
            </div>
            <textarea
              value={openingText}
              onChange={(e) => {
                setOpeningText(e.target.value)
                sync({ openingOfferText: e.target.value })
              }}
              rows={4}
              placeholder="Paste their email, offer letter, or adjuster letter here..."
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept=".txt,.md,.csv,text/plain" className="hidden" onChange={handleFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                Upload text file
                {openingFileName && <span className="text-neutral">({openingFileName})</span>}
              </button>
              <button
                type="button"
                disabled={!openingText.trim() || extracting}
                onClick={() => runExtract()}
                className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-primary hover:bg-indigo-100 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                {extracting ? 'Extracting…' : 'Extract with Advisor'}
              </button>
            </div>

            {extractionPreview?.ok && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-indigo-900">
                    Advisor extraction ({extractionPreview.confidence} confidence)
                  </span>
                  <button type="button" onClick={() => clearExtraction()} className="text-[10px] text-neutral underline">
                    Dismiss
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-700">{extractionPreview.summary}</p>
                <ul className="mt-2 space-y-1">
                  {extractionPreview.notes?.map((n) => (
                    <li key={n} className="text-[11px] text-neutral">
                      • {n}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-neutral">Their ask</div>
                    <div className="font-semibold text-slate-900">
                      {deal.currency}
                      {extractionPreview.extracted.currentAsk?.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-neutral">Sugg. target</div>
                    <div className="font-semibold text-slate-900">
                      {deal.currency}
                      {extractionPreview.extracted.targetPrice?.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-neutral">Sugg. walkaway</div>
                    <div className="font-semibold text-slate-900">
                      {deal.currency}
                      {extractionPreview.extracted.walkawayPrice?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyExtraction}
                  className="mt-3 w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                >
                  Apply suggested values
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                Advisor Link
                <HelpTip label="What is Advisor Link?" variant="info" className="on-dark">
                  <p>
                    <strong>You</strong> stay on this page as the principal. <strong>ChatGPT</strong> (opened on the
                    same URL in its in-app browser) acts as your external advisor — it reads state and calls WebMCP
                    tools like <code className="font-mono">propose_offer</code>, but cannot bypass your walkaway
                    without the HITL approval modal.
                  </p>
                  <p className="mt-2">
                    This toggle is your intent flag. The in-page advisor panel works either way; WebMCP tools register
                    when the browser supports <code className="font-mono">document.modelContext</code>.
                  </p>
                  <p className="mt-2 text-emerald-300">
                    Status: {webmcpReady ? 'WebMCP tools registered' : 'WebMCP not detected in this browser'}
                  </p>
                </HelpTip>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={advisor}
                onClick={() => {
                  setAdvisor(!advisor)
                  sync({ advisorEnabled: !advisor })
                }}
                className={clsx('relative h-6 w-11 rounded-full transition', advisor ? 'bg-primary' : 'bg-slate-600')}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition',
                    advisor ? 'left-[22px]' : 'left-0.5',
                  )}
                />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              ON = plan to use ChatGPT on this URL as your advisor agent. See tooltip for the 3-role model (you /
              counterparty / advisor).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-neutral">System Readiness</div>
            <ul className="mt-4 space-y-3">
              {['Scenario selected', 'Mandate editable', 'Opening offer ready'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-secondary" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => startNegotiation()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600"
          >
            Start Negotiation
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <p className="text-center text-xs text-neutral">Starts the table with their opening message.</p>
        </div>
      </div>
    </div>
  )
}
