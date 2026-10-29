import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, Lock, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Progress, Skeleton, SkeletonGrid, Tabs, cn } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { courseService } from '../../services/courseService'
import type { CourseStatus } from '../../types'

export function CoursesPage() {
  const [tab, setTab] = useState<CourseStatus>('active')
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['courses'], queryFn: () => courseService.list() })
  const list = data?.filter((c) => c.status === tab) ?? []
  const count = (s: CourseStatus) => data?.filter((c) => c.status === s).length

  return (
    <>
      <PageHeader title="Kurslarim" subtitle="Faol, tugallangan va bepul kurslar" />
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'active', label: 'Faol', count: count('active') },
        { value: 'completed', label: 'Tugallangan', count: count('completed') },
        { value: 'free', label: 'Bepul', count: count('free') },
      ]} />
      {isLoading ? <SkeletonGrid count={3} className="h-52" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : list.length === 0 ? <EmptyState title="Kurslar yo'q" text="Bu bo'limda hozircha kurs mavjud emas." icon={<BookOpen />} />
        : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((c) => (
              <Card key={c.id} className="group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift animate-fade-up">
                <div className="mb-4 flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-mars-400 to-mars-600 text-white shadow-md shadow-mars-500/30"><BookOpen className="size-6" /></div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="font-mono text-xs font-bold text-muted">{c.code}</p>
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                {c.mentor && <p className="text-sm text-muted">Mentor: {c.mentor}</p>}
                <div className="mt-auto pt-5">
                  {c.progress !== null ? (
                    <><div className="mb-1.5 flex justify-between text-xs font-semibold"><span>{c.lessonsDone}/{c.lessonsTotal} dars</span><span className="text-mars-600">{c.progress}%</span></div><Progress value={c.progress} /></>
                  ) : <p className="text-xs text-muted">Progress ma'lumoti yo'q</p>}
                  <Link to={`/my-courses/${c.id}`}><Button variant={c.status === 'completed' ? 'secondary' : 'primary'} className="mt-4 w-full">{c.status === 'completed' ? "Ko'rish" : 'Davom etish'}<ArrowRight className="size-4" /></Button></Link>
                </div>
              </Card>
            ))}
          </div>
        )}
    </>
  )
}

export function CourseDetailPage() {
  const { courseId = '' } = useParams()
  const { data: c, isLoading, error, refetch } = useQuery({ queryKey: ['course', courseId], queryFn: () => courseService.get(courseId) })

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-80" /></div>
  if (error || !c) return <ErrorState error={error} onRetry={refetch} />

  return (
    <>
      <Link to="/my-courses" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" />Kurslarim</Link>
      <Card className="relative mb-5 overflow-hidden bg-ink p-6 text-white border-ink">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-mars-500/30 blur-2xl" />
        <Badge tone="orange">{c.code}</Badge>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">{c.title}</h1>
        {c.description && <p className="mt-1 max-w-xl text-sm text-navy-300">{c.description}</p>}
        {c.progress !== null && <div className="mt-5 max-w-md"><div className="mb-1.5 flex justify-between text-sm"><span>{c.lessonsDone}/{c.lessonsTotal} dars</span><span className="font-bold text-mars-400">{c.progress}%</span></div><Progress value={c.progress} dark /></div>}
      </Card>
      <h2 className="mb-3 font-bold">Darslar</h2>
      {!c.lessons?.length ? <EmptyState title="Darslar ro'yxati mavjud emas" /> : (
        <Card className="divide-y divide-line">
          {c.lessons.map((l) => (
            <div key={l.id} className={cn('flex items-center gap-4 px-5 py-4', l.status === 'locked' && 'opacity-55')}>
              <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl font-bold',
                l.status === 'done' ? 'bg-emerald-50 text-emerald-600' : l.status === 'available' ? 'bg-mars-500 text-white' : 'bg-canvas text-slate-400')}>
                {l.status === 'done' ? <Check className="size-5" /> : l.status === 'locked' ? <Lock className="size-4" /> : l.order}
              </div>
              <div className="flex-1"><p className="font-semibold">{l.order}. {l.title}</p>{l.durationMin && <p className="flex items-center gap-1 text-xs text-muted"><Clock className="size-3" />{l.durationMin} daqiqa</p>}</div>
              {l.status === 'available' && <Badge tone="orange"><PlayCircle className="size-3" />Joriy</Badge>}
            </div>
          ))}
        </Card>
      )}
    </>
  )
}
