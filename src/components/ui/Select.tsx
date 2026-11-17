import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export type SelectOption = { value: string; label: string }

type Rect = { left: number; width: number; top?: number; bottom?: number; maxHeight: number }

/**
 * Themed single-select (replaces the browser's unstyleable <select> popup).
 * The menu is portalled to <body> so modals and cards never clip it, flips above the
 * trigger near the bottom of the screen, and is fully keyboard operable
 * (↑/↓/Home/End, Enter/Space, Esc/Tab, type-ahead).
 */
export function Select({ value, onChange, options, className, label, placeholder = '—' }: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  className?: string
  label?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  // A native modal <dialog> sits in the browser's top layer and makes the rest of the page inert,
  // so a menu opened inside one must be rendered inside that dialog, not in <body>.
  const [portal, setPortal] = useState<HTMLElement | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const typed = useRef({ text: '', at: 0 })
  const menuId = useId()
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  const place = useCallback(() => {
    const box = trigger.current?.getBoundingClientRect()
    if (!box) return
    const room = window.innerHeight - box.bottom
    const above = room < 240 && box.top > room
    setRect({
      left: Math.min(box.left, window.innerWidth - Math.max(box.width, 160) - 8),
      width: box.width,
      top: above ? undefined : box.bottom + 6,
      bottom: above ? window.innerHeight - box.top + 6 : undefined,
      maxHeight: Math.max(160, Math.min(320, (above ? box.top : room) - 16)),
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    setPortal(trigger.current?.closest('dialog') || document.body)
    place()
  }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false)
    }
    const onScroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, place])

  useEffect(() => { if (open && rect) optionRefs.current[active]?.focus({ preventScroll: false }) }, [open, active, rect])

  const show = () => { if (!options.length) return; setActive(Math.max(0, selectedIndex)); setOpen(true) }
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  const choose = (index: number) => {
    const next = options[index]
    close()
    if (next && next.value !== value) onChange(next.value)
  }

  const onMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return }
    if (event.key === 'Tab') { event.preventDefault(); close(); return }
    const last = options.length - 1
    const next = event.key === 'ArrowDown' ? Math.min(last, active + 1)
      : event.key === 'ArrowUp' ? Math.max(0, active - 1)
      : event.key === 'Home' ? 0 : event.key === 'End' ? last : null
    if (next != null) { event.preventDefault(); setActive(next); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(active); return }
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const now = Date.now()
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + event.key.toLowerCase(), at: now }
      const found = options.findIndex((option) => option.label.toLowerCase().startsWith(typed.current.text))
      if (found >= 0) setActive(found)
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (open) { onMenuKeyDown(event); return }
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); show() }
        }}
        className={cn(
          'inline-flex h-10 min-w-40 items-center justify-between gap-2 rounded-[10px] border bg-white px-3 text-left text-sm font-medium outline-none transition',
          open ? 'border-mars-400 ring-4 ring-mars-100' : 'border-line hover:border-mars-300 focus-visible:border-mars-400 focus-visible:ring-4 focus-visible:ring-mars-100',
          className,
        )}
      >
        <span className={cn('min-w-0 truncate', !selected && 'text-muted')}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              ref={menu}
              id={menuId}
              role="listbox"
              aria-label={label}
              initial={{ opacity: 0.01, y: rect.top != null ? -4 : 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0.01, y: rect.top != null ? -4 : 4, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              onKeyDown={onMenuKeyDown}
              style={{ position: 'fixed', left: rect.left, top: rect.top, bottom: rect.bottom, minWidth: rect.width, maxWidth: 'min(26rem, calc(100vw - 1rem))', maxHeight: rect.maxHeight, transformOrigin: rect.top != null ? 'top' : 'bottom' }}
              className="z-[1000] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white p-1.5 shadow-xl shadow-navy-900/10"
            >
              {options.map((option, index) => {
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={`${option.value}-${index}`}
                    ref={(node) => { optionRefs.current[index] = node }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onFocus={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(index)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm leading-snug outline-none transition-colors duration-100 max-md:py-3',
                      isSelected ? 'bg-mars-50 font-semibold text-mars-700' : index === active ? 'bg-canvas text-ink' : 'text-ink/80',
                    )}
                  >
                    <span className="min-w-0">{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        portal || document.body,
      )}
    </>
  )
}
