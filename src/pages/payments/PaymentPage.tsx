import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, Clock, CreditCard, Receipt, ShieldCheck, Users, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, CardHeader, EmptyState, ErrorState, Field, InlineAlert, PageHeader, Skeleton, Table, cn, inputCls } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { errorMessage } from '../../services/apiClient'
import { paymentService } from '../../services/paymentService'
import { useLanguage } from '../../context/LanguageContext'
import type { PaymentInfo } from '../../types'
import { fmtDateTime, fmtMoney, fmtNum, newIdempotencyKey } from '../../utils/format'

/** Payment state of one enrollment as the backend reports it (never guessed on the client). */
const PAY_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  ACTIVE: { label: 'To‘langan', cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
  INACTIVE: { label: 'To‘lov kutilmoqda', cls: 'border-amber-200 bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  FROZEN: { label: 'Muzlatilgan', cls: 'border-blue-200 bg-blue-50 text-blue-800', dot: 'bg-blue-500' },
  UNKNOWN: { label: 'Ma’lumot yetarli emas', cls: 'border-line bg-canvas text-muted', dot: 'bg-slate-400' },
}

export default function PaymentPage() {
  const { tr } = useLanguage()
  const [params, setParams] = useSearchParams()
  const paymentId = params.get('paymentId')
  const info = useQuery({ queryKey: ['payments', 'info'], queryFn: paymentService.info })
  const history = useQuery({ queryKey: ['payments', 'history'], queryFn: paymentService.history })

  return (
    <>
      <PageHeader title={tr("Onlayn to'lov")} subtitle={tr("Kurs to'lovini xavfsiz amalga oshiring")} />
      {paymentId && <PaymentStatus id={paymentId} onClose={() => setParams({})} />}
      <div className="grid items-start gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            {info.isLoading ? <div className="space-y-3" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-24" /><Skeleton className="h-11" /><Skeleton className="h-12" /></div>
              : info.error ? <ErrorState compact error={info.error} onRetry={info.refetch} /> : info.data && <Checkout data={info.data} />}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          {info.data?.upcomingPeriods?.length ? (
            <Card className="p-5">
              <CardHeader icon={<CalendarDays />} title={tr('Keyingi oylik to‘lovlar')} />
              <ul className="-mx-1 divide-y divide-line">
                {info.data.upcomingPeriods.map((item) => (
                  <li key={`${item.enrollment}:${item.period}`} className="flex items-center justify-between gap-3 px-1 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.groupName ?? '—'}</span>
                      <span className="block text-xs text-muted tabular-nums">{tr('Muddat')}: {fmtDateTime(item.dueAt)}</span>
                    </span>
                    <strong className="shrink-0 tabular-nums">{fmtMoney(item.remaining, 'UZS')}</strong>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {info.data?.enrollments && info.data.enrollments.length > 0 && (
            <Card className="p-5">
              <CardHeader icon={<Users />} title={tr("Guruhlar bo‘yicha to‘lov holati")} />
              <ul className="grid gap-2 sm:grid-cols-2">
                {info.data.enrollments.map((item) => {
                  const st = PAY_STATUS[item.status] ?? PAY_STATUS.UNKNOWN
                  return (
                    <li key={item.enrollment} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                      <span className="min-w-0 truncate font-medium">{item.groupName || item.group}</span>
                      <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', st.cls)}>
                        <span className={cn('size-1.5 rounded-full', st.dot)} aria-hidden="true" />
                        {tr(st.label)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 pt-5"><CardHeader icon={<Receipt />} title={tr("To'lovlar tarixi")} /></div>
            {history.isLoading ? <div className="space-y-2 p-5" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
              : history.error ? <div className="p-5"><ErrorState compact error={history.error} onRetry={history.refetch} /></div>
              : !history.data?.length ? <div className="p-5"><EmptyState compact icon={<Receipt />} title={tr("To'lovlar yo'q")} text={tr('Onlayn to‘lovlaringiz shu yerda ko‘rinadi.')} /></div> : (
                <>
                  {/* Phones: one row per payment; wider screens: the table. */}
                  <ul className="divide-y divide-line md:hidden">
                    {history.data.map((p) => (
                      <li key={p.id} className="flex items-start justify-between gap-3 px-5 py-3">
                        <span className="min-w-0">
                          <span className="block font-bold tabular-nums">{fmtMoney(p.amount, p.currency)}</span>
                          <span className="block truncate text-sm">{p.description ?? '—'}</span>
                          <span className="block text-xs text-muted tabular-nums">{fmtDateTime(p.createdAt)} · {p.provider ?? '—'}</span>
                        </span>
                        <StatusBadge status={p.status} />
                      </li>
                    ))}
                  </ul>
                  <div className="hidden md:block">
                    <Table head={[tr('Sana'), tr('Izoh'), tr('Summa'), tr('Provayder'), tr('Holat')]}>
                      {history.data.map((p) => (
                        <tr key={p.id} className="transition-colors duration-150 hover:bg-canvas/60">
                          <td className="px-4 py-3 text-muted tabular-nums">{fmtDateTime(p.createdAt)}</td>
                          <td className="px-4 py-3">{p.description ?? '—'}</td>
                          <td className="px-4 py-3 font-bold tabular-nums">{fmtMoney(p.amount, p.currency)}</td>
                          <td className="px-4 py-3">{p.provider ?? '—'}</td>
                          <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                </>
              )}
          </Card>
        </div>
      </div>
    </>
  )

}

// Providers are returned as API codes (`click`, `payme`, `card`); only the
// label is user-facing.
const PROVIDER_LABELS: Record<string, string> = { click: 'Click', payme: 'Payme', card: 'Karta' }

/** Calm summary of what is due; an unknown amount stays unknown. */
function AmountDue({ data: d }: { data: PaymentInfo }) {
  const { tr } = useLanguage()
  return (
    <div className="rounded-2xl border border-mars-100 bg-mars-50/60 p-4 sm:p-5">
      <p className="text-sm font-semibold text-muted">{tr("To'lanishi kerak")}</p>
      {d.amountDue !== null
        ? <p className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight tabular-nums">{fmtMoney(d.amountDue, d.currency)}</p>
        : <p className="mt-1 text-base font-semibold text-muted">{tr('Ma’lumot yetarli emas')}</p>}
    </div>
  )
}

function Checkout({ data: d }: { data: PaymentInfo }) {
    const { tr } = useLanguage()
    const qc = useQueryClient()
    const [amount, setAmount] = useState(String(d.amountDue ?? ''))
    const [provider, setProvider] = useState(d.providers[0] ?? '')
    const idemKey = useRef(newIdempotencyKey())
    const checkout = useMutation({
      mutationFn: () => paymentService.checkout({ amount: Number(amount), provider }, idemKey.current),
      onSuccess: (r) => {
        qc.invalidateQueries({ queryKey: ['payments'] })
        // Hosted provider page — card data never touches this app.
        window.location.assign(r.checkoutUrl)
      },
      onError: () => { idemKey.current = newIdempotencyKey() },
    })
    const valid = Number(amount) > 0 && !!provider

    if (d.providers.length === 0) return (
      <div className="space-y-4">
        <AmountDue data={d} />
        <InlineAlert tone="warning" role="status" title={tr('Onlayn to‘lov hozircha ulanmagan')}>{tr('To‘lov bo‘yicha filial adminiga murojaat qiling.')}</InlineAlert>
        <div>
          <p className="mb-1.5 text-sm font-semibold">{tr("To'lov tizimi")}</p>
          <div className="grid grid-cols-2 gap-2">{['Click', 'Payme'].map((name) => <button key={name} type="button" disabled className="flex h-12 cursor-not-allowed flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/60 text-sm font-bold text-muted">{name}<span className="text-[11px] font-medium">{tr('Ulanmagan')}</span></button>)}</div>
        </div>
      </div>
    )

    return (
      <form onSubmit={(e) => { e.preventDefault(); if (valid) checkout.mutate() }} className="space-y-5">
        <AmountDue data={d} />
        <Field label={tr("Summa (so'm)")}>
          <input inputMode="numeric" className={cn(inputCls, 'text-base font-semibold tabular-nums')} value={amount ? fmtNum(Number(amount)) : ''} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
        </Field>
        {d.suggestedAmounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {d.suggestedAmounts.map((a) => (
              <button type="button" key={a} aria-pressed={Number(amount) === a} onClick={() => setAmount(String(a))}
                className={cn('h-10 rounded-xl border px-3 text-sm font-semibold tabular-nums transition-colors duration-150', Number(amount) === a ? 'border-mars-500 bg-mars-50 text-mars-700' : 'border-line hover:border-mars-200 hover:bg-canvas')}>{fmtNum(a)}</button>
            ))}
          </div>
        )}
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">{tr("To'lov tizimi")}</legend>
          <div className="grid grid-cols-3 gap-2">
            {d.providers.map((p) => (
              <button type="button" key={p} aria-pressed={provider === p} onClick={() => setProvider(p)}
                className={cn('h-12 rounded-xl border-2 text-sm font-bold transition-colors duration-150', provider === p ? 'border-mars-500 bg-mars-50 text-mars-700' : 'border-line text-muted hover:border-mars-200 hover:text-ink')}>{tr(PROVIDER_LABELS[p] ?? p)}</button>
            ))}
          </div>
        </fieldset>
        {checkout.error && <InlineAlert tone="danger" role="alert">{errorMessage(checkout.error)}</InlineAlert>}
        <Button type="submit" size="lg" className="w-full" loading={checkout.isPending} disabled={!valid}><CreditCard className="size-5" aria-hidden="true" />{tr("To'lovga o'tish")}</Button>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted"><ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />{tr("Karta ma'lumotlari faqat to'lov tizimining xavfsiz sahifasida kiritiladi. Bu sayt karta ma'lumotlarini saqlamaydi.")}</p>
      </form>
    )
}

function PaymentStatus({ id, onClose }: { id: string; onClose: () => void }) {
  const { tr } = useLanguage()
  const q = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentService.get(id),
    refetchInterval: (s) => (s.state.data?.status === 'pending' ? 3000 : false),
  })
  const s = q.data?.status
  const view = q.error ? { icon: XCircle, c: 'text-red-600 bg-red-50', t: tr("Holatni tekshirib bo'lmadi"), d: errorMessage(q.error) }
    : s === 'paid' ? { icon: CheckCircle2, c: 'text-emerald-700 bg-emerald-50', t: tr("To'lov tasdiqlandi"), d: tr('Server tomonidan tasdiqlangan.') }
    : s === 'failed' || s === 'cancelled' ? { icon: XCircle, c: 'text-red-600 bg-red-50', t: tr("To'lov amalga oshmadi"), d: tr("Qaytadan urinib ko'ring.") }
    : { icon: Clock, c: 'text-amber-700 bg-amber-50', t: tr('Tasdiqlash kutilmoqda'), d: tr("To'lov tizimidan javob kutilmoqda. Sahifani yopmang.") }
  const Icon = view.icon
  return (
    <Card className="mb-6 flex flex-wrap items-center gap-4 p-5">
      <div className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', view.c)} aria-hidden="true"><Icon className={cn('size-6', s === 'pending' && 'animate-pulse')} /></div>
      <div className="min-w-0 flex-1" role="status"><p className="font-bold">{view.t}</p><p className="text-sm text-muted">{q.data ? <span className="tabular-nums">{fmtMoney(q.data.amount, q.data.currency)} · </span> : ''}{view.d}</p></div>
      <Button variant="secondary" size="sm" onClick={onClose}>{tr('Yopish')}</Button>
    </Card>
  )
}
