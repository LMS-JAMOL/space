import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, RotateCw, Search, X } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { errorMessage } from '../../services/apiClient'
import { backdropVariants, dialogVariants, DURATION, EASE, sheetVariants, SPRING } from '../../lib/motion'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** True below the `sm` breakpoint, where dialogs become bottom sheets. */
function usePhone() {
  const query = '(max-width: 639px)'
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches))
  useEffect(() => {
    const list = window.matchMedia?.(query)
    if (!list) return
    const onChange = () => setPhone(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])
  return phone
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
const variants: Record<Variant, string> = {
  primary: 'bg-mars-500 text-white hover:bg-mars-600',
  secondary: 'bg-white text-ink border border-line hover:border-mars-300 hover:text-mars-600',
  ghost: 'text-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  dark: 'bg-navy-700 text-white hover:bg-navy-600 border border-white/10',
}

export function Button({
  variant = 'primary', size = 'md', loading, className, children, disabled, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' ? 'h-8 px-3 text-sm' : size === 'lg' ? 'h-12 px-6' : 'h-10 px-4 text-sm',
        variants[variant], className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  // Skip the default background when the caller supplies one — Tailwind can't resolve two bg-* by order.
  const customBg = /(^|\s)bg-/.test(className ?? '')
  return <div className={cn('rounded-lg shadow-card', !customBg && 'bg-white', className)}>{children}</div>
}

export function PageHeader({ title, subtitle, actions, dark }: { title: string; subtitle?: string; actions?: ReactNode; dark?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        <h1 className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight', dark && 'text-white')}>{title}</h1>
        {subtitle && <p className={cn('mt-1 text-sm', dark ? 'text-navy-300' : 'text-muted')}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const tones = {
  gray: 'bg-slate-100 text-slate-600', orange: 'bg-mars-50 text-mars-600', green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700', red: 'bg-red-50 text-red-600', yellow: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700',
}
export type Tone = keyof typeof tones
export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>{children}</span>
}

export function Progress({ value, className, dark }: { value: number; className?: string; dark?: boolean }) {
  const width = `${Math.max(0, Math.min(100, value))}%`
  return (
    <div className={cn('h-2 rounded-full overflow-hidden', dark ? 'bg-white/10' : 'bg-slate-100', className)}>
      <motion.div className="h-full rounded-full bg-gradient-to-r from-mars-400 to-mars-600" initial={{ width: 0 }} animate={{ width, transition: { duration: 0.3, ease: EASE.out } }} />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />
}

export function SkeletonGrid({ count = 6, className = 'h-48' }: { count?: number; className?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className={className} />)}
    </div>
  )
}

export function EmptyState({ title, text, icon, action }: { title: string; text?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0.01, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.slow } }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center"
    >
      <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1, transition: SPRING.soft }} className="mb-3 grid size-14 place-items-center rounded-2xl bg-mars-50 text-mars-500">{icon ?? <Inbox />}</motion.div>
      <p className="font-bold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({ error, onRetry, dark }: { error: unknown; onRetry?: () => void; dark?: boolean }) {
  const { tr } = useLanguage()
  return (
    <motion.div role="alert" initial={{ opacity: 0.01, y: 6 }} animate={{ opacity: 1, y: 0, transition: { duration: DURATION.slow } }} className={cn('flex flex-col items-center rounded-2xl px-6 py-12 text-center', dark ? 'bg-navy-800 text-white' : 'bg-red-50/60 border border-red-100')}>
      <AlertTriangle className="mb-2 size-8 text-red-500" />
      <p className="font-bold">{tr("Ma'lumotni yuklab bo'lmadi")}</p>
      <p className={cn('mt-1 text-sm', dark ? 'text-navy-300' : 'text-muted')}>{errorMessage(error)}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}><RotateCw className="size-4" />{tr('Qayta urinish')}</Button>}
    </motion.div>
  )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { tr } = useLanguage()
  return (
    <label className="relative block w-full sm:w-72">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? tr('Qidirish...')} aria-label={placeholder ?? tr('Qidirish...')}
        className="h-10 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-sm outline-none transition focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
    </label>
  )
}

export function Chips<T extends string>({ options, value, onChange, dark }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; dark?: boolean }) {
  const scope = useId()
  return (
    <LayoutGroup id={scope}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button key={o.value} type="button" aria-pressed={active} onClick={() => onChange(o.value)}
              className={cn('relative h-9 rounded-xl px-3.5 text-sm font-semibold transition-colors',
                active ? 'text-white'
                  : dark ? 'bg-navy-800 text-navy-300 hover:text-white' : 'bg-white border border-line text-muted hover:text-ink')}>
              {/* One pill slides to the chosen chip. */}
              {active && <motion.span layoutId="chip-pill" className="absolute inset-0 rounded-xl bg-mars-500 shadow-sm shadow-mars-500/30" transition={SPRING.snappy} aria-hidden="true" />}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

// Themed select with a portalled, keyboard-operable menu (replaces the native <select>).
export { Select } from './Select'

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const { tr } = useLanguage()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={tr('Oldingi')}><ChevronLeft className="size-4" /></Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Button key={p} size="sm" variant={p === page ? 'primary' : 'ghost'} onClick={() => onChange(p)}>{p}</Button>
      ))}
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label={tr('Keyingi')}><ChevronRight className="size-4" /></Button>
    </div>
  )
}

/**
 * Animated dialog: centred on larger screens, a bottom sheet on phones. Escape and
 * the backdrop close it; Tab stays inside; focus returns to the trigger.
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  const { tr } = useLanguage()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const phone = usePhone()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => {
      // Start on the first field only with a mouse; on touch it would pop the keyboard over the sheet.
      const fine = window.matchMedia?.('(pointer: fine)').matches
      const field = fine ? panelRef.current?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') : null
      ;(field ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current)?.focus({ preventScroll: true })
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCloseRef.current(); return }
      const panel = panelRef.current
      if (e.key !== 'Tab' || !panel) return
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!panel.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" initial="initial" animate="animate" exit="exit">
          <motion.div variants={backdropVariants} className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            variants={phone ? sheetVariants : dialogVariants}
            className={cn('relative flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-lift outline-none', size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md')}
          >
            <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
              <h2 id={titleId} className="font-bold">{title}</h2>
              <button type="button" onClick={onClose} className="-mr-2 grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-canvas hover:text-ink sm:size-9" aria-label={tr('Yopish')}><X className="size-5" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
            {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead><tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
          {head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const inputCls = 'h-10 w-full rounded-[10px] border border-line bg-white px-3 text-sm outline-none focus:border-mars-400 focus:ring-4 focus:ring-mars-100'

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  const scope = useId()
  return (
    <LayoutGroup id={scope}>
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 border border-line w-fit max-w-full">
        {tabs.map((t) => {
          const active = value === t.value
          return (
            <button key={t.value} type="button" aria-pressed={active} onClick={() => onChange(t.value)}
              className={cn('relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors', active ? 'text-white' : 'text-muted hover:text-ink')}>
              {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-ink" transition={SPRING.snappy} aria-hidden="true" />}
              <span className="relative">{t.label}</span>
              {t.count !== undefined && <span className={cn('relative rounded-md px-1.5 text-xs', active ? 'bg-white/20' : 'bg-canvas')}>{t.count}</span>}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export function Notice({ tone = 'yellow', children }: { tone?: 'yellow' | 'blue'; children: ReactNode }) {
  return (
    <div className={cn('mb-5 flex gap-3 rounded-2xl border px-4 py-3 text-sm', tone === 'yellow' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900')}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" /><div>{children}</div>
    </div>
  )
}
