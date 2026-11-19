import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Check, Clock, GraduationCap, ListOrdered, Lock, PlayCircle, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Progress, Section, Skeleton, SkeletonGrid, Tabs, cn } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { courseService } from '../../services/courseService'
import CourseHomework from './CourseHomework'
import { useLanguage } from '../../context/LanguageContext'
import type { CourseStatus, CourseSummary } from '../../types'
import { fill } from '../../utils/format'

const EMPTY: Record<CourseStatus, [string, string]> = {
  active: ["Faol kurslar yo'q", 'Guruhga qo‘shilganingizdan so‘ng kurs shu yerda paydo bo‘ladi. Savol bo‘lsa, filial administratoriga murojaat qiling.'],
  completed: ["Tugallangan kurslar yo'q", 'Kursni yakunlaganingizdan keyin u shu bo‘limga o‘tadi.'],
  free: ["Bepul kurslar yo'q", 'Bepul kurslar qo‘shilganda shu yerda ko‘rinadi.'],
}

/** Lessons line + progress bar; "0/0" reads as "plan not entered yet", not as a broken 0%. */
function CourseProgress({ c }: { c: CourseSummary }) {
  const { tr } = useLanguage()
  if (c.lessonsTotal <= 0 && c.progress === null) return <p className="text-xs text-muted">{tr("Progress ma'lumoti yo'q")}</p>
  if (c.lessonsTotal <= 0) return <p className="text-xs text-muted">{tr('Darslar rejasi hali kiritilmagan')}</p>
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold tabular-nums">{fill(tr('{done}/{total} dars'), { done: c.lessonsDone, total: c.lessonsTotal })}</span>
        {c.progress !== null && <span className="font-extrabold tabular-nums text-mars-700">{c.progress}%</span>}
      </div>
      {c.progress !== null ? <Progress value={c.progress} label={`${c.title}: ${tr('Kurs progressi')}`} /> : <p className="text-xs text-muted">{tr("Progress ma'lumoti yo'q")}</p>}
    </>
  )
}

export function CoursesPage() {
  const { tr } = useLanguage()
  const [tab, setTab] = useState<CourseStatus>('active')
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['courses'], queryFn: () => courseService.list() })
  const list = data?.filter((c) => c.status === tab) ?? []
  const count = (s: CourseStatus) => data?.filter((c) => c.status === s).length

  return (
    <>
      <PageHeader title={tr('Kurslarim')} subtitle={tr('Faol, tugallangan va bepul kurslar')} />
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'active', label: tr('Faol'), count: count('active') },
        { value: 'completed', label: tr('Tugallangan'), count: count('completed') },
        { value: 'free', label: tr('Bepul'), count: count('free') },
      ]} />
      {isLoading ? <SkeletonGrid count={3} className="h-64 rounded-2xl" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : list.length === 0 ? <EmptyState title={tr(EMPTY[tab][0])} text={tr(EMPTY[tab][1])} icon={<BookOpen />}
            action={tab !== 'active' && count('active') ? <Button variant="secondary" onClick={() => setTab('active')}>{tr('Faol kurslarga o‘tish')}</Button> : undefined} />
        : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c) => (
              <li key={c.id}>
                <Card className="group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-mars-200 hover:shadow-lift">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mars-50 text-mars-600" aria-hidden="true"><GraduationCap className="size-6" /></div>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.code && <p className="mb-1 truncate font-mono text-xs font-bold uppercase tracking-wide text-muted" title={c.code}>{c.code}</p>}
                  <h2 className="text-lg font-extrabold leading-snug text-balance">{c.title}</h2>
                  {c.mentor && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><UserRound className="size-4 shrink-0" aria-hidden="true" />{tr('Mentor')}: {c.mentor}</p>}
                  <div className="mt-auto pt-5">
                    <CourseProgress c={c} />
                    <Link to={`/my-courses/${c.id}`} className="mt-4 block" aria-label={`${c.status === 'completed' ? tr("Ko'rish") : tr('Davom etish')}: ${c.title}`}>
                      <Button tabIndex={-1} variant={c.status === 'completed' ? 'secondary' : 'primary'} className="w-full">{c.status === 'completed' ? tr("Ko'rish") : tr('Davom etish')}<ArrowRight className="size-4" aria-hidden="true" /></Button>
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
    </>
  )
}

export function CourseDetailPage() {
  const { tr } = useLanguage()
  const { courseId = '' } = useParams()
  const { data: c, isLoading, error, refetch } = useQuery({ queryKey: ['course', courseId], queryFn: () => courseService.get(courseId) })
  const back = { to: '/my-courses', label: tr('Kurslarim') }

  if (isLoading) return (
    <div className="space-y-6" role="status" aria-label={tr('Yuklanmoqda')}>
      <Skeleton className="h-5 w-28" /><Skeleton className="h-44 rounded-2xl" />
      <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
    </div>
  )
  if (error || !c) return <><PageHeader back={back} title={tr('Kurs')} /><ErrorState error={error} onRetry={refetch} /></>

  const current = c.lessons?.find((l) => l.status === 'available')

  return (
    <>
      <PageHeader back={back} title={c.title} subtitle={c.description ?? undefined}
        eyebrow={<span className="flex flex-wrap items-center gap-2">{c.code && <span className="font-mono">{c.code}</span>}<StatusBadge status={c.status} /></span>} />

      <Card className="mb-8 grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div className="min-w-0 max-w-xl"><CourseProgress c={c} /></div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {c.mentor && <div><dt className="text-xs text-muted">{tr('Mentor')}</dt><dd className="font-semibold">{c.mentor}</dd></div>}
          {current && <div className="min-w-0"><dt className="text-xs text-muted">{tr('Keyingi qadam')}</dt><dd className="max-w-56 truncate font-semibold text-mars-700">{current.order}. {current.title}</dd></div>}
        </dl>
      </Card>

      <Section title={tr('Darslar')} action={c.lessons?.length ? <Badge tone="gray" className="tabular-nums">{c.lessons.length}</Badge> : undefined}>
        {!c.lessons?.length ? <EmptyState icon={<ListOrdered />} title={tr("Darslar ro'yxati mavjud emas")} text={tr('Mentor darslarni qo‘shgach, ular shu yerda ko‘rinadi.')} /> : (
          <Card className="overflow-hidden">
            <ol className="divide-y divide-line">
              {c.lessons.map((l) => (
                <li key={l.id} aria-current={l.status === 'available' ? 'step' : undefined}
                  className={cn('flex items-center gap-4 px-4 py-3.5 sm:px-5', l.status === 'available' && 'bg-mars-50/50')}>
                  <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl font-bold tabular-nums',
                    l.status === 'done' ? 'bg-emerald-50 text-emerald-700' : l.status === 'available' ? 'bg-mars-600 text-white' : 'bg-canvas text-slate-500')}>
                    {l.status === 'done' ? <Check className="size-5" aria-label={tr('Bajarildi')} /> : l.status === 'locked' ? <Lock className="size-4" aria-label={tr('Yopiq')} /> : l.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold leading-snug', l.status === 'locked' && 'text-muted')}>{l.order}. {l.title}</p>
                    {l.durationMin && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Clock className="size-3" aria-hidden="true" />{fill(tr('{n} daqiqa'), { n: l.durationMin })}</p>}
                  </div>
                  {l.status === 'available' && <Badge tone="orange"><PlayCircle className="size-3" aria-hidden="true" />{tr('Joriy')}</Badge>}
                </li>
              ))}
            </ol>
          </Card>
        )}
      </Section>
      <CourseHomework courseTitle={c.title} />
    </>
  )
}
