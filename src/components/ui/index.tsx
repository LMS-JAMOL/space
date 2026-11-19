import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Info, Loader2, RotateCw, Search, X, XCircle } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { describeError } from '../../lib/apiError'
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
// mars-600 (not 500) behind white text: 500 is 3.6:1, 600 passes AA (5:1) for 14px labels.
const variants: Record<Variant, string> = {
  primary: 'bg-mars-600 text-white shadow-sm shadow-mars-600/20 hover:bg-mars-700 active:bg-mars-800',
  secondary: 'border border-line bg-white text-ink hover:border-mars-300 hover:bg-mars-50/40 hover:text-mars-700 active:bg-mars-50',
  ghost: 'text-muted hover:bg-canvas hover:text-ink active:bg-black/5',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200/70',
  dark: 'border border-white/10 bg-navy-700 text-white hover:bg-navy-600',
}

export function Button({
  variant = 'primary', size = 'md', loading, className, children, disabled, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50',
        // Phones get 44px targets; denser desktop rows keep the compact heights.
        size === 'sm' ? 'h-10 px-3 text-sm sm:h-9' : size === 'lg' ? 'h-12 px-6' : 'h-11 px-4 text-sm sm:h-10',
        variants[variant], className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  // Skip the default background/border colour when the caller supplies one — Tailwind can't resolve two by order.
  const customBg = /(^|\s)bg-/.test(className ?? '')
  const customBorder = /(^|\s)border-(?!0|t-|b-|l-|r-|x-|y-|dashed|line)[a-z]/.test(className ?? '')
  return <div className={cn('rounded-2xl border shadow-card', !customBorder && 'border-line', !customBg && 'bg-white', className)}>{children}</div>
}

/**
 * One header pattern for every page: optional back link, title (the page's only h1),
 * a subtitle and an actions slot that drops under the title on phones.
 */
export function PageHeader({ title, subtitle, actions, dark, back, eyebrow }: {
  title: string; subtitle?: string; actions?: ReactNode; dark?: boolean
  back?: { to: string; label: string }; eyebrow?: ReactNode
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {back && (
        <Link to={back.to} className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-white hover:text-ink sm:min-h-9">
          <ArrowLeft className="size-4" aria-hidden="true" />{back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5 text-sm font-semibold text-mars-600">{eyebrow}</div>}
          <h1 className={cn('text-2xl font-extrabold tracking-tight text-balance sm:text-[28px] sm:leading-9', dark && 'text-white')}>{title}</h1>
          {subtitle && <p className={cn('mt-1.5 max-w-2xl text-sm leading-relaxed', dark ? 'text-navy-300' : 'text-muted')}>{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/** A titled block of a page: h2 + optional hint and action, one spacing rhythm below. */
export function Section({ title, description, action, children, className }: {
  title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 sm:mb-4">
        <div className="min-w-0">
          <h2 id={id} className="text-lg font-extrabold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Card heading row: icon tile + title (+ hint) on the left, an action on the right. */
export function CardHeader({ title, description, icon, action, as: Tag = 'h2', className }: {
  title: ReactNode; description?: ReactNode; icon?: ReactNode; action?: ReactNode; as?: 'h2' | 'h3'; className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-start gap-3', className)}>
      {icon && <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-mars-50 text-mars-600 [&>svg]:size-5" aria-hidden="true">{icon}</div>}
      <div className="min-w-0 flex-1 self-center">
        <Tag className="font-bold leading-snug">{title}</Tag>
        {description && <p className="mt-0.5 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

const alertTones = {
  info: { box: 'border-sky-200 bg-sky-50 text-sky-950', icon: Info, ic: 'text-sky-700' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-950', icon: AlertTriangle, ic: 'text-amber-700' },
  danger: { box: 'border-red-200 bg-red-50 text-red-950', icon: XCircle, ic: 'text-red-600' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-950', icon: CheckCircle2, ic: 'text-emerald-700' },
}
export type AlertTone = keyof typeof alertTones

/** Inline message in a page or card. Pass `role` only when it announces a change. */
export function InlineAlert({ tone = 'info', title, children, action, role, className }: {
  tone?: AlertTone; title?: ReactNode; children?: ReactNode; action?: ReactNode; role?: 'alert' | 'status'; className?: string
}) {
  const t = alertTones[tone]
  const Icon = t.icon
  return (
    <div role={role} className={cn('flex flex-wrap items-start gap-x-3 gap-y-2 rounded-xl border px-4 py-3 text-sm', t.box, className)}>
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', t.ic)} aria-hidden="true" />
      <div className="min-w-0 flex-1 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cn(title ? 'mt-0.5' : 'font-medium')}>{children}</div>}
      </div>
      {action && <div className="w-full pl-[30px] sm:w-auto sm:self-center sm:pl-0">{action}</div>}
    </div>
  )
}

const tones = {
  gray: 'bg-slate-100 text-slate-700', orange: 'bg-mars-50 text-mars-700', green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-sky-50 text-sky-700', red: 'bg-red-50 text-red-700', yellow: 'bg-amber-50 text-amber-800', violet: 'bg-violet-50 text-violet-700',
}
export type Tone = keyof typeof tones
export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>{children}</span>
}

export function Progress({ value, className, dark, label }: { value: number; className?: string; dark?: boolean; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)}
      className={cn('h-2 overflow-hidden rounded-full', dark ? 'bg-white/10' : 'bg-mars-100/70', className)}>
      <motion.div className="h-full rounded-full bg-mars-500" initial={{ width: 0 }} animate={{ width: `${clamped}%`, transition: { duration: 0.3, ease: EASE.out } }} />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />
}

export function SkeletonGrid({ count = 6, className = 'h-48', grid = 'sm:grid-cols-2 xl:grid-cols-3' }: { count?: number; className?: string; grid?: string }) {
  const { tr } = useLanguage()
  return (
    <div role="status" aria-label={tr('Yuklanmoqda')} className={cn('grid gap-4', grid)}>
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className={className} />)}
    </div>
  )
}

/** Empty result: icon + title + hint + optional action. `compact` sits inside a card. */
export function EmptyState({ title, text, icon, action, compact }: { title: string; text?: string; icon?: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0.01, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.slow } }}
      className={cn('flex flex-col items-center justify-center text-center',
        compact ? 'rounded-xl bg-canvas/70 px-4 py-6' : 'rounded-2xl border border-dashed border-line bg-white px-6 py-12 sm:py-14')}
    >
      <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1, transition: SPRING.soft }} aria-hidden="true"
        className={cn('grid place-items-center bg-mars-50 text-mars-600', compact ? 'mb-2 size-10 rounded-xl [&>svg]:size-5' : 'mb-3 size-14 rounded-2xl')}>{icon ?? <Inbox />}</motion.div>
      <p className={cn('font-bold', compact && 'text-sm')}>{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}

/**
 * Section-level failure: status title + safe message + backend details.
 * Retry is offered only when lib/httpStatus says the request can succeed.
 */
export function ErrorState({ error, onRetry, dark, compact }: { error: unknown; onRetry?: () => void; dark?: boolean; compact?: boolean }) {
  const { tr } = useLanguage()
  const info = describeError(error)
  if (info.canceled) return null
  return (
    <motion.div role="alert" initial={{ opacity: 0.01, y: 6 }} animate={{ opacity: 1, y: 0, transition: { duration: DURATION.slow } }}
      className={cn('flex flex-col items-center rounded-2xl text-center', compact ? 'px-4 py-6' : 'px-6 py-12', dark ? 'bg-navy-800 text-white' : 'border border-red-100 bg-red-50/60')}>
      <AlertTriangle className={cn('mb-2 text-red-600', compact ? 'size-6' : 'size-8')} aria-hidden="true" />
      <p className="font-bold">{tr(info.title)}</p>
      <p className={cn('mt-1 max-w-md text-sm', dark ? 'text-navy-300' : 'text-muted')}>{tr(info.message)}</p>
      {info.details.length > 0 && (
        <ul className="mt-2 max-w-md space-y-1 text-left text-xs opacity-80">
          {info.details.map((detail) => <li key={detail.field}><span className="font-mono">{detail.field}</span> — {detail.message}</li>)}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {info.status != null && (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium tabular-nums', dark ? 'bg-navy-700 text-navy-200' : 'bg-white text-muted')}>HTTP {info.status}</span>
        )}
        {onRetry && info.retryable && (
          <Button variant="secondary" size="sm" onClick={onRetry}><RotateCw className="size-4" aria-hidden="true" />{tr('Qayta urinish')}</Button>
        )}
      </div>
    </motion.div>
  )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { tr } = useLanguage()
  return (
    <label className="relative block w-full sm:w-72">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? tr('Qidirish...')} aria-label={placeholder ?? tr('Qidirish...')}
        className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-muted hover:border-mars-200 focus:border-mars-400 focus:ring-4 focus:ring-mars-100 sm:h-10" />
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
              className={cn('relative h-10 rounded-xl px-3.5 text-sm font-semibold transition-colors duration-150 sm:h-9',
                active ? 'text-white'
                  : dark ? 'bg-navy-800 text-navy-300 hover:text-white' : 'border border-line bg-white text-muted hover:border-mars-200 hover:text-ink')}>
              {/* One pill slides to the chosen chip. */}
              {active && <motion.span layoutId="chip-pill" className="absolute inset-0 rounded-xl bg-mars-600 shadow-sm shadow-mars-600/25" transition={SPRING.snappy} aria-hidden="true" />}
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
 * `busy` marks a pending action (aria-busy + a thin bar under the title).
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', busy }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg'; busy?: boolean
}) {
  const { tr } = useLanguage()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
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
        <motion.div key="modal" className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" initial="initial" animate="animate" exit="exit">
          <motion.div variants={backdropVariants} className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            aria-busy={busy || undefined}
            tabIndex={-1}
            variants={phone ? sheetVariants : dialogVariants}
            className={cn('relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift outline-none sm:rounded-3xl', size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md')}
          >
            <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" aria-hidden="true" />
            <div className="relative flex shrink-0 items-start justify-between gap-3 border-b border-line bg-white px-5 py-3">
              <div className="min-w-0 py-1.5">
                <h2 id={titleId} className="text-lg font-bold leading-snug">{title}</h2>
                {description && <p id={descId} className="mt-0.5 text-sm text-muted">{description}</p>}
              </div>
              <button type="button" onClick={onClose} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink sm:size-10" aria-label={tr('Yopish')}><X className="size-5" aria-hidden="true" /></button>
              {busy && <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-mars-500" aria-hidden="true" />}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
            {footer && <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-line bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:[&>*]:flex-1">{footer}</div>}
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
          {head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}
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

export const inputCls = 'h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted hover:border-mars-200 focus:border-mars-400 focus:ring-4 focus:ring-mars-100 sm:h-10'
export const textareaCls = 'w-full rounded-xl border border-line bg-white p-3 text-sm leading-relaxed outline-none transition placeholder:text-muted hover:border-mars-200 focus:border-mars-400 focus:ring-4 focus:ring-mars-100'

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  const scope = useId()
  return (
    <LayoutGroup id={scope}>
      <div className="mb-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1 sm:mb-6">
        {tabs.map((t) => {
          const active = value === t.value
          return (
            <button key={t.value} type="button" aria-pressed={active} onClick={() => onChange(t.value)}
              className={cn('relative flex min-h-10 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors duration-150', active ? 'text-white' : 'text-muted hover:bg-canvas hover:text-ink')}>
              {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-ink" transition={SPRING.snappy} aria-hidden="true" />}
              <span className="relative">{t.label}</span>
              {t.count !== undefined && <span className={cn('relative min-w-5 rounded-md px-1.5 text-center text-xs tabular-nums', active ? 'bg-white/20' : 'bg-canvas text-ink')}>{t.count}</span>}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export function Notice({ tone = 'yellow', children }: { tone?: 'yellow' | 'blue'; children: ReactNode }) {
  return <InlineAlert tone={tone === 'yellow' ? 'warning' : 'info'} className="mb-5">{children}</InlineAlert>
}
