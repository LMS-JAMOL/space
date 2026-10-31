type MarsLogoProps = {
  variant?: 'navy' | 'white' | 'orange' | 'monochrome-white' | 'monochrome-navy'
  className?: string
}

/**
 * Rasmiy MARS logosi — `brand_assets/mars_logo_clean.svg` faylidan
 * (`public/mars-logo.svg`). Ranglar brenddagi ofitsial qiymatlar:
 * matn `#0D0D5B`, halqa `#F44516`.
 *
 * `white` variantlariga SVG shaklida oq qidirish uchun CSS filtri qo'llanadi,
 * shunda alohida fayl nusxasi shart emas.
 */
export default function MarsLogo({ variant = 'navy', className = 'h-[38px] w-auto' }: MarsLogoProps) {
  const light = variant === 'white' || variant === 'monochrome-white'
  const mono = variant === 'monochrome-navy'

  return (
    <img
      src="/mars-logo.svg"
      alt="MARS"
      className={`block max-w-full ${light ? 'brightness-0 invert' : ''} ${mono ? 'brightness-0' : ''} ${className}`}
    />
  )
}
