import { ArrowLeft } from 'lucide-react'
import NegotiationPlaybook from '../components/NegotiationPlaybook.jsx'
import { setRoute } from '../lib/dealStore.js'

export default function Playbook() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        type="button"
        onClick={() => setRoute('entrance')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to scenarios
      </button>
      <h1 className="text-2xl font-bold text-slate-900">The Art of Negotiation</h1>
      <p className="mt-1 text-sm text-neutral">Practice-room coaching for DealTable — not a lecture before you start.</p>
      <div className="mt-8">
        <NegotiationPlaybook variant="page" />
      </div>
    </div>
  )
}
