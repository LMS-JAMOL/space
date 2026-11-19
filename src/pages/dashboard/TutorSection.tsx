import { useMemo, useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, GraduationCap, Plus } from 'lucide-react'
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, InlineAlert, Modal, Skeleton, cn, textareaCls } from '../../components/ui'
import { api, errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'

type Slot = {
  id: string; dayId: string; tutor: string; course: string; start: string; end: string
  seatsLeft: number; booked: boolean; canBook: boolean; cancelledNoShow?: boolean
}
type MyBooking = { id: string; dayId: string; tutor: string; course: string; start: string; end: string; topic: string; status: 'booked' | 'no_show'; attendance: 'present' | 'late' | null }

const TZ = 'Asia/Tashkent'
const SHORT_DAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'] // Sunday is never offered
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
const hhmm = (iso: string) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

/** The next six teaching days: every day except Sunday, starting today. */
const nextSixDays = () => {
  const days: { key: string; weekday: number; date: number }[] = []
  for (let i = 0; days.length < 6 && i < 14; i += 1) {
    const key = dayKey(new Date(Date.now() + i * 86400000))
    const weekday = new Date(`${key}T12:00:00`).getDay()
    if (weekday === 0) continue
    days.push({ key, weekday, date: Number(key.slice(8, 10)) })
  }
  return days
}

/**
 * Extra lessons, right on the main page: six days (no Sunday), a "+" on each. It opens the tutors
 * of that day; the student picks a tutor and a time that suits him, writes the topic and confirms.
 */
export default function TutorSection() {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const days = useMemo(nextSixDays, [])
  const [open, setOpen] = useState<string | null>(null) // the day whose "+" was pressed
  const [tutor, setTutor] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [done, setDone] = useState<string | null>(null)

  const queries = useQueries({
    queries: days.map((d) => ({ queryKey: ['tutor-slots', d.key], queryFn: () => api.get<Slot[]>('/tutor-booking', { day: d.key }), refetchInterval: 60_000 })),
  })
  const myBookings = useQuery({ queryKey: ['tutor-mine'], queryFn: () => api.get<MyBooking[]>('/tutor-booking/mine'), refetchInterval: 60_000 })
  const slotsOf = (key: string) => queries[days.findIndex((d) => d.key === key)]?.data ?? []

  const reset = () => { setOpen(null); setTutor(null); setSlotId(null); setTopic('') }
  const book = useMutation({
    mutationFn: (s: Slot) => api.post(`/tutor-booking/${s.dayId}/${s.id}/book`, { topic: topic.trim() }),
    onSuccess: (_r, s) => {
      setDone(`${s.tutor}, ${hhmm(s.start)} — ${hhmm(s.end)}`)
      reset()
      qc.invalidateQueries({ queryKey: ['tutor-slots'] })
      qc.invalidateQueries({ queryKey: ['tutor-mine'] })
    },
  })
  const cancel = useMutation({
    mutationFn: (s: MyBooking) => api.patch(`/tutor-booking/${s.dayId}/${s.id}/cancel`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutor-slots'] }); qc.invalidateQueries({ queryKey: ['tutor-mine'] }) },
  })

  const slots = open ? slotsOf(open) : []
  const tutors = [...new Set(slots.map((s) => s.tutor))]
  const mine = slots.filter((s) => s.tutor === tutor)
  const chosen = mine.find((s) => s.id === slotId) ?? null
  const day = days.find((d) => d.key === open)
  const valid = Boolean(chosen) && topic.trim().length >= 3

  return (
    <Card className="p-5">
      <CardHeader icon={<GraduationCap />} title={tr('Qo‘shimcha dars')} description={tr('Kunni tanlab “+” ni bosing, tutor va qulay vaqtni tanlang, mavzuni yozing.')} />
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {days.map((d, i) => {
          const list = slotsOf(d.key)
          const loading = queries[i]?.isLoading
          const booked = list.filter((s) => s.booked).length
          const free = list.filter((s) => s.canBook).length
          return (
            <li key={d.key} className={cn('flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors duration-150', booked ? 'border-mars-300 bg-mars-50' : free > 0 ? 'border-line bg-white' : 'border-line bg-canvas/60')}>
              <div className="text-xs font-semibold text-muted">{tr(SHORT_DAYS[d.weekday])}</div>
              <div className="text-xl font-extrabold leading-tight tabular-nums">{d.date}</div>
              <div className={cn('mb-2 min-h-8 text-[11px] leading-tight', booked ? 'font-semibold text-mars-700' : 'text-muted')}>
                {loading ? <Skeleton className="mx-auto mt-1 h-3 w-12" /> : booked ? tr('Yozilgansiz') : free > 0 ? `${free} ${tr('bo‘sh vaqt')}` : tr('bo‘sh vaqt yo‘q')}
              </div>
              <button type="button" onClick={() => { setDone(null); book.reset(); setOpen(d.key) }} disabled={free === 0}
                aria-label={`${tr('Qo‘shimcha dars qo‘shish')}: ${tr(SHORT_DAYS[d.weekday])} ${d.date}`}
                className="grid size-11 place-items-center rounded-full bg-mars-600 text-white shadow-sm shadow-mars-600/25 transition duration-150 hover:bg-mars-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none">
                <Plus className="size-5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
      {done && <InlineAlert tone="success" role="status" className="mt-4">{tr('Bron tasdiqlandi')}: {done}</InlineAlert>}
      <div className="mt-5 border-t border-line pt-4">
        <h3 className="mb-2 font-bold">{tr('Mening bronlarim')}</h3>
        {myBookings.isLoading ? <Skeleton className="h-14" /> : myBookings.error ? <ErrorState compact error={myBookings.error} onRetry={myBookings.refetch} /> : !myBookings.data?.length ? <EmptyState compact icon={<GraduationCap />} title={tr('Bronlar yo‘q')} /> : <ul className="space-y-2">{myBookings.data.map((s) => <li key={`${s.dayId}:${s.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line p-3 text-sm">
          <span className="min-w-0 flex-1">
            <strong>{s.tutor}</strong> <span className="text-muted">· {s.course}</span>
            <span className="block text-xs text-muted tabular-nums">{dayKey(new Date(s.start))} {hhmm(s.start)}–{hhmm(s.end)}{s.topic ? ` · ${s.topic}` : ''}</span>
          </span>
          {s.status === 'no_show' ? <Badge tone="yellow" className="whitespace-normal">{tr('15 daqiqada kelmagani uchun bekor qilindi')}</Badge> : <><Badge tone={s.attendance ? 'green' : 'orange'}>{s.attendance ? tr(s.attendance === 'late' ? 'Kechikdi' : 'Keldi') : tr('Yozilgansiz')}</Badge><Button size="sm" variant="secondary" disabled={cancel.isPending} onClick={() => cancel.mutate(s)}>{tr('Bronni bekor qilish')}</Button></>}
        </li>)}</ul>}
        {cancel.error && <InlineAlert tone="danger" role="alert" className="mt-2">{errorMessage(cancel.error)}</InlineAlert>}
      </div>

      <Modal open={Boolean(open)} onClose={reset} title={day ? `${tr('Qo‘shimcha dars')} — ${tr(SHORT_DAYS[day.weekday])} ${day.date}` : tr('Qo‘shimcha dars')} busy={book.isPending}
        footer={<Button disabled={!valid} loading={book.isPending} onClick={() => chosen && book.mutate(chosen)}><Check className="size-4" aria-hidden="true" />{tr('Bronni tasdiqlash')}</Button>}>
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-mars-50 text-xs font-bold text-mars-700">1</span>{tr('Tutorni tanlang')}</legend>
            <div className="space-y-2">
              {tutors.map((name) => (
                <button key={name} type="button" aria-pressed={name === tutor} onClick={() => { setTutor(name); setSlotId(null) }}
                  className={cn('flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150', name === tutor ? 'border-mars-500 bg-mars-50 ring-2 ring-mars-100' : 'border-line hover:border-mars-200 hover:bg-canvas')}>
                  <span className="font-bold">{name}</span>
                  <span className="text-xs text-muted">{slots.find((s) => s.tutor === name)?.course}</span>
                </button>
              ))}
            </div>
          </fieldset>
          {tutor && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-mars-50 text-xs font-bold text-mars-700">2</span>{tr('Vaqtni tanlang')}</legend>
              <div className="grid grid-cols-2 gap-2">
                {mine.map((s) => (
                  <button key={s.id} type="button" disabled={!s.canBook} aria-pressed={s.id === slotId} onClick={() => setSlotId(s.id)}
                    className={cn('rounded-xl border px-3 py-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50', s.id === slotId ? 'border-mars-500 bg-mars-50 ring-2 ring-mars-100' : 'border-line hover:border-mars-200 hover:bg-canvas')}>
                    <span className="block font-bold tabular-nums">{hhmm(s.start)} — {hhmm(s.end)}</span>
                    <span className="block text-xs text-muted">{s.booked ? tr('Yozilgansiz') : s.canBook ? `${tr('Bo‘sh joylar')}: ${s.seatsLeft} / 3` : tr('Yozilish yopilgan')}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {chosen && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold"><span className="mr-1.5 inline-grid size-5 place-items-center rounded-full bg-mars-50 text-xs font-bold text-mars-700">3</span>{tr('Mavzu')}</span>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} maxLength={200}
                placeholder={tr('Nimani o‘rganmoqchisiz yoki qaysi mavzu tushunarsiz?')} className={textareaCls} />
              <span className="mt-1 flex justify-between text-xs text-muted"><span>{tr('Kamida 3 ta belgi')}</span><span className="tabular-nums">{topic.length} / 200</span></span>
            </label>
          )}
          {book.error && <InlineAlert tone="danger" role="alert">{errorMessage(book.error)}</InlineAlert>}
        </div>
      </Modal>
    </Card>
  )
}
