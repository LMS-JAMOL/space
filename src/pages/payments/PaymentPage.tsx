import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock, CreditCard, ShieldCheck, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, EmptyState, ErrorState, Field, PageHeader, Skeleton, Table, cn, inputCls } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { errorMessage } from '../../services/apiClient'
import { paymentService } from '../../services/paymentService'
import { fmtDateTime, fmtMoney, fmtNum, newIdempotencyKey } from '../../utils/format'

export default function PaymentPage() {
  const [params, setParams] = useSearchParams()
  const paymentId = params.get('paymentId')
  const info = useQuery({ queryKey: ['payments', 'info'], queryFn: paymentService.info })
  const history = useQuery({ queryKey: ['payments', 'history'], queryFn: paymentService.history })

  return (
    <>
      <PageHeader title="Onlayn to'lov" subtitle="Kurs to'lovini xavfsiz amalga oshiring" />
      {paymentId && <PaymentStatus id={paymentId} onClose={() => setParams({})} />}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-2">
          {info.isLoading ? <Skeleton className="h-64" /> : info.error ? <ErrorState error={info.error} onRetry={info.refetch} /> : <Checkout />}
        </Card>
        <Card className="lg:col-span-3">
          <div className="border-b border-line px-5 py-4 font-bold">To'lovlar tarixi</div>
          {history.isLoading ? <div className="p-5"><Skeleton className="h-40" /></div> : history.error ? <div className="p-5"><ErrorState error={history.error} onRetry={history.refetch} /></div>
            : !history.data?.length ? <div className="p-5"><EmptyState title="To'lovlar yo'q" /></div> : (
              <Table head={['Sana', 'Izoh', 'Summa', 'Provayder', 'Holat']}>
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

  function Checkout() {
    const d = info.data!
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

    return (
      <form onSubmit={(e) => { e.preventDefault(); if (valid) checkout.mutate() }} className="space-y-5">
        {d.amountDue !== null && (
          <div className="rounded-2xl bg-gradient-to-br from-ink to-navy-700 p-5 text-white">
            <p className="text-sm text-navy-300">To'lanishi kerak</p>
            <p className="text-3xl font-extrabold">{fmtMoney(d.amountDue, d.currency)}</p>
          </div>
        )}
        <Field label="Summa (so'm)">
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
          <p className="mb-1.5 text-sm font-semibold">To'lov tizimi</p>
          <div className="grid grid-cols-3 gap-2">
            {d.providers.map((p) => (
              <button type="button" key={p} onClick={() => setProvider(p)} className={cn('h-12 rounded-xl border-2 text-sm font-bold transition', provider === p ? 'border-mars-500 bg-mars-50 text-mars-600' : 'border-line text-muted')}>{p}</button>
            ))}
          </div>
        </div>
        {checkout.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(checkout.error)}</p>}
        <Button type="submit" size="lg" className="w-full" loading={checkout.isPending} disabled={!valid}><CreditCard className="size-5" />To'lovga o'tish</Button>
        <p className="flex items-start gap-2 text-xs text-muted"><ShieldCheck className="size-4 shrink-0 text-emerald-500" />Karta ma'lumotlari faqat to'lov tizimining xavfsiz sahifasida kiritiladi. Bu sayt karta ma'lumotlarini saqlamaydi.</p>
      </form>
    )
  }
}

function PaymentStatus({ id, onClose }: { id: string; onClose: () => void }) {
  const q = useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentService.get(id),
    refetchInterval: (s) => (s.state.data?.status === 'pending' ? 3000 : false),
  })
  const s = q.data?.status
  const view = q.error ? { icon: XCircle, c: 'text-red-500 bg-red-50', t: "Holatni tekshirib bo'lmadi", d: errorMessage(q.error) }
    : s === 'paid' ? { icon: CheckCircle2, c: 'text-emerald-500 bg-emerald-50', t: "To'lov tasdiqlandi", d: 'Server tomonidan tasdiqlangan.' }
    : s === 'failed' || s === 'cancelled' ? { icon: XCircle, c: 'text-red-500 bg-red-50', t: "To'lov amalga oshmadi", d: "Qaytadan urinib ko'ring." }
    : { icon: Clock, c: 'text-amber-500 bg-amber-50', t: 'Tasdiqlash kutilmoqda', d: "To'lov tizimidan javob kutilmoqda. Sahifani yopmang." }
  const Icon = view.icon
  return (
    <Card className="mb-5 flex flex-wrap items-center gap-4 p-5 animate-fade-up">
      <div className={cn('grid size-12 place-items-center rounded-2xl', view.c)}><Icon className={cn('size-6', s === 'pending' && 'animate-pulse')} /></div>
      <div className="flex-1"><p className="font-bold">{view.t}</p><p className="text-sm text-muted">{q.data ? `${fmtMoney(q.data.amount, q.data.currency)} · ` : ''}{view.d}</p></div>
      <Button variant="secondary" size="sm" onClick={onClose}>Yopish</Button>
    </Card>
  )
}
