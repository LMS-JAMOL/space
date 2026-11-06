import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock, CreditCard, ShieldCheck, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, EmptyState, ErrorState, Field, PageHeader, Skeleton, Table, cn, inputCls } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { errorMessage } from '../../services/apiClient'
import { paymentService } from '../../services/paymentService'
import { useLanguage } from '../../context/LanguageContext'
import type { PaymentInfo } from '../../types'
import { fmtDateTime, fmtMoney, fmtNum, newIdempotencyKey } from '../../utils/format'

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
      {info.data?.upcomingPeriods?.length ? <Card className="mb-5 space-y-2 p-5"><h2 className="font-bold">{tr('Keyingi oylik to‘lovlar')}</h2>{info.data.upcomingPeriods.map((item) => <div key={`${item.enrollment}:${item.period}`} className="flex flex-wrap justify-between gap-2 border-b border-line py-2"><span>{item.groupName} · {fmtDateTime(item.dueAt)}</span><strong>{fmtMoney(item.remaining, 'UZS')}</strong></div>)}</Card> : null}
      {info.data?.enrollments && info.data.enrollments.length > 0 && (
        <Card className="mb-5 p-5">
          <h2 className="mb-3 font-bold">{tr("Guruhlar bo‘yicha to‘lov holati")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {info.data.enrollments.map((item) => (
              <div key={item.enrollment} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <span className="font-medium">{item.groupName || item.group}</span>
                <span className={cn('text-sm font-bold', item.status === 'ACTIVE' ? 'text-emerald-700' : item.status === 'INACTIVE' ? 'text-amber-700' : item.status === 'FROZEN' ? 'text-blue-700' : 'text-muted')}>
                  {item.status === 'UNKNOWN' ? tr('Ma’lumot yetarli emas') : item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-2">
          {info.isLoading ? <Skeleton className="h-64" /> : info.error ? <ErrorState error={info.error} onRetry={info.refetch} /> : info.data && <Checkout data={info.data} />}
        </Card>
        <Card className="lg:col-span-3">
          <div className="border-b border-line px-5 py-4 font-bold">{tr("To'lovlar tarixi")}</div>
          {history.isLoading ? <div className="p-5"><Skeleton className="h-40" /></div> : history.error ? <div className="p-5"><ErrorState error={history.error} onRetry={history.refetch} /></div>
            : !history.data?.length ? <div className="p-5"><EmptyState title={tr("To'lovlar yo'q")} /></div> : (
              <Table head={[tr('Sana'), tr('Izoh'), tr('Summa'), tr('Provayder'), tr('Holat')]}>
                {history.data.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-muted">{fmtDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3">{p.description ?? '—'}</td>
                    <td className="px-4 py-3 font-bold">{fmtMoney(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">{p.provider ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </Table>
            )}
        </Card>
      </div>
    </>
  )

}

// Providers are returned as API codes (`click`, `payme`, `card`); only the
// label is user-facing.
const PROVIDER_LABELS: Record<string, string> = { click: 'Click', payme: 'Payme', card: 'Karta' }

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
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{tr('Onlayn to‘lov hozircha ulanmagan. To‘lov bo‘yicha filial adminiga murojaat qiling.')}</p>
        <div className="flex gap-3">{['Click', 'Payme'].map((name) => <button key={name} type="button" disabled className="rounded-xl border border-line px-4 py-3 text-muted">{name} · {tr('Ulanmagan')}</button>)}</div>
        {d.amountDue !== null && <div className="rounded-2xl bg-gradient-to-br from-ink to-navy-700 p-5 text-white">
          <p className="text-sm text-navy-300">{tr("To'lanishi kerak")}</p>
          <p className="text-3xl font-extrabold">{fmtMoney(d.amountDue, d.currency)}</p>
        </div>}
      </div>
    )

    return (
      <form onSubmit={(e) => { e.preventDefault(); if (valid) checkout.mutate() }} className="space-y-5">
        {d.providers.length === 0 && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{tr('Onlayn to‘lov hozircha ulanmagan. To‘lov bo‘yicha filial adminiga murojaat qiling.')}</p>}
        {d.amountDue !== null && (
          <div className="rounded-2xl bg-gradient-to-br from-ink to-navy-700 p-5 text-white">
            <p className="text-sm text-navy-300">{tr("To'lanishi kerak")}</p>
            <p className="text-3xl font-extrabold">{fmtMoney(d.amountDue, d.currency)}</p>
          </div>
        )}
        <Field label={tr("Summa (so'm)")}>
          <input inputMode="numeric" className={inputCls} value={amount ? fmtNum(Number(amount)) : ''} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
        </Field>
        {d.suggestedAmounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {d.suggestedAmounts.map((a) => (
              <button type="button" key={a} onClick={() => setAmount(String(a))} className={cn('rounded-xl border px-3 py-1.5 text-sm font-semibold', Number(amount) === a ? 'border-mars-500 bg-mars-50 text-mars-600' : 'border-line')}>{fmtNum(a)}</button>
            ))}
          </div>
        )}
        <div>
          <p className="mb-1.5 text-sm font-semibold">{tr("To'lov tizimi")}</p>
          <div className="grid grid-cols-3 gap-2">
            {d.providers.map((p) => (
              <button type="button" key={p} onClick={() => setProvider(p)} className={cn('h-12 rounded-xl border-2 text-sm font-bold transition', provider === p ? 'border-mars-500 bg-mars-50 text-mars-600' : 'border-line text-muted')}>{tr(PROVIDER_LABELS[p] ?? p)}</button>
            ))}
          </div>
        </div>
        {checkout.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(checkout.error)}</p>}
        <Button type="submit" size="lg" className="w-full" loading={checkout.isPending} disabled={!valid}><CreditCard className="size-5" />{tr("To'lovga o'tish")}</Button>
        <p className="flex items-start gap-2 text-xs text-muted"><ShieldCheck className="size-4 shrink-0 text-emerald-500" />{tr("Karta ma'lumotlari faqat to'lov tizimining xavfsiz sahifasida kiritiladi. Bu sayt karta ma'lumotlarini saqlamaydi.")}</p>
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
  const view = q.error ? { icon: XCircle, c: 'text-red-500 bg-red-50', t: tr("Holatni tekshirib bo'lmadi"), d: errorMessage(q.error) }
    : s === 'paid' ? { icon: CheckCircle2, c: 'text-emerald-500 bg-emerald-50', t: tr("To'lov tasdiqlandi"), d: tr('Server tomonidan tasdiqlangan.') }
    : s === 'failed' || s === 'cancelled' ? { icon: XCircle, c: 'text-red-500 bg-red-50', t: tr("To'lov amalga oshmadi"), d: tr("Qaytadan urinib ko'ring.") }
    : { icon: Clock, c: 'text-amber-500 bg-amber-50', t: tr('Tasdiqlash kutilmoqda'), d: tr("To'lov tizimidan javob kutilmoqda. Sahifani yopmang.") }
  const Icon = view.icon
  return (
    <Card className="mb-5 flex flex-wrap items-center gap-4 p-5 animate-fade-up">
      <div className={cn('grid size-12 place-items-center rounded-2xl', view.c)}><Icon className={cn('size-6', s === 'pending' && 'animate-pulse')} /></div>
      <div className="flex-1"><p className="font-bold">{view.t}</p><p className="text-sm text-muted">{q.data ? `${fmtMoney(q.data.amount, q.data.currency)} · ` : ''}{view.d}</p></div>
      <Button variant="secondary" size="sm" onClick={onClose}>{tr('Yopish')}</Button>
    </Card>
  )
}
