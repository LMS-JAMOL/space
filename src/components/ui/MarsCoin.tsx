import { useId } from 'react'

/**
 * The MARS Coin: a gold coin with the orange rocket and a small "MARS" mark, with a darker
 * rim at the bottom so it reads as a coin, not a flat icon. Use it wherever coins are shown
 * (balances, prices, rewards). Decorative by default; pass `title` when it carries meaning alone.
 */
export function MarsCoin({ size = 20, className, title }: { size?: number; className?: string; title?: string }) {
  const id = useId().replace(/:/g, '')
  const face = `mc-face-${id}`
  const rim = `mc-rim-${id}`
  const shine = `mc-shine-${id}`
  const tiny = size < 22
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true} aria-label={title} focusable="false">
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={face} cx="38%" cy="32%" r="72%">
          <stop offset="0" stopColor="#FFF07A" />
          <stop offset=".45" stopColor="#FFD12E" />
          <stop offset="1" stopColor="#F7A912" />
        </radialGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#E26A0C" />
        </linearGradient>
        <radialGradient id={shine} cx="30%" cy="22%" r="40%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* edge: the coin's thickness, visible below the face */}
      <circle cx="33.5" cy="34.5" r="28" fill={`url(#${rim})`} />
      {/* face */}
      <circle cx="32" cy="31" r="28" fill={`url(#${face})`} />
      <circle cx="32" cy="31" r="22.5" fill="none" stroke="#F2A10F" strokeOpacity=".55" strokeWidth="1.6" />
      <circle cx="32" cy="31" r="28" fill={`url(#${shine})`} />
      {/* rocket (lucide "rocket" geometry), slightly tilted like the reference */}
      <g transform={tiny ? 'translate(14.8 14.5) scale(1.4)' : 'translate(16.7 13.3) scale(1.25)'} fill="none" stroke="#F26A1B"
        strokeWidth={tiny ? 2.3 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </g>
      {/* the small "MARS" mark is unreadable below ~22px, so tiny coins omit it */}
      {!tiny && (
        <text x="32" y="50.5" textAnchor="middle" fontSize="4.6" fontWeight="800" letterSpacing=".5"
          fill="#E0761A" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">MARS</text>
      )}
    </svg>
  )
}

export default MarsCoin
