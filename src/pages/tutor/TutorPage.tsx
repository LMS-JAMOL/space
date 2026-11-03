import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Card, EmptyState, ErrorState, Field, PageHeader, SkeletonGrid } from '../../components/ui'
import { api, errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fmtDateTime } from '../../utils/format'

type Slot = { id: string; dayId: string; tutor: string; course: string; start: string; end: string; seatsLeft: number; booked: boolean; canBook: boolean; attendance: 'present' | 'late' | null }
export default function TutorPage() {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const [day, setDay] = useState(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))
  const slots = useQuery({ queryKey: ['tutor-slots', day], queryFn: () => api.get<Slot[]>('/tutor-booking', { day }) })
  const book = useMutation({ mutationFn: (s: Slot) => api.post(`/tutor-booking/${s.dayId}/${s.id}/book`), onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-slots'] }) })
  const cancel = useMutation({ mutationFn: (s: Slot) => api.patch(`/tutor-booking/${s.dayId}/${s.id}/cancel`), onSuccess: () => qc.invalidateQueries({ queryKey: ['tutor-slots'] }) })
  return <>
    <PageHeader title={tr('Qo‘shimcha darslar')} subtitle={tr('Kursingiz uchun tutor va bo‘sh vaqtni tanlang. Bron avtomatik tasdiqlanadi.')} />
    <Field label={tr('Sana')}><input type="date" value={day} onChange={(e) => { if (e.target.value) setDay(e.target.value) }} className="mb-4 rounded-xl border border-line p-3" /></Field>
    {book.error && <p role="alert" className="mb-4 text-red-600">{errorMessage(book.error)}</p>}
    {cancel.error && <p role="alert" className="mb-4 text-red-600">{errorMessage(cancel.error)}</p>}
    {slots.isLoading ? <SkeletonGrid count={3} /> : slots.error ? <ErrorState error={slots.error} onRetry={slots.refetch} /> : !slots.data?.length ? <EmptyState title={tr('Bu kun uchun bo‘sh vaqtlar yo‘q')} /> :
      <div className="grid gap-4 md:grid-cols-2">{slots.data.map((s) => <Card key={s.id} className="space-y-3 p-5">
        <h2 className="font-bold">{s.tutor}</h2><p>{s.course}</p>
        <p className="text-sm">{fmtDateTime(s.start)} — {fmtDateTime(s.end)}</p>
        <p className="text-sm">{tr('Bo‘sh joylar')}: {s.seatsLeft} / 3</p>
        {s.attendance && <p className="text-sm font-medium">{tr(s.attendance === 'late' ? 'Kechikdi' : 'Keldi')}</p>}
        {s.booked ? <Button disabled={cancel.isPending} onClick={() => cancel.mutate(s)}>{tr('Bronni bekor qilish')}</Button> : <Button disabled={!s.canBook || book.isPending} onClick={() => book.mutate(s)}>{s.canBook ? tr('Yozilish') : tr('Yozilish yopilgan')}</Button>}
      </Card>)}</div>}
  </>
}
