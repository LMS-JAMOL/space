import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, Clock, UserRound } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, PageHeader, SkeletonGrid, cn } from '../../components/ui'
import { api, errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'

type Slot = {
  id: string; dayId: string; tutor: string; course: string; start: string; end: string
  seatsLeft: number; booked: boolean; canBook: boolean
}

const TZ = 'Asia/Tashkent'
const SHORT_DAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'] // Sunday is never offered
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
const hhmm = (iso: string) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

/** The next six teaching days: every day except Sunday, starting today. */
const nextSixDays = () => {
  const days: { key: string; weekday: number; date: number }[] = []
  for (let i = 0; days.length < 6 && i < 14; i += 1) {
    const d = new Date(Date.now() + i * 86400000)
    const key = dayKey(d)
    const weekday = new Date(`${key}T12:00:00`).getDay()
    if (weekday === 0) continue
    days.push({ key, weekday, date: Number(key.slice(8, 10)) })
  }
  return days
}

/**
 * Extra lessons: pick one of the next six days (no Sunday), pick a tutor, pick a time that
 * suits you, confirm. The seat is held at once (three students per slot).
 */
export default function TutorPage() {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const days = useMemo(nextSixDays, [])
  const [day, setDay] = useState(days[0].key)
  const [tutor, setTutor] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [done, setDone] = useState<Slot | null>(null)
  const [chosenByUser, setChosenByUser] = useState(false)

  const queries = useQueries({
    queries: days.map((d) => ({ queryKey: ['tutor-slots', d.key], queryFn: () => api.get<Slot[]>('/tutor-booking', { day: d.key }) })),
  })
  const byDay = new Map(days.map((d, i) => [d.key, queries[i]]))
  const current = byDay.get(day)!
  const slots = current.data ?? []
  // until the student picks a day, show the first day that has a free time
  const allLoaded = queries.every((q) => !q.isLoading)
  useEffect(() => {
    if (chosenByUser || !allLoaded) return
    const first = days.find((d) => (byDay.get(d.key)?.data ?? []).some((s) => s.canBook))
    if (first && first.key !== day) setDay(first.key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, chosenByUser])
  const freeCount = (key: string) => (byDay.get(key)?.data ?? []).filter((s) => s.canBook).length

  const tutors = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of slots) map.set(s.tutor, [...(map.get(s.tutor) ?? []), s])
    return [...map.entries()]
  }, [slots])
  const chosenTutorSlots = tutors.find(([name]) => name === tutor)?.[1] ?? []
  const chosen = chosenTutorSlots.find((s) => s.id === slotId) ?? null

  const book = useMutation({
    mutationFn: (s: Slot) => api.post(`/tutor-booking/${s.dayId}/${s.id}/book`),
    onSuccess: (_r, s) => {
      setDone(s)
      setSlotId(null)
      qc.invalidateQueries({ queryKey: ['tutor-slots'] })
    },
  })

  const pickDay = (key: string) => { setChosenByUser(true); setDay(key); setTutor(null); setSlotId(null); setDone(null); book.reset() }

  return (
    <>
      <PageHeader title={tr('Qo‘shimcha darslar')} subtitle={tr('Kunni, tutorni va o‘zingizga qulay vaqtni tanlang — bron darhol tasdiqlanadi.')} />

      <section aria-label={tr('Kunni tanlang')} className="mb-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted"><CalendarDays className="size-4" />{tr('1. Kunni tanlang')}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup">
          {days.map((d) => {
            const free = freeCount(d.key)
            const active = d.key === day
            return (
              <button key={d.key} type="button" role="radio" aria-checked={active} onClick={() => pickDay(d.key)}
                className={cn('rounded-[10px] border px-3 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-mars-500',
                  active ? 'border-mars-500 bg-mars-500 text-white' : 'border-line bg-white hover:bg-black/5')}>
                <div className="text-xs font-semibold opacity-80">{tr(SHORT_DAYS[d.weekday])}</div>
                <div className="text-xl font-extrabold leading-tight">{d.date}</div>
                <div className={cn('text-[11px]', active ? 'text-white/80' : 'text-muted')}>{free > 0 ? `${free} ${tr('bo‘sh vaqt')}` : tr('bo‘sh vaqt yo‘q')}</div>
              </button>
            )
          })}
        </div>
      </section>

      {current.isLoading ? <SkeletonGrid count={3} /> : current.error ? <ErrorState error={current.error} onRetry={current.refetch} /> : !slots.length ? (
        <EmptyState title={tr('Bu kun uchun tutor vaqtlari yo‘q')} text={tr('Boshqa kunni tanlang.')} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-label={tr('Tutorni tanlang')}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted"><UserRound className="size-4" />{tr('2. Tutorni tanlang')}</h2>
            <div className="space-y-2">
              {tutors.map(([name, list]) => {
                const free = list.filter((s) => s.canBook).length
                const active = name === tutor
                return (
                  <button key={name} type="button" aria-pressed={active} onClick={() => { setTutor(name); setSlotId(null); setDone(null); book.reset() }}
                    className={cn('flex w-full items-center justify-between rounded-[10px] border px-4 py-3 text-left transition-colors',
                      active ? 'border-mars-500 bg-mars-50' : 'border-line bg-white hover:bg-black/5')}>
                    <span><span className="block font-bold">{name}</span><span className="block text-xs text-muted">{list[0].course}</span></span>
                    <span className="text-xs font-semibold text-muted">{free} {tr('bo‘sh vaqt')}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section aria-label={tr('Vaqtni tanlang')}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted"><Clock className="size-4" />{tr('3. Vaqtni tanlang')}</h2>
            {!tutor ? <p className="rounded-[10px] border border-dashed border-line p-4 text-sm text-muted">{tr('Avval tutorni tanlang.')}</p> : (
              <div className="grid grid-cols-2 gap-2">
                {chosenTutorSlots.map((s) => (
                  <button key={s.id} type="button" disabled={!s.canBook && !s.booked} aria-pressed={s.id === slotId} onClick={() => { if (s.canBook) { setSlotId(s.id); setDone(null); book.reset() } }}
                    className={cn('rounded-[10px] border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      s.id === slotId ? 'border-mars-500 bg-mars-50' : 'border-line bg-white hover:bg-black/5')}>
                    <span className="block font-bold">{hhmm(s.start)} — {hhmm(s.end)}</span>
                    <span className="block text-xs text-muted">
                      {s.booked ? tr('Yozilgansiz') : s.canBook ? `${tr('Bo‘sh joylar')}: ${s.seatsLeft} / 3` : tr('Yozilish yopilgan')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {chosen && (
        <Card className="mt-6 space-y-3 border-mars-200 p-5">
          <h2 className="font-bold">{tr('4. Tasdiqlang')}</h2>
          <p className="text-sm">{chosen.tutor} · {chosen.course}</p>
          <p className="text-sm font-semibold">{day} · {hhmm(chosen.start)} — {hhmm(chosen.end)}</p>
          {book.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(book.error)}</p>}
          <Button loading={book.isPending} onClick={() => book.mutate(chosen)}><Check className="size-4" />{tr('Bronni tasdiqlash')}</Button>
        </Card>
      )}
      {done && (
        <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {tr('Bron tasdiqlandi')}: {done.tutor}, {hhmm(done.start)} — {hhmm(done.end)}
        </p>
      )}
    </>
  )
}
