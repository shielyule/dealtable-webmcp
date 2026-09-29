/** Coaching content for DealTable — mapped to product concepts, not a textbook dump. */

export const FIVE_CS = [
  {
    id: 'collaboration',
    label: 'Collaboration',
    short: 'Solve together',
    dealtable: 'Use Advisor win-wins and trade term for price — don’t treat the hub as combat.',
    points: [
      'Work with the other side to solve the problem, not beat them.',
      'Invite them into options (term, timing, extras) instead of only pushing price.',
      'Aim for mutual gains that still protect your mandate.',
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    short: 'Listen & clarify',
    dealtable: 'Read counterparty replies closely; send clear counters and instructions in chat.',
    points: [
      'Listen more than you speak — their wording reveals constraints.',
      'Share your needs honestly without revealing your full walkaway too early.',
      'Keep tone respectful so trust (and deals) survive friction.',
    ],
  },
  {
    id: 'compromise',
    label: 'Compromise',
    short: 'Trade, don’t fold',
    dealtable: 'Concession % on Setup is how far you’ll move; never give without getting.',
    points: [
      'Stay flexible on secondary points to protect the ones that matter.',
      'Meet in the middle only when both bottoms lines still hold.',
      'Every move should be a trade: “If you can do X, I can do Y.”',
    ],
  },
  {
    id: 'creativity',
    label: 'Creativity',
    short: 'Expand the pie',
    dealtable: 'Advisor “Hidden win-win terms” are your creativity toolkit mid-deal.',
    points: [
      'Brainstorm options beyond headline price (term, payment timing, extras).',
      'Look past rigid positions to underlying interests.',
      'When talks stall, invent a new package — don’t only haggle the same number.',
    ],
  },
  {
    id: 'credibility',
    label: 'Credibility',
    short: 'Say it, mean it',
    dealtable: 'HITL stops bad accepts; Summary handoffs document what you actually agreed.',
    points: [
      'Be transparent about real limits — bluffing destroys follow-through.',
      'Only accept what you will honour.',
      'Write terms down before you walk away from the table.',
    ],
  },
]

export const RULE_PHASES = [
  {
    id: 'prep',
    title: 'Phase 1 — Approach & preparation',
    subtitle: 'Before you open the Hub',
    rules: [
      {
        title: 'Prepare exhaustively',
        body: 'Research the other party’s constraints, history, and alternatives. Information is leverage.',
        dealtable: 'Read the persona brief on Setup and skim live Tavily comps when they appear in chat.',
      },
      {
        title: 'Define your BATNA',
        body: 'Know your Best Alternative to a Negotiated Agreement before you begin — that is your true walk-away.',
        dealtable: 'Set Walkaway on the Mandate. Crossing it pauses the app for your approval (HITL).',
      },
      {
        title: 'Determine targets and limits',
        body: 'Write your ideal outcome and absolute bottom line so you do not decide emotionally mid-deal.',
        dealtable: 'Target price + walkaway + concession % are your briefing before the meeting.',
      },
      {
        title: 'Focus on interests, not positions',
        body: 'Look past what they say they want and uncover why they want it.',
        dealtable: 'Persona “who / behaviours” and Advisor motivators surface the why behind their ask.',
      },
    ],
  },
  {
    id: 'conduct',
    title: 'Phase 2 — Conducting the negotiation',
    subtitle: 'Inside the Hub',
    rules: [
      {
        title: 'Listen actively',
        body: 'Spend more time listening than speaking. Ask open questions to reveal priorities.',
        dealtable: 'Read each counterparty message before you counter; use chat instructions to probe.',
      },
      {
        title: 'Acknowledge and anchor strategically',
        body: 'Decide whether to open first (set the anchor) or let them speak if you need market data.',
        dealtable: 'Opening offer text + Current Ask are the live anchors; counters move that number.',
      },
      {
        title: 'Trade concessions — never give them away',
        body: 'Use conditional phrasing: “If you can do X, then I can do Y.”',
        dealtable: 'Pair price moves with term or non-price notes; Advisor win-wins are ready-made trades.',
      },
      {
        title: 'Separate people from the problem',
        body: 'Stay respectful with the person while staying firm on the economics.',
        dealtable: 'Challenge the ask, not the agent — HITL is for your limits, not for venting.',
      },
      {
        title: 'Manage your emotions',
        body: 'Stay calm and patient. Anger or desperation clouds judgment and signals weakness.',
        dealtable: 'If the number is below walkaway, pause — Approve / Reject exists so you can reset.',
      },
      {
        title: 'Get everything in writing',
        body: 'Verbal deals drift. Document terms before you close.',
        dealtable: 'Summary + handoff docs (draft agreement, next steps) are your written trail.',
      },
    ],
  },
]
