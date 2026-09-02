import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addPersonaBehavior, removePersonaBehavior } from '../lib/dealStore.js'

export default function PersonaBehaviorEditor({ behaviors }) {
  const [draft, setDraft] = useState('')

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold text-slate-800">Adjust how they act (optional)</div>
      <p className="mt-1 text-[11px] text-neutral">
        Add or remove behavior rules for this session. Keep them short — e.g. &quot;Always cites policy section
        4.2&quot;.
      </p>
      <ul className="mt-3 space-y-2">
        {behaviors.map((b, i) => (
          <li key={b} className="flex items-start gap-2 text-xs text-slate-700">
            <span className="flex-1">{b}</span>
            <button type="button" onClick={() => removePersonaBehavior(i)} className="text-neutral hover:text-red-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add behavior rule..."
          className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              addPersonaBehavior(draft)
              setDraft('')
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (draft.trim()) {
              addPersonaBehavior(draft)
              setDraft('')
            }
          }}
          className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-primary shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
