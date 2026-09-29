/** Handshake + chat bubbles — bold flat mark that reads at ~32px. */
export default function Logo({ className = 'h-10 w-10', showBackground = true }) {
  return (
    <div
      className={
        showBackground ? 'flex items-center justify-center rounded-xl bg-primary/10' : 'flex items-center justify-center'
      }
      style={showBackground ? { width: '2.5rem', height: '2.5rem' } : undefined}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        {/* Amber bubble */}
        <path
          d="M7 11c0-3.3 2.7-6 6-6h10c3.3 0 6 2.7 6 6v4c0 3.3-2.7 6-6 6h-2.5L14 28v-7H13c-3.3 0-6-2.7-6-6v-4Z"
          fill="#F59E0B"
        />
        <circle cx="14.5" cy="14.5" r="1.8" fill="#fff" />
        <circle cx="19" cy="14.5" r="1.8" fill="#fff" />
        <circle cx="23.5" cy="14.5" r="1.8" fill="#fff" />

        {/* Green bubble */}
        <path
          d="M29 6c0-3.3 2.7-6 6-6h12c3.3 0 6 2.7 6 6v4.5c0 3.3-2.7 6-6 6H44l-5.5 4.5v-4.5H35c-3.3 0-6-2.7-6-6V6Z"
          fill="#10B981"
        />
        <circle cx="37" cy="10.5" r="1.8" fill="#fff" />
        <circle cx="41.5" cy="10.5" r="1.8" fill="#fff" />
        <circle cx="46" cy="10.5" r="1.8" fill="#fff" />

        {/* Rose bubble */}
        <path
          d="M49 16.5c0-2.5 2-4.5 4.5-4.5H58c2.5 0 4.5 2 4.5 4.5V21c0 2.5-2 4.5-4.5 4.5h-2l-3.2 2.6V25.5H53.5c-2.5 0-4.5-2-4.5-4.5v-4.5Z"
          fill="#F43F5E"
        />
        <circle cx="53.2" cy="20.2" r="1.35" fill="#fff" />
        <circle cx="56.2" cy="20.2" r="1.35" fill="#fff" />
        <circle cx="59.2" cy="20.2" r="1.35" fill="#fff" />

        {/* Cuffs */}
        <path d="M3 44c0-5 3.2-8.5 8-10l8-3 5.5 11-9 5.5C8.5 51 3 49 3 44Z" fill="#1E3A5F" />
        <circle cx="10" cy="42.5" r="2.1" fill="#F8FAFC" />
        <path d="M61 44c0-5-3.2-8.5-8-10l-8-3-5.5 11 9 5.5C55.5 51 61 49 61 44Z" fill="#164E63" />
        <circle cx="54" cy="42.5" r="2.1" fill="#F8FAFC" />

        {/* Handshake */}
        <path
          d="M16 34c5-4 12-3.5 17 1.5l3 3.2c3.2 3.2 3.5 8 .5 11.2l-3.8 3.8c-3.5 3.2-8.8 2.6-11.5-1.2L14 42.5C10.5 38.5 11.5 33.5 16 34Z"
          fill="#0F766E"
          stroke="#0B4F4A"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M48 34c-5-4-12-3.5-17 1.5l-3 3.2c-3.2 3.2-3.5 8-.5 11.2l3.8 3.8c3.5 3.2 8.8 2.6 11.5-1.2L50 42.5C53.5 38.5 52.5 33.5 48 34Z"
          fill="#14B8A6"
          stroke="#0F766E"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 39c2.8 1.4 5 3.8 6 6.5 1.2-2.6 3.4-4.8 6-6.2-3 .3-5.8 1.6-7.8 3.8-1.4-1.8-2.9-3.2-4.2-4.1Z"
          fill="#99F6E4"
        />
      </svg>
    </div>
  )
}
