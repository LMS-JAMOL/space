import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Download, FileText, MessageSquare, Paperclip, Upload } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, EmptyState, ErrorState, Field, Modal, PageHeader, Skeleton, SkeletonGrid, Tabs } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { errorMessage } from '../../services/apiClient'
import { worksService } from '../../services/worksService'
import type { Work } from '../../types'
import { fmtDate, fmtDateTime, fmtSize } from '../../utils/format'

type Kind = Work['kind']

export default function WorksPage() {
  const [tab, setTab] = useState<Kind>('assignment')
  const [selected, setSelected] = useState<Work | null>(null)
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['works'], queryFn: () => worksService.list() })
  const list = data?.filter((w) => w.kind === tab) ?? []

  return (
    <>
      <PageHeader title="Mening ishlarim" subtitle="Vazifalar, portfolio va ish rejasi" />
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'assignment', label: 'Vazifalar', count: data?.filter((w) => w.kind === 'assignment').length },
        { value: 'portfolio', label: 'Portfolio', count: data?.filter((w) => w.kind === 'portfolio').length },
        { value: 'plan', label: 'Ish rejasi', count: data?.filter((w) => w.kind === 'plan').length },
      ]} />
      {isLoading ? <SkeletonGrid count={3} /> : error ? <ErrorState error={error} onRetry={refetch} />
        : list.length === 0 ? <EmptyState title="Ishlar yo'q" icon={<FileText />} />
        : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((w) => (
              <Card key={w.id} className="flex flex-col p-5 animate-fade-up">
                <div className="mb-3 flex items-start justify-between gap-2"><h3 className="font-bold">{w.title}</h3><StatusBadge status={w.status} /></div>
                {w.courseTitle && <p className="text-xs text-muted">{w.courseTitle}</p>}
                <div className="mt-3 space-y-1 text-xs text-muted">
                  {w.deadline && <p className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Muddat: {fmtDate(w.deadline)}</p>}
                  {w.submittedAt && <p className="flex items-center gap-1.5"><Upload className="size-3.5" />Topshirilgan: {fmtDate(w.submittedAt)}</p>}
                  {w.attachments.length > 0 && <p className="flex items-center gap-1.5"><Paperclip className="size-3.5" />{w.attachments.length} ta fayl</p>}
                </div>
                {w.mentorFeedback && <div className="mt-3 rounded-xl bg-canvas p-3 text-sm"><p className="mb-1 flex items-center gap-1 text-xs font-bold text-muted"><MessageSquare className="size-3" />Mentor{w.score != null && ` · ${w.score} ball`}</p>{w.mentorFeedback}</div>}
                <Button variant="secondary" className="mt-4 w-full" onClick={() => setSelected(w)}>Batafsil</Button>
              </Card>
            ))}
          </div>
        )}
      {selected && <WorkModal work={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function WorkModal({ work, onClose }: { work: Work; onClose: () => void }) {
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const subs = useQuery({ queryKey: ['submissions', work.id], queryFn: () => worksService.submissions(work.id) })
  const submit = useMutation({
    mutationFn: () => worksService.submit(work.id, { comment, files }),
    onSuccess: () => {
      setComment(''); setFiles([])
      qc.invalidateQueries({ queryKey: ['works'] })
      qc.invalidateQueries({ queryKey: ['submissions', work.id] })
    },
  })
  const canSubmit = ['not_submitted', 'rejected'].includes(work.status)

  return (
    <Modal open onClose={onClose} title={work.title} size="lg">
      <div className="mb-4 flex flex-wrap gap-2"><StatusBadge status={work.status} />{work.deadline && <span className="text-sm text-muted">Muddat: {fmtDate(work.deadline)}</span>}</div>
      {work.attachments.length > 0 && (
        <div className="mb-5 space-y-2">
          {work.attachments.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm hover:border-mars-300">
              <FileText className="size-5 text-mars-500" /><span className="flex-1 font-semibold">{a.name}</span><span className="text-xs text-muted">{fmtSize(a.sizeBytes)}</span><Download className="size-4 text-muted" />
            </a>
          ))}
        </div>
      )}
      {canSubmit && (
        <form className="mb-6 space-y-3 rounded-2xl bg-canvas p-4" onSubmit={(e) => { e.preventDefault(); submit.mutate() }}>
          <p className="font-bold">Ishni topshirish</p>
          <Field label="Izoh"><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-mars-400" /></Field>
          <Field label="Fayllar"><input type="file" multiple onChange={(e) => setFiles([...(e.target.files ?? [])])} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mars-500 file:px-3 file:py-2 file:font-semibold file:text-white" /></Field>
          {submit.error && <p className="text-sm text-red-600">{errorMessage(submit.error)}</p>}
          {submit.isSuccess && <p className="text-sm font-semibold text-emerald-600">Server qabul qildi: {submit.data.status}</p>}
          <Button type="submit" loading={submit.isPending} disabled={!files.length && !comment.trim()}>Topshirish</Button>
        </form>
      )}
      <p className="mb-2 font-bold">Topshirishlar tarixi</p>
      {subs.isLoading ? <Skeleton className="h-20" /> : subs.error ? <ErrorState error={subs.error} onRetry={subs.refetch} />
        : !subs.data?.length ? <p className="text-sm text-muted">Hali topshirilmagan</p> : (
          <ul className="space-y-2">
            {subs.data.map((s) => (
              <li key={s.id} className="rounded-xl border border-line p-3 text-sm">
                <div className="flex justify-between"><span className="text-muted">{fmtDateTime(s.createdAt)}</span><StatusBadge status={s.status} /></div>
                {s.comment && <p className="mt-1">{s.comment}</p>}
                {s.feedback && <p className="mt-1 text-muted">Mentor: {s.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
    </Modal>
  )
}
