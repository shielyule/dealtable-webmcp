import { useState } from 'react'
import clsx from 'clsx'
import {
  ArrowRight,
  BarChart3,
  Building2,
  ExternalLink,
  HandCoins,
  Lightbulb,
  Paperclip,
  Send,
  Shield,
  AlertTriangle,
  User,
} from 'lucide-react'
import HelpTip from '../components/HelpTip.jsx'
import PersonaBrief from '../components/PersonaBrief.jsx'
import {
  getPersona,
  holdFirm,
  openHitl,
  proposeOffer,
  sendInstruction,
  setRoute,
} from '../lib/dealStore.js'
import { useDeal } from '../lib/useDeal.js'

function formatPrice(deal, value) {
  if (deal.unit) return `${deal.currency}${value}${deal.unit}`
  return `${deal.currency}${Number(value).toLocaleString()}`
}

function MarketCheck({ market }) {
  if (!market) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
      <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-neutral">Market check · Tavily</div>
      {market.status === 'loading' && <p className="mt-2 text-neutral">Searching live comps…</p>}
      {market.error && (
        <p className="mt-2 text-amber-800">
          {market.error}. The negotiation continues. The counterparty price is still the on-page rules.
        </p>
      )}
      {market.query && !market.error && <p className="mt-2 text-neutral">{market.query}</p>}
      {market.sources?.length > 0 && (
        <ul className="mt-2 space-y-2">
          {market.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {source.title}
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
              {source.content && <p className="mt-0.5 leading-relaxed text-neutral">{source.content}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MessageBubble({ message }) {
  if (message.from === 'system' && message.kind !== 'tool') {
    return (
      <div className="rounded-lg bg-indigo-50 px-4 py-2.5 text-center text-xs text-indigo-700">
        {message.text}
      </div>
    )
  }

  if (message.kind === 'tool' || (message.from === 'system' && message.text?.includes('Querying'))) {
    return (
      <div className="flex justify-center">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-neutral">
          {message.text}
        </span>
      </div>
    )
  }

  const isPrincipal = message.from === 'principal'

  return (
    <div className={clsx('flex gap-3', isPrincipal ? 'flex-row-reverse' : '')}>
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isPrincipal ? 'bg-indigo-100 text-primary' : 'bg-slate-100 text-neutral',
        )}
      >
        {isPrincipal ? (
          <User className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <Building2 className="h-4 w-4" strokeWidth={1.5} />
        )}
      </div>
      <div className={clsx('max-w-[75%]', isPrincipal ? 'text-right' : '')}>
        <div className="mb-1 flex items-center gap-2 text-xs text-neutral">
          {!isPrincipal && <span className="font-medium text-slate-700">{message.author}</span>}
          {isPrincipal && <span className="font-medium text-slate-700">{message.author || 'You'}</span>}
          <span>{message.time}</span>
          {message.processing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-tertiary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
              Processing
            </span>
          )}
        </div>
        <div
          className={clsx(
            'rounded-xl border px-4 py-3 text-sm leading-relaxed',
            isPrincipal
              ? 'border-indigo-200 bg-indigo-50/80 text-slate-800'
              : 'border-slate-200 bg-white text-slate-700',
          )}
        >
          {message.text}
          {message.attachment && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
              <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span>
                Ref: {message.attachment.name}
                {message.attachment.size && ` (${message.attachment.size})`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AdvisorRail({ advisor, audit, deal, persona, customScenario }) {
  const [tab, setTab] = useState('advisor')

  const handleCounter = () => {
    const mid = Math.round(deal.targetPrice + (deal.currentAsk - deal.targetPrice) * 0.35)
    const result = proposeOffer({
      price: mid,
      note: `Counter at ${formatPrice(deal, mid)} with non-price concessions.`,
    })
    if (result?.needsHitl) openHitl(result)
  }

  const handleHoldFirm = () => holdFirm()

  const handleAccept = () => {
    const overTerm = deal.termYears > deal.maxTermYears
    openHitl({
      kind: 'accept',
      reason: overTerm
        ? `Term (${deal.termYears}yr) exceeds mandate (max ${deal.maxTermYears}yr). Approve override to close?`
        : `Accept current offer at ${formatPrice(deal, deal.currentAsk)}?`,
      label: `${formatPrice(deal, deal.currentAsk)}`,
      price: deal.currentAsk,
      termYears: deal.termYears,
      note: `Accepted at ${formatPrice(deal, deal.currentAsk)}.`,
    })
  }

  const handleHitlDemo = () => {
    const price = deal.walkawayPrice - 1
    const result = proposeOffer({
      price,
      note: 'Final counter before walkaway.',
    })
    if (result?.needsHitl) openHitl(result)
  }

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-slate-200/80 bg-white">
      <div className="flex border-b border-slate-200">
        {[
          { id: 'advisor', label: 'Advisor' },
          { id: 'agent', label: 'Agent' },
          { id: 'audit', label: 'Audit' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex flex-1 flex-col items-center px-2 py-2.5 text-xs font-semibold transition',
              tab === t.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-neutral hover:text-slate-700',
            )}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <p className="border-b border-slate-100 px-4 py-2 text-[10px] leading-relaxed text-neutral">
        {tab === 'advisor' && 'Strategic read on your position. Updates when you counter.'}
        {tab === 'agent' && 'Who you are negotiating with and how they behave in this session.'}
        {tab === 'audit' && 'Live tail of the last 6 events — tool calls, counters, HITL decisions.'}
      </p>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'agent' ? (
          <PersonaBrief persona={persona} orgOverride={customScenario?.counterparty} />
        ) : tab === 'advisor' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Lightbulb className="h-4 w-4 text-primary" strokeWidth={1.5} />
                Strategic Position
                <HelpTip label="Strategic Position" variant="info" align="right">
                  Compares your target to their current ask and estimates odds of landing your target without breaching walkaway.
                </HelpTip>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral">{advisor.position}</p>
              <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
                Probability of reaching {formatPrice(deal, deal.targetPrice)} target:{' '}
                <strong>{advisor.probability}</strong>
              </div>
              <p className="mt-2 text-[10px] text-neutral">Higher leverage % = more room to push; drops as their ask stays high.</p>
            </div>

            {advisor.termAlert && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                  Term Threshold Alert
                  <HelpTip label="Term alert" variant="warning" align="right">
                    Fires when term length or concession pattern conflicts with your mandate (e.g. max 5-year lease).
                  </HelpTip>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-amber-700">{advisor.termAlert}</p>
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral">
                Suggested Actions
                <HelpTip label="Suggested actions" variant="info" align="right">
                  Shortcuts that send offers or instructions to the table. Risky accepts still go through HITL if they breach your rules.
                </HelpTip>
              </div>
              <p className="mb-2 text-[10px] text-neutral">Click to execute — counterparty will respond automatically.</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCounter}
                  className="flex w-full items-center justify-between rounded-xl border border-primary/30 bg-indigo-50 px-3 py-2.5 text-left text-xs font-medium text-primary hover:bg-indigo-100"
                >
                  Counter: {formatPrice(deal, Math.round(deal.targetPrice + (deal.currentAsk - deal.targetPrice) * 0.35))}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleHitlDemo}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-left text-xs font-medium text-amber-900 hover:bg-amber-100"
                >
                  Counter {formatPrice(deal, deal.walkawayPrice - 1)} — triggers HITL
                  <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleHoldFirm}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hold Firm at {formatPrice(deal, deal.targetPrice)}
                  <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Accept Offer ({formatPrice(deal, deal.currentAsk)})
                  <HandCoins className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-[10px] text-neutral">
              Showing newest first. Export the full trace from <strong>Audit Log</strong> in the sidebar.
            </p>
            {audit.slice(-6).reverse().map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase text-primary">
                    {entry.type}
                  </span>
                  <span className="font-mono text-[10px] text-neutral">{entry.timestamp}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-800">{entry.title}</div>
                {entry.detail && (
                  <p className="mt-0.5 text-[11px] text-neutral">{entry.detail}</p>
                )}
              </div>
            ))}
            {audit.length === 0 && (
              <p className="text-xs text-neutral">No audit entries yet.</p>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default function Hub() {
  const { deal, messages, personaId, customScenario, advisor, audit, status, market } = useDeal()
  const persona = personaId ? getPersona(personaId) : null
  const counterpartyOrg = customScenario?.counterparty || persona?.org || 'Counterparty Agent'
  const [input, setInput] = useState('')

  if (!deal) {
    return (
      <div className="p-8 text-center text-sm text-neutral">
        No active negotiation.{' '}
        <button type="button" className="text-primary underline" onClick={() => setRoute('entrance')}>
          Pick a scenario
        </button>
      </div>
    )
  }

  const handleSend = () => {
    if (!input.trim()) return
    sendInstruction(input)
    setInput('')
  }

  const askAboveTarget = deal.currentAsk > deal.targetPrice

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200/80 bg-white px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">{deal.title}</h1>
          <p className="mt-0.5 text-sm text-neutral">Counter-party: {counterpartyOrg}</p>
          <div className="mt-4 flex gap-4">
            <div className="rounded-xl border border-slate-200 bg-page px-5 py-3">
              <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-neutral">
                Target {deal.unit ? 'Rent' : 'Price'}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {formatPrice(deal, deal.targetPrice)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-page px-5 py-3">
              <div className="font-mono text-[10px] font-medium uppercase tracking-wide text-neutral">
                Current Ask
              </div>
              <div
                className={clsx(
                  'mt-1 text-lg font-bold',
                  askAboveTarget ? 'text-red-500' : 'text-slate-900',
                )}
              >
                {formatPrice(deal, deal.currentAsk)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {advisor.offTrack && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <strong>Advisor:</strong> {advisor.offTrack}{' '}
                <button type="button" className="font-semibold underline" onClick={() => setRoute('setup')}>
                  Review mandate
                </button>
              </div>
            )}
            {status === 'accepted' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
                Negotiation complete.{' '}
                <button type="button" className="font-semibold underline" onClick={() => setRoute('summary')}>
                  View summary
                </button>
              </div>
            )}
            <MarketCheck market={market} />
            {messages.length === 0 && (
              <div className="rounded-lg bg-indigo-50 px-4 py-2.5 text-center text-xs text-indigo-700">
                Negotiation initiated. Context loaded: Previous lease history, current market comps.
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <button type="button" className="rounded-xl p-2.5 text-neutral hover:bg-slate-50">
              <Paperclip className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Instruct your agent or manually reply..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              Send
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="mx-auto mt-2 flex max-w-3xl gap-2">
            <button
              type="button"
              onClick={() => holdFirm()}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Hold Firm
            </button>
            <button
              type="button"
              onClick={() => {
                const overTerm = deal.termYears > deal.maxTermYears
                openHitl({
                  kind: 'accept',
                  reason: overTerm
                    ? `Term (${deal.termYears}yr) exceeds mandate (max ${deal.maxTermYears}yr). Approve override to close?`
                    : `Accept current offer at ${formatPrice(deal, deal.currentAsk)}?`,
                  label: `${formatPrice(deal, deal.currentAsk)}`,
                  price: deal.currentAsk,
                  termYears: deal.termYears,
                  note: `Accepted at ${formatPrice(deal, deal.currentAsk)}.`,
                })
              }}
              className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Accept
            </button>
          </div>
        </div>
      </div>

      <AdvisorRail advisor={advisor} audit={audit} deal={deal} persona={persona} customScenario={customScenario} />
    </div>
  )
}
