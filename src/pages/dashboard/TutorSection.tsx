import { useMemo, useState } from 'react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Check, Plus } from 'lucide-react'
import { Button, Card, Modal, cn } from '../../components/ui'
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
    queries: days.map((d) => ({ queryKey: ['tutor-slots', d.key], queryFn: () => api.get<Slot[]>('/tutor-booking', { day: d.key }) })),
  })
  const slotsOf = (key: string) => queries[days.findIndex((d) => d.key === key)]?.data ?? []

  const reset = () => { setOpen(null); setTutor(null); setSlotId(null); setTopic('') }
  const book = useMutation({
    mutationFn: (s: Slot) => api.post(`/tutor-booking/${s.dayId}/${s.id}/book`, { topic: topic.trim() }),
    onSuccess: (_r, s) => {
      setDone(`${s.tutor}, ${hhmm(s.start)} — ${hhmm(s.end)}`)
      reset()
      qc.invalidateQueries({ queryKey: ['tutor-slots'] })
    },
  })

  const slots = open ? slotsOf(open) : []
  const tutors = [...new Set(slots.map((s) => s.tutor))]
  const mine = slots.filter((s) => s.tutor === tutor)
  const chosen = mine.find((s) => s.id === slotId) ?? null
  const day = days.find((d) => d.key === open)
  const valid = Boolean(chosen) && topic.trim().length >= 3

  return (
    <Card className="p-5">
      <h2 className="font-bold">{tr('Qo‘shimcha dars')}</h2>
      <p className="mt-1 text-sm text-muted">{tr('Kunni tanlab “+” ni bosing, tutor va qulay vaqtni tanlang, mavzuni yozing.')}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {days.map((d) => {
          const list = slotsOf(d.key)
          const booked = list.filter((s) => s.booked).length
          const free = list.filter((s) => s.canBook).length
          return (
            <div key={d.key} className={cn('flex flex-col items-center rounded-[10px] border px-2 py-3 text-center', booked ? 'border-mars-300 bg-mars-50' : 'border-line bg-white')}>
              <div className="text-xs font-semibold text-muted">{tr(SHORT_DAYS[d.weekday])}</div>
              <div className="text-xl font-extrabold leading-tight">{d.date}</div>
              <div className="mb-2 min-h-4 text-[11px] text-muted">{booked ? tr('Yozilgansiz') : free > 0 ? `${free} ${tr('bo‘sh vaqt')}` : tr('bo‘sh vaqt yo‘q')}</div>
              <button type="button" onClick={() => { setDone(null); book.reset(); setOpen(d.key) }} disabled={free === 0}
                aria-label={`${tr('Qo‘shimcha dars qo‘shish')}: ${tr(SHORT_DAYS[d.weekday])} ${d.date}`}
                className="grid size-9 place-items-center rounded-full bg-mars-500 text-white transition hover:bg-mars-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mars-500 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted">
                <Plus className="size-5" />
              </button>
            </div>
          )
        })}
      </div>
      {done && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{tr('Bron tasdiqlandi')}: {done}</p>}

      <Modal open={Boolean(open)} onClose={reset} title={day ? `${tr('Qo‘shimcha dars')} — ${tr(SHORT_DAYS[day.weekday])} ${day.date}` : tr('Qo‘shimcha dars')}
        footer={<Button disabled={!valid} loading={book.isPending} onClick={() => chosen && book.mutate(chosen)}><Check className="size-4" />{tr('Bronni tasdiqlash')}</Button>}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold">{tr('Tutorni tanlang')}</p>
            <div className="space-y-2">
              {tutors.map((name) => (
                <button key={name} type="button" aria-pressed={name === tutor} onClick={() => { setTutor(name); setSlotId(null) }}
                  className={cn('flex w-full items-center justify-between rounded-[10px] border px-4 py-3 text-left', name === tutor ? 'border-mars-500 bg-mars-50' : 'border-line hover:bg-black/5')}>
                  <span className="font-bold">{name}</span>
                  <span className="text-xs text-muted">{slots.find((s) => s.tutor === name)?.course}</span>
                </button>
              ))}
            </div>
          </div>
          {tutor && (
            <div>
              <p className="mb-2 text-sm font-semibold">{tr('Vaqtni tanlang')}</p>
              <div className="grid grid-cols-2 gap-2">
                {mine.map((s) => (
                  <button key={s.id} type="button" disabled={!s.canBook} aria-pressed={s.id === slotId} onClick={() => setSlotId(s.id)}
                    className={cn('rounded-[10px] border px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50', s.id === slotId ? 'border-mars-500 bg-mars-50' : 'border-line hover:bg-black/5')}>
                    <span className="block font-bold">{hhmm(s.start)} — {hhmm(s.end)}</span>
                    <span className="block text-xs text-muted">{s.booked ? tr('Yozilgansiz') : s.canBook ? `${tr('Bo‘sh joylar')}: ${s.seatsLeft} / 3` : tr('Yozilish yopilgan')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {chosen && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{tr('Mavzu')}</span>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} maxLength={200}
                placeholder={tr('Nimani o‘rganmoqchisiz yoki qaysi mavzu tushunarsiz?')}
                className="w-full rounded-[10px] border border-line bg-white p-3 text-sm outline-none focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
            </label>
          )}
          {book.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(book.error)}</p>}
        </div>
      </Modal>
    </Card>
  )
}
