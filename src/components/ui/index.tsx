import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, RotateCw, Search, X } from 'lucide-react'
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { errorMessage } from '../../services/apiClient'

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
const variants: Record<Variant, string> = {
  primary: 'bg-mars-500 text-white hover:bg-mars-600 shadow-sm shadow-mars-500/30',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none',
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
  return <div className={cn('rounded-2xl border border-line/70 shadow-card', !customBg && 'bg-white', className)}>{children}</div>
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
  return (
    <div className={cn('h-2 rounded-full overflow-hidden', dark ? 'bg-white/10' : 'bg-slate-100', className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-mars-400 to-mars-600 transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-mars-50 text-mars-500">{icon ?? <Inbox />}</div>
      <p className="font-bold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, dark }: { error: unknown; onRetry?: () => void; dark?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center rounded-2xl px-6 py-12 text-center', dark ? 'bg-navy-800 text-white' : 'bg-red-50/60 border border-red-100')}>
      <AlertTriangle className="mb-2 size-8 text-red-500" />
      <p className="font-bold">Ma'lumotni yuklab bo'lmadi</p>
      <p className={cn('mt-1 text-sm', dark ? 'text-navy-300' : 'text-muted')}>{errorMessage(error)}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}><RotateCw className="size-4" />Qayta urinish</Button>}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Qidirish...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none transition focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
    </label>
  )
}

export function Chips<T extends string>({ options, value, onChange, dark }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn('h-9 rounded-xl px-3.5 text-sm font-semibold transition',
            value === o.value ? 'bg-mars-500 text-white shadow-sm shadow-mars-500/30'
              : dark ? 'bg-navy-800 text-navy-300 hover:text-white' : 'bg-white border border-line text-muted hover:text-ink')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Select({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={cn('h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium outline-none focus:border-mars-400', className)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Oldingi"><ChevronLeft className="size-4" /></Button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Button key={p} size="sm" variant={p === page ? 'primary' : 'ghost'} onClick={() => onChange(p)}>{p}</Button>
      ))}
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Keyingi"><ChevronRight className="size-4" /></Button>
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full max-h-[92vh] overflow-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-lift animate-fade-up', size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-canvas" aria-label="Yopish"><X className="size-5" /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
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

export const inputCls = 'h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-mars-400 focus:ring-4 focus:ring-mars-100'

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 border border-line w-fit max-w-full">
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)}
          className={cn('flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition', value === t.value ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
          {t.label}{t.count !== undefined && <span className={cn('rounded-md px-1.5 text-xs', value === t.value ? 'bg-white/20' : 'bg-canvas')}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Notice({ tone = 'yellow', children }: { tone?: 'yellow' | 'blue'; children: ReactNode }) {
  return (
    <div className={cn('mb-5 flex gap-3 rounded-2xl border px-4 py-3 text-sm', tone === 'yellow' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900')}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" /><div>{children}</div>
    </div>
  )
}
