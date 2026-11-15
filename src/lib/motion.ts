import type { Transition, Variants } from 'motion/react'

// Shared motion tokens for the student space. Same timing system as the staff
// panels: 150–300 ms, springs damped enough not to wobble.
// Enter states start at opacity 0.01, not 0: Chrome does not count opacity:0
// content as painted, so FCP/LCP would never be recorded.
const HIDDEN = 0.01

export const DURATION = { fast: 0.15, base: 0.22, slow: 0.3 } as const

export const EASE = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
}

export const SPRING: Record<'snappy' | 'soft' | 'drawer', Transition> = {
  snappy: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
  soft: { type: 'spring', stiffness: 260, damping: 30 },
  drawer: { type: 'spring', stiffness: 320, damping: 34 },
}

export const pageVariants: Variants = {
  initial: { opacity: HIDDEN, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
  exit: { opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE.inOut } },
}

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.base } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
}

/** Centred pop on larger screens. */
export const dialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING.snappy },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: DURATION.fast, ease: EASE.inOut } },
}

/** Bottom sheet on phones. */
export const sheetVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: SPRING.drawer },
  exit: { y: '100%', transition: { duration: DURATION.base, ease: EASE.inOut } },
}

/** Small floating menus (notifications, profile). */
export const popoverVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING.snappy },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: DURATION.fast } },
}

export const staggerContainer = (stagger = 0.04, delayChildren = 0): Variants => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren } },
})

export const fadeUpItem: Variants = {
  initial: { opacity: HIDDEN, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
}
