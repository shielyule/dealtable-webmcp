export default function Logo({ className = 'h-10 w-10', showBackground = true }) {
  return (
    <div
      className={showBackground ? 'flex items-center justify-center rounded-xl bg-primary/10' : 'flex items-center justify-center'}
      style={showBackground ? { width: '2.5rem', height: '2.5rem' } : undefined}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        {/* ChatGPT-inspired interleaved knot — simplified, original geometry */}
        <path
          d="M32 8c-2.2 0-4.2 1.1-5.4 2.9L14.6 22.1a7.2 7.2 0 0 0 0 7.8l11.2 19.4A6.2 6.2 0 0 0 32 52c2.2 0 4.2-1.1 5.4-2.9l11-19.1a7.2 7.2 0 0 0 0-7.8L37.4 10.9A6.2 6.2 0 0 0 32 8Z"
          fill="#4F46E5"
          opacity="0.15"
        />
        <path
          d="M32 14c-1.5 0-2.9.8-3.7 2L20.5 28.2a4.8 4.8 0 0 0 0 5.2l7.8 13.5c.8 1.3 2.2 2.1 3.7 2.1s2.9-.8 3.7-2l7.6-13.2a4.8 4.8 0 0 0 0-5.2L35.7 16c-.8-1.2-2.2-2-3.7-2Z"
          stroke="#4F46E5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M26 22.5 32 32l6-9.5M26 41.5 32 32l6 9.5M20.5 32h23"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Spark / star accent */}
        <path
          d="M48 12 49.8 16.2 54 18l-4.2 1.8L48 24l-1.8-4.2L42 18l4.2-1.8L48 12Z"
          fill="#10B981"
        />
        <path
          d="M14 44 15.2 47.1 18 48.2l-2.8 1.1L14 52l-1.2-2.7L10 48.2l2.8-1.1L14 44Z"
          fill="#F59E0B"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
