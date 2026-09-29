import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SCENARIOS, setRoute, startCustomScenario } from '../lib/dealStore.js'

const TEMPLATE_ORDER = [
  'lease',
  'freelance',
  'salary',
  'vendor',
  'residential',
  'insurance',
  'usedcar',
  'renovation',
  'flatbuy',
]

export default function CustomScenario() {
  const [templateId, setTemplateId] = useState('freelance')
  const [title, setTitle] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [walkawayPrice, setWalkawayPrice] = useState('')
  const [openingOffer, setOpeningOffer] = useState('')

  const template = SCENARIOS[templateId]

  const handleContinue = () => {
    startCustomScenario({
      title: title || template.title,
      counterparty,
      templateId,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      walkawayPrice: walkawayPrice ? Number(walkawayPrice) : undefined,
      openingOffer,
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button
        type="button"
        onClick={() => setRoute('entrance')}
        className="mb-6 flex items-center gap-2 text-sm text-neutral hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to scenarios
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Build your scenario</h1>
      <p className="mt-2 text-sm text-neutral">
        Choose a negotiation <strong>type</strong> (loads defaults + counterparty style), then customize the title and
        names.
      </p>

      <div className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div>
          <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
            Negotiation type
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {TEMPLATE_ORDER.map((id) => (
              <option key={id} value={id}>
                {SCENARIOS[id].title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral">{template.subtitle}</p>
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
            Your title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={template.title}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
            Counterparty name (optional)
          </label>
          <input
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder="e.g. Acme Procurement Agent"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
              Target (optional)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={String(template.targetPrice)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
              Walkaway (optional)
            </label>
            <input
              type="number"
              value={walkawayPrice}
              onChange={(e) => setWalkawayPrice(e.target.value)}
              placeholder={String(template.walkawayPrice)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wide text-neutral">
            Their opening offer (optional)
          </label>
          <textarea
            value={openingOffer}
            onChange={(e) => setOpeningOffer(e.target.value)}
            rows={3}
            placeholder={template.openingOffer}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          Continue to mandate
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
