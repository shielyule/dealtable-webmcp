/** DealTable handshake mark — brand sheet assets in /public. */
export default function Logo({ className = 'h-10 w-10', showBackground = true, variant = 'app' }) {
  // app = solid teal square (sidebar / small); mark = line handshake on cream
  const src = variant === 'mark' ? '/logo-handshake.png' : '/icon-square.png'
  return (
    <div
      className={
        showBackground && variant === 'mark'
          ? 'flex items-center justify-center overflow-hidden rounded-xl bg-[#F4F6F3]'
          : 'flex items-center justify-center overflow-hidden rounded-xl'
      }
      style={showBackground ? { width: '2.5rem', height: '2.5rem' } : undefined}
    >
      <img src={src} alt="DealTable" className={`${className} object-contain`} draggable={false} />
    </div>
  )
}
