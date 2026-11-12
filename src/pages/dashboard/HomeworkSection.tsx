import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Paperclip } from 'lucide-react'
import { Button, Card, Modal } from '../../components/ui'
import { api, errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fmtDateTime } from '../../utils/format'

type Homework = { id: string; source: string; title: string; description: string; groupName: string | null; status: string; deadline: string | null; canSubmit: boolean; attempt: number }
type Attempt = { id: string; createdAt: string; status: string; comment: string | null; link?: string | null; attempt: number; attachments: { id: string; name: string; url: string }[] }

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
    <div className="mb-3 flex items-center gap-2"><BookOpen className="size-5 text-mars-500" /><h2 className="font-bold">{tr('Uy vazifalari')}</h2></div>
    {works.isLoading ? <p className="text-sm text-muted">{tr('Yuklanmoqda')}</p> : works.error ? <p role="alert" className="text-sm text-red-600">{errorMessage(works.error)}</p> : !homeworks.length ? <p className="text-sm text-muted">{tr('Hozircha uy vazifasi yo‘q')}</p> : <div className="grid gap-2 sm:grid-cols-2">{homeworks.map((work) => <button key={work.id} type="button" onClick={() => { setSelectedId(work.id); submit.reset() }} className="rounded-xl border border-line p-3 text-left transition hover:border-mars-400">
      <span className="block font-semibold">{work.title}</span><span className="block text-xs text-muted">{work.groupName || '—'} · {work.deadline ? `${tr('Muddat')}: ${fmtDateTime(work.deadline)}` : tr('Muddat yo‘q')}</span>
      <span className="mt-1 block text-xs">{work.status === 'submitted' ? tr('Tekshiruv kutilmoqda') : work.status === 'accepted' ? tr('Tekshirildi') : work.status === 'rejected' ? tr('Qayta ishlash mumkin') : tr('Topshirilmagan')}</span>
    </button>)}</div>}
    <Modal open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.title || tr('Uy vazifasi')} size="lg">
      {selected && <div className="space-y-4">
        {selected.description && <p className="whitespace-pre-wrap text-sm">{selected.description}</p>}
        <p className="text-sm text-muted">{tr('Urinish')}: {selected.attempt}. {tr('Qayta topshirish limiti yo‘q.')}</p>
        {selected.canSubmit && <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (comment.trim() || link.trim() || file) submit.mutate() }}>
          <label htmlFor={`${fieldId}-answer`} className="block text-sm font-medium">{tr('Javob')}<textarea id={`${fieldId}-answer`} className="mt-1 w-full rounded-xl border border-line p-3" rows={4} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
          <label htmlFor={`${fieldId}-link`} className="block text-sm font-medium">{tr('Havola')}<input id={`${fieldId}-link`} className="mt-1 w-full rounded-xl border border-line p-3" type="url" value={link} onChange={(event) => setLink(event.target.value)} /></label>
          <label htmlFor={`${fieldId}-file`} className="flex items-center gap-2 text-sm"><Paperclip className="size-4" aria-hidden="true" />{tr('Fayl')}<input id={`${fieldId}-file`} type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
          <Button type="submit" loading={submit.isPending} disabled={!comment.trim() && !link.trim() && !file}>{tr('Topshirish')}</Button>
          {submit.error && <p role="alert" className="text-sm text-red-600">{errorMessage(submit.error)}</p>}
        </form>}
        <div><h3 className="mb-2 font-semibold">{tr('Topshirishlar tarixi')}</h3>{history.isLoading ? <p className="text-sm text-muted">{tr('Yuklanmoqda')}</p> : history.error ? <p role="alert" className="text-sm text-red-600">{errorMessage(history.error)}</p> : !history.data?.length ? <p className="text-sm text-muted">{tr('Hali topshirilmagan')}</p> : <ul className="space-y-2">{history.data.map((attempt) => <li key={attempt.id} className="rounded-xl border border-line p-3 text-sm"><p className="font-semibold">#{attempt.attempt} · {fmtDateTime(attempt.createdAt)} · {attempt.status === 'submitted' ? tr('Tekshiruv kutilmoqda') : tr('Tekshirildi')}</p>{attempt.comment && <p className="mt-1 whitespace-pre-wrap">{attempt.comment}</p>}{attempt.link && <a href={attempt.link} target="_blank" rel="noreferrer" className="text-mars-600 underline">{tr('Havola')}</a>}{attempt.attachments?.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="ml-3 text-mars-600 underline">{attachment.name}</a>)}</li>)}</ul>}</div>
      </div>}
    </Modal>
  </Card>
}
