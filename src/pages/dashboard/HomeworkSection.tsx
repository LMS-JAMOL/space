import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, CalendarDays, ChevronRight, Paperclip } from 'lucide-react'
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, InlineAlert, Modal, Skeleton, inputCls, textareaCls, type Tone } from '../../components/ui'
import { api, errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fmtDateTime } from '../../utils/format'

type Homework = { id: string; source: string; title: string; description: string; groupName: string | null; status: string; deadline: string | null; canSubmit: boolean; attempt: number }
type Attempt = { id: string; createdAt: string; status: string; comment: string | null; link?: string | null; attempt: number; attachments: { id: string; name: string; url: string }[] }

const STATUS: Record<string, [string, Tone]> = {
  submitted: ['Tekshiruv kutilmoqda', 'yellow'],
  accepted: ['Tekshirildi', 'green'],
  rejected: ['Qayta ishlash mumkin', 'red'],
}
const statusOf = (status: string): [string, Tone] => STATUS[status] ?? ['Topshirilmagan', 'gray']

export default function HomeworkSection() {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const fieldId = useId()
  const [comment, setComment] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const works = useQuery({ queryKey: ['homework'], queryFn: () => api.get<Homework[]>('/works') })
  const homeworks = works.data?.filter((work) => work.source === 'homework') ?? []
  const selected = homeworks.find((work) => work.id === selectedId)
  const history = useQuery({ queryKey: ['homework-history', selectedId], enabled: Boolean(selectedId), queryFn: () => api.get<Attempt[]>(`/works/${selectedId}/submissions`) })
  const submit = useMutation({
    mutationFn: async () => {
      const body = new FormData()
      if (comment.trim()) body.set('comment', comment.trim())
      if (link.trim()) body.set('link', link.trim())
      if (file) body.append('files', file)
      return api.post(`/works/${selectedId}/submissions`, body)
    },
    onSuccess: () => { setComment(''); setLink(''); setFile(null); qc.invalidateQueries({ queryKey: ['homework'] }); qc.invalidateQueries({ queryKey: ['homework-history', selectedId] }) },
  })
  return <Card className="p-5">
    <CardHeader icon={<BookOpen />} title={tr('Uy vazifalari')} description={tr('Baho qo‘yilmaydi, istalgancha qayta topshirish mumkin.')} />
    {works.isLoading ? <div className="grid gap-2 sm:grid-cols-2" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      : works.error ? <ErrorState compact error={works.error} onRetry={works.refetch} />
      : !homeworks.length ? <EmptyState compact icon={<BookOpen />} title={tr('Hozircha uy vazifasi yo‘q')} />
      : <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{homeworks.map((work) => {
        const [label, tone] = statusOf(work.status)
        return <li key={work.id}><button type="button" onClick={() => { setSelectedId(work.id); submit.reset() }}
          className="group flex h-full w-full items-start gap-3 rounded-xl border border-line p-3 text-left transition-colors duration-150 hover:border-mars-300 hover:bg-mars-50/30">
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-snug">{work.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span>{work.groupName || '—'}</span>
              <span className="flex items-center gap-1 tabular-nums"><CalendarDays className="size-3" aria-hidden="true" />{work.deadline ? `${tr('Muddat')}: ${fmtDateTime(work.deadline)}` : tr('Muddat yo‘q')}</span>
            </span>
            <Badge tone={tone} className="mt-2">{tr(label)}</Badge>
          </span>
          <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </button></li>
      })}</ul>}
    <Modal open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.title || tr('Uy vazifasi')} size="lg" busy={submit.isPending}
      description={selected ? `${tr('Urinish')}: ${selected.attempt}. ${tr('Qayta topshirish limiti yo‘q.')}` : undefined}>
      {selected && <div className="space-y-5">
        {selected.description && <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.description}</p>}
        {selected.canSubmit && <form className="space-y-3 rounded-2xl border border-line p-4" onSubmit={(event) => { event.preventDefault(); if (comment.trim() || link.trim() || file) submit.mutate() }}>
          <label htmlFor={`${fieldId}-answer`} className="block text-sm font-semibold">{tr('Javob')}<textarea id={`${fieldId}-answer`} className={`mt-1.5 ${textareaCls}`} rows={4} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
          <label htmlFor={`${fieldId}-link`} className="block text-sm font-semibold">{tr('Havola')}<input id={`${fieldId}-link`} className={`mt-1.5 ${inputCls}`} type="url" placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} /></label>
          <label htmlFor={`${fieldId}-file`} className="block text-sm font-semibold">
            <span className="flex items-center gap-2"><Paperclip className="size-4" aria-hidden="true" />{tr('Fayl')}</span>
            <input id={`${fieldId}-file`} type="file" onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:h-10 file:cursor-pointer file:rounded-xl file:border file:border-line file:bg-white file:px-3 file:text-sm file:font-semibold file:text-ink hover:file:border-mars-300" />
          </label>
          {submit.error && <InlineAlert tone="danger" role="alert">{errorMessage(submit.error)}</InlineAlert>}
          {submit.isSuccess && <InlineAlert tone="success" role="status">{tr('Vazifa topshirildi. Backend tekshiruvi yangilandi.')}</InlineAlert>}
          <div className="flex justify-end"><Button type="submit" className="max-sm:w-full" loading={submit.isPending} disabled={!comment.trim() && !link.trim() && !file}>{tr('Topshirish')}</Button></div>
        </form>}
        <div><h3 className="mb-2 font-bold">{tr('Topshirishlar tarixi')}</h3>{history.isLoading ? <Skeleton className="h-16" /> : history.error ? <ErrorState compact error={history.error} onRetry={history.refetch} /> : !history.data?.length ? <p className="rounded-xl bg-canvas p-3 text-sm text-muted">{tr('Hali topshirilmagan')}</p> : <ul className="space-y-2">{history.data.map((attempt) => <li key={attempt.id} className="rounded-xl border border-line p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold tabular-nums">#{attempt.attempt} · {fmtDateTime(attempt.createdAt)}</span><Badge tone={attempt.status === 'submitted' ? 'yellow' : 'green'}>{attempt.status === 'submitted' ? tr('Tekshiruv kutilmoqda') : tr('Tekshirildi')}</Badge></div>
          {attempt.comment && <p className="mt-1.5 whitespace-pre-wrap">{attempt.comment}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3">{attempt.link && <a href={attempt.link} target="_blank" rel="noreferrer" className="font-semibold text-mars-700 underline underline-offset-2">{tr('Havola')}</a>}{attempt.attachments?.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="break-all font-semibold text-mars-700 underline underline-offset-2">{attachment.name}</a>)}</div>
        </li>)}</ul>}</div>
      </div>}
    </Modal>
  </Card>
}
