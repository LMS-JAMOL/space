import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CloudUpload, Link2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Card, ErrorState, Modal, Skeleton, cn } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { API_BASE_URL, errorMessage } from '../../services/apiClient'
import { MAX_FILE_MB, homeworkService, type Homework } from '../../services/homeworkService'
import { useLanguage } from '../../context/LanguageContext'
import { fill, fmtDate, fmtDateTime, fmtSize } from '../../utils/format'

const fileHref = (url: string) => (url.startsWith('/') ? new URL(url, new URL(API_BASE_URL || '/', window.location.origin)).href : url)

/**
 * Homework of a course, on the course page: every homework of the student's group for this course
 * with its status and a "Vazifa" button. The button opens the upload form (file, link, comment) and
 * the history of attempts with the mentor's score and feedback — the "Mening ishlarim" page is gone.
 */
export default function CourseHomework({ courseTitle }: { courseTitle: string }) {
  const { tr } = useLanguage()
  const [open, setOpen] = useState<string | null>(null)
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['course-homework'], queryFn: homeworkService.list })

  // the homework of THIS course; a group whose course name differs from the card title still shows its own
  const list = (data ?? []).filter((h) => !h.courseTitle || h.courseTitle === courseTitle)

  return (
    <section className="mt-6" aria-label={tr('Uy vazifalari')}>
      <h2 className="mb-3 font-bold">{tr('Uy vazifalari')}</h2>
      {isLoading ? <Skeleton className="h-24" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : !list.length ? <Card className="p-5 text-sm text-muted">{tr('Hozircha uy vazifasi yo‘q.')}</Card> : (
          <Card className="divide-y divide-line">
            {list.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{h.title}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    {h.deadline && <span className="flex items-center gap-1"><CalendarDays className="size-3" />{tr('Muddat')}: {fmtDate(h.deadline)}</span>}
                    {h.score != null && <span>{fill(tr('{n} ball'), { n: h.score })}</span>}
                  </p>
                </div>
                <StatusBadge status={h.status} />
                <Button size="sm" variant={h.canSubmit ? 'primary' : 'secondary'} onClick={() => setOpen(h.id)}>{tr('Vazifa')}</Button>
              </div>
            ))}
          </Card>
        )}
      {open && <HomeworkModal work={list.find((h) => h.id === open) ?? null} onClose={() => setOpen(null)} />}
    </section>
  )
}

function HomeworkModal({ work, onClose }: { work: Homework | null; onClose: () => void }) {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [comment, setComment] = useState('')
  const [link, setLink] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [tooBig, setTooBig] = useState(false)
  const [drag, setDrag] = useState(false)
  const history = useQuery({ queryKey: ['course-homework-history', work?.id], queryFn: () => homeworkService.history(work!.id), enabled: Boolean(work) })
  const submit = useMutation({
    mutationFn: () => homeworkService.submit(work!.id, { comment: comment.trim(), link: link.trim(), files }),
    onSuccess: () => {
      setComment(''); setLink(''); setFiles([])
      qc.invalidateQueries({ queryKey: ['course-homework'] })
      qc.invalidateQueries({ queryKey: ['homework'] }) // the main page list too
      qc.invalidateQueries({ queryKey: ['course-homework-history', work?.id] })
    },
  })
  if (!work) return null

  const addFiles = (list: FileList | File[]) => {
    const next = [...list]
    const big = next.some((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    setTooBig(big)
    if (!big) setFiles(next)
  }
  const ready = files.length > 0 || link.trim().length > 0 || comment.trim().length > 0

  return (
    <Modal open onClose={onClose} title={work.title} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={work.status} />
          {work.deadline && <span className="text-sm text-muted">{tr('Muddat')}: {fmtDate(work.deadline)}</span>}
          {work.attempt > 0 && <span className="text-sm text-muted">{tr('Urinish')}: {work.attempt}</span>}
        </div>
        {work.description && <p className="whitespace-pre-wrap text-sm">{work.description}</p>}
        {work.needsAttention && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{tr('Oddiy urinishlar tugadi. Mentor bilan bog‘laning.')}</p>}
        {work.mentorFeedback && <div className="rounded-xl bg-canvas p-3 text-sm"><p className="mb-1 text-xs font-bold text-muted">{tr('Mentor')}{work.score != null && ` · ${fill(tr('{n} ball'), { n: work.score })}`}</p>{work.mentorFeedback}</div>}

        {work.canSubmit ? (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (ready) submit.mutate() }}>
            <h3 className="font-bold">{tr('Fayl yuborish')}</h3>
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              className={cn('flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-mars-500',
                drag ? 'border-mars-500 bg-mars-50' : 'border-mars-300 hover:bg-mars-50/50')}>
              <CloudUpload className="size-10 text-muted" aria-hidden="true" />
              <span>{fill(tr('Vazifani yuklash uchun faylni tanlang max({n}mb)'), { n: MAX_FILE_MB })}</span>
            </button>
            <input ref={input} type="file" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
            {tooBig && <p role="alert" className="text-sm text-red-600">{fill(tr('Fayl {n} MB dan katta bo‘lmasligi kerak.'), { n: MAX_FILE_MB })}</p>}
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{f.name}</span><span className="text-xs text-muted">{fmtSize(f.size)}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} aria-label={tr('O‘chirish')} className="rounded p-1 text-muted hover:bg-canvas"><X className="size-4" /></button>
                  </li>
                ))}
              </ul>
            )}
            <label className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-3">
              <Link2 className="size-4 text-muted" aria-hidden="true" />
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder={tr('link joylang')} aria-label={tr('link joylang')} className="h-11 w-full bg-transparent text-sm outline-none" />
            </label>
            <div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={256} rows={3} placeholder={tr('Izoh qoldiring')} aria-label={tr('Izoh qoldiring')}
                className="w-full rounded-[10px] border border-line bg-white p-3 text-sm outline-none focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
              <p className="text-right text-xs text-muted">{comment.length} / 256</p>
            </div>
            {submit.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(submit.error)}</p>}
            {submit.isSuccess && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{tr('Vazifa topshirildi. Mentor tekshiradi.')}</p>}
            <div className="flex justify-end"><Button type="submit" loading={submit.isPending} disabled={!ready}>{tr('Yuklash')}</Button></div>
          </form>
        ) : (
          <p className="rounded-xl bg-canvas p-3 text-sm text-muted">{work.status === 'submitted' ? tr('Vazifangiz mentor tekshiruvida.') : tr('Bu vazifani endi topshirib bo‘lmaydi.')}</p>
        )}

        <div>
          <h3 className="mb-2 font-bold">{tr('Topshirishlar tarixi')}</h3>
          {history.isLoading ? <Skeleton className="h-16" /> : history.error ? <ErrorState error={history.error} onRetry={history.refetch} />
            : !history.data?.length ? <p className="text-sm text-muted">{tr('Hali topshirilmagan')}</p> : (
              <ul className="space-y-2">
                {history.data.map((s) => (
                  <li key={s.id} className="rounded-xl border border-line p-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted">{tr('Urinish')} {s.attempt} · {fmtDateTime(s.createdAt)}</span><StatusBadge status={s.status} /></div>
                    {s.comment && <p className="mt-1">{s.comment}</p>}
                    {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="block break-all underline">{s.link}</a>}
                    {s.attachments.map((a) => <a key={a.id} href={fileHref(a.url)} target="_blank" rel="noreferrer" className="block underline">{a.name}</a>)}
                    {s.score != null && <p className="mt-1 font-semibold">{tr('Yakuniy ball')}: {s.score}</p>}
                    {s.feedback && <p className="mt-1 text-muted">{tr('Mentor')}: {s.feedback}</p>}
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </Modal>
  )
}
