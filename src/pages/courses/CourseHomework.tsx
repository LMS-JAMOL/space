import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, CloudUpload, FileText, Link2, NotebookPen, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Card, EmptyState, ErrorState, InlineAlert, Modal, Section, Skeleton, cn, textareaCls } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { API_BASE_URL, errorMessage } from '../../services/apiClient'
import { MAX_FILE_MB, homeworkService, type Homework } from '../../services/homeworkService'
import { useLanguage } from '../../context/LanguageContext'
import { fill, fmtDate, fmtDateTime, fmtSize } from '../../utils/format'

const fileHref = (url: string) => (url.startsWith('/') ? new URL(url, new URL(API_BASE_URL || '/', window.location.origin)).href : url)

/**
 * Homework of a course, on the course page: every homework of the student's group for this course
 * with its status and a "Vazifa" button. The button opens the upload form (file, link, comment) and
 * the history of backend-checked attempts — the "Mening ishlarim" page is gone.
 */
export default function CourseHomework({ courseTitle }: { courseTitle: string }) {
  const { tr } = useLanguage()
  const [open, setOpen] = useState<string | null>(null)
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['course-homework'], queryFn: homeworkService.list })

  // the homework of THIS course; a group whose course name differs from the card title still shows its own
  const list = (data ?? []).filter((h) => !h.courseTitle || h.courseTitle === courseTitle)

  return (
    <Section className="mt-8" title={tr('Uy vazifalari')} description={tr('Baho qo‘yilmaydi, istalgancha qayta topshirish mumkin.')}>
      {isLoading ? <div className="space-y-2" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : error ? <ErrorState error={error} onRetry={refetch} />
        : !list.length ? <EmptyState icon={<NotebookPen />} title={tr('Hozircha uy vazifasi yo‘q.')} text={tr('Mentor vazifa berganda shu yerda paydo bo‘ladi.')} /> : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {list.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-muted" aria-hidden="true"><FileText className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug">{h.title}</p>
                    {h.deadline && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted tabular-nums"><CalendarDays className="size-3" aria-hidden="true" />{tr('Muddat')}: {fmtDate(h.deadline)}</p>}
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 pl-14 sm:w-auto sm:pl-0">
                    <StatusBadge status={h.status} />
                    <Button size="sm" variant={h.canSubmit ? 'primary' : 'secondary'} onClick={() => setOpen(h.id)} aria-label={`${tr('Vazifa')}: ${h.title}`}>{tr('Vazifa')}</Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      {open && <HomeworkModal work={list.find((h) => h.id === open) ?? null} onClose={() => setOpen(null)} />}
    </Section>
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
    <Modal open onClose={onClose} title={work.title} size="lg" busy={submit.isPending}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={work.status} />
          {work.deadline && <span className="text-sm text-muted tabular-nums">{tr('Muddat')}: {fmtDate(work.deadline)}</span>}
          {work.attempt > 0 && <span className="text-sm text-muted">{tr('Urinish')}: {work.attempt}</span>}
        </div>
        {work.description && <p className="whitespace-pre-wrap text-sm leading-relaxed">{work.description}</p>}
        {work.requirements?.length > 0 && <div className="rounded-xl bg-canvas p-3 text-sm"><p className="mb-1 font-semibold">{tr('Tekshiruv talablari')}</p><ul className="list-inside list-disc">{work.requirements.map((item) => <li key={item.key}>{item.label}</li>)}</ul></div>}
        {work.results?.length > 0 && <div className="rounded-xl border border-line p-3 text-sm"><p className="mb-1 font-semibold">{tr('Oxirgi tekshiruv')}</p><ul className="space-y-1">{work.results.map((item, index) => <li key={`${item.label}-${index}`} className={cn('flex items-start gap-2', item.passed ? 'text-emerald-800' : 'text-red-700')}>{item.passed ? <Check className="mt-0.5 size-4 shrink-0" aria-label={tr('To‘g‘ri')} /> : <X className="mt-0.5 size-4 shrink-0" aria-label={tr('Xato')} />}<span>{item.label}</span></li>)}</ul></div>}

        {work.canSubmit ? (
          <form className="space-y-3 rounded-2xl border border-line p-4" onSubmit={(e) => { e.preventDefault(); if (ready) submit.mutate() }}>
            <h3 className="font-bold">{tr('Fayl yuborish')}</h3>
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              className={cn('flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center text-sm transition-colors duration-150',
                drag ? 'border-mars-500 bg-mars-50' : 'border-mars-200 hover:border-mars-300 hover:bg-mars-50/50')}>
              <CloudUpload className="size-9 text-mars-600" aria-hidden="true" />
              <span>{fill(tr('Vazifani yuklash uchun faylni tanlang max({n}mb)'), { n: MAX_FILE_MB })}</span>
            </button>
            <input ref={input} type="file" multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
            {tooBig && <InlineAlert tone="danger" role="alert">{fill(tr('Fayl {n} MB dan katta bo‘lmasligi kerak.'), { n: MAX_FILE_MB })}</InlineAlert>}
            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-xl border border-line py-1 pl-3 pr-1 text-sm">
                    <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span><span className="text-xs text-muted tabular-nums">{fmtSize(f.size)}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} aria-label={`${tr('O‘chirish')}: ${f.name}`} className="grid size-10 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-red-50 hover:text-red-700"><X className="size-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
            <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 transition focus-within:border-mars-400 focus-within:ring-4 focus-within:ring-mars-100">
              <Link2 className="size-4 text-muted" aria-hidden="true" />
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder={tr('link joylang')} aria-label={tr('link joylang')} className="h-11 w-full bg-transparent text-sm outline-none" />
            </label>
            <div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={256} rows={3} placeholder={tr('Izoh qoldiring')} aria-label={tr('Izoh qoldiring')}
                className={textareaCls} />
              <p className="mt-1 text-right text-xs text-muted tabular-nums">{comment.length} / 256</p>
            </div>
            {submit.error && <InlineAlert tone="danger" role="alert">{errorMessage(submit.error)}</InlineAlert>}
            {submit.isSuccess && <InlineAlert tone="success" role="status">{tr('Vazifa topshirildi. Backend tekshiruvi yangilandi.')}</InlineAlert>}
            <div className="flex justify-end"><Button type="submit" className="max-sm:w-full" loading={submit.isPending} disabled={!ready}>{tr('Yuklash')}</Button></div>
          </form>
        ) : (
          <p className="rounded-xl bg-canvas p-3 text-sm text-muted">{work.status === 'submitted' ? tr('Vazifangiz mentor tekshiruvida.') : tr('Bu vazifani endi topshirib bo‘lmaydi.')}</p>
        )}

        <div>
          <h3 className="mb-2 font-bold">{tr('Topshirishlar tarixi')}</h3>
          {history.isLoading ? <Skeleton className="h-16" /> : history.error ? <ErrorState compact error={history.error} onRetry={history.refetch} />
            : !history.data?.length ? <p className="rounded-xl bg-canvas p-3 text-sm text-muted">{tr('Hali topshirilmagan')}</p> : (
              <ul className="space-y-2">
                {history.data.map((s) => (
                  <li key={s.id} className="rounded-xl border border-line p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-muted tabular-nums">{tr('Urinish')} {s.attempt} · {fmtDateTime(s.createdAt)}</span><StatusBadge status={s.status} /></div>
                    {s.comment && <p className="mt-1">{s.comment}</p>}
                    {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 block break-all font-semibold text-mars-700 underline underline-offset-2">{s.link}</a>}
                    {s.attachments.map((a) => <a key={a.id} href={fileHref(a.url)} target="_blank" rel="noreferrer" className="mt-1 block break-all font-semibold text-mars-700 underline underline-offset-2">{a.name}</a>)}
                    {s.results?.length > 0 && <ul className="mt-2 space-y-1">{s.results.map((item, index) => <li key={`${item.label}-${index}`} className={cn('flex items-start gap-2', item.passed ? 'text-emerald-800' : 'text-red-700')}>{item.passed ? <Check className="mt-0.5 size-4 shrink-0" aria-label={tr('To‘g‘ri')} /> : <X className="mt-0.5 size-4 shrink-0" aria-label={tr('Xato')} />}<span>{item.label}</span></li>)}</ul>}
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </Modal>
  )
}
