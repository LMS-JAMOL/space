import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, CalendarClock, Check, Coins, Flame, Keyboard, Lock, PlayCircle, ShoppingBag, Swords, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, ErrorState, Progress, Skeleton, cn } from '../../components/ui'
import { dashboardService } from '../../services/dashboardService'
import { fmtDateTime, fmtNum } from '../../utils/format'

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get })

  if (isLoading) return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Skeleton className="h-56 lg:col-span-2" /><Skeleton className="h-56" /><Skeleton className="h-40 lg:col-span-3" />
      <Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" />
    </div>
  )
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />

  const { student: s, journey, activeCourse, assignments, schedule, unfinishedLessons, typing } = data

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-6 lg:col-span-2 animate-fade-up">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-mars-200 to-mars-500 opacity-25 blur-2xl" />
          <p className="text-sm font-semibold text-mars-600">Xush kelibsiz 👋</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">{s.fullName}</h1>
          <p className="mt-1 text-sm text-muted">Guruh {s.group ?? '—'}</p>
          <div className="mt-6 flex items-end gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-ink text-white">
              <div className="text-center leading-none"><div className="text-[10px] uppercase text-navy-300">Level</div><div className="text-2xl font-extrabold">{s.level}</div></div>
            </div>
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">Keyingi levelgacha</span><span className="font-bold text-mars-600">{s.levelProgress}%</span></div>
              <Progress value={s.levelProgress} className="h-3" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: 'MARS Coin', v: fmtNum(s.coins), i: <Coins className="size-4" />, c: 'text-amber-600 bg-amber-50' },
              { l: 'Streak', v: `${s.streak} kun`, i: <Flame className="size-4" />, c: 'text-mars-600 bg-mars-50' },
              { l: 'Ballar', v: fmtNum(s.points), i: <Trophy className="size-4" />, c: 'text-violet-600 bg-violet-50' },
              { l: 'Energiya', v: `${s.energy}/${s.maxEnergy}`, i: <PlayCircle className="size-4" />, c: 'text-sky-600 bg-sky-50' },
            ].map((x) => (
              <div key={x.l} className="rounded-xl border border-line p-3">
                <div className={cn('mb-2 grid size-7 place-items-center rounded-lg', x.c)}>{x.i}</div>
                <div className="font-extrabold">{x.v}</div><div className="text-xs text-muted">{x.l}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 animate-fade-up">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Faol kurs</h2><BookOpen className="size-5 text-mars-500" /></div>
          {activeCourse ? (
            <>
              <Badge tone="orange">{activeCourse.code}</Badge>
              <p className="mt-2 text-lg font-extrabold">{activeCourse.title}</p>
              <p className="text-sm text-muted">{activeCourse.lessonsDone}/{activeCourse.lessonsTotal} dars</p>
              {activeCourse.progress !== null && <><Progress value={activeCourse.progress} className="mt-4" /><p className="mt-1 text-right text-xs font-bold text-mars-600">{activeCourse.progress}%</p></>}
              <Link to={`/my-courses/${activeCourse.id}`}><Button className="mt-4 w-full">Davom etish <ArrowRight className="size-4" /></Button></Link>
            </>
          ) : <p className="text-sm text-muted">Faol kurs yo'q</p>}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-5 font-bold">O'quv yo'li</h2>
        <div className="flex items-center overflow-x-auto pb-2">
          {journey.map((j, i) => (
            <div key={j.id} className="flex items-center">
              <div className="flex w-20 flex-col items-center gap-2">
                <div className={cn('grid size-12 place-items-center rounded-2xl border-2 font-bold transition',
                  j.status === 'done' && 'border-emerald-500 bg-emerald-500 text-white',
                  j.status === 'current' && 'border-mars-500 bg-white text-mars-600 animate-pulse-ring',
                  j.status === 'locked' && 'border-line bg-canvas text-slate-400')}>
                  {j.status === 'done' ? <Check className="size-5" /> : j.status === 'locked' ? <Lock className="size-4" /> : i + 1}
                </div>
                <span className={cn('text-xs font-semibold', j.status === 'locked' ? 'text-muted' : 'text-ink')}>{j.title}</span>
              </div>
              {i < journey.length - 1 && <div className={cn('mb-6 h-1 w-8 sm:w-14 rounded-full', j.status === 'done' ? 'bg-emerald-400' : 'bg-line')} />}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Vazifalar</h2><Link to="/my-works" className="text-sm font-semibold text-mars-600">Barchasi</Link></div>
          <div className="grid grid-cols-2 gap-3">
            {[['Jami', assignments.total, 'bg-canvas'], ['Kutilmoqda', assignments.pending, 'bg-amber-50 text-amber-700'], ['Tekshirildi', assignments.reviewed, 'bg-emerald-50 text-emerald-700'], ["Muddati o'tgan", assignments.overdue, 'bg-red-50 text-red-600']].map(([l, v, c]) => (
              <div key={l as string} className={cn('rounded-xl p-3', c as string)}><div className="text-2xl font-extrabold">{v}</div><div className="text-xs font-semibold opacity-80">{l}</div></div>
            ))}
          </div>
          {unfinishedLessons.length > 0 && (
            <div className="mt-4 rounded-xl border border-mars-200 bg-mars-50 p-3">
              <p className="text-xs font-bold uppercase text-mars-600">Tugallanmagan dars</p>
              {unfinishedLessons.map((l) => (
                <Link key={l.id} to={`/my-courses/${l.courseId}`} className="mt-1 flex items-center justify-between text-sm font-semibold hover:text-mars-600">{l.title} · {l.courseTitle}<ArrowRight className="size-4" /></Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Jadval</h2><CalendarClock className="size-5 text-mars-500" /></div>
          {schedule.length === 0 ? <p className="text-sm text-muted">Yaqin darslar yo'q</p> : (
            <ul className="space-y-3">
              {schedule.map((x) => (
                <li key={x.id} className="flex gap-3">
                  <div className={cn('w-1 rounded-full', x.type === 'extra' ? 'bg-violet-400' : 'bg-mars-500')} />
                  <div className="flex-1"><p className="text-sm font-semibold">{x.title}</p><p className="text-xs text-muted">{fmtDateTime(x.startsAt)} · {x.room ?? ''}</p></div>
                  {x.type === 'extra' && <Badge tone="violet">Qo'shimcha</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="relative overflow-hidden bg-ink p-6 text-white border-ink">
          <Keyboard className="absolute -bottom-4 -right-4 size-32 text-white/5" />
          <h2 className="font-bold">Tez yozish</h2>
          <p className="mt-1 text-sm text-navy-300">Har kuni 5 daqiqa mashq</p>
          <div className="mt-5 grid grid-cols-3 gap-2 font-mono">
            {[['Eng yaxshi', typing.bestWpm], ['Oxirgi', typing.lastWpm], ['Aniqlik', typing.accuracy !== null ? `${typing.accuracy}%` : null]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-white/5 p-3"><div className="text-xl font-bold text-mars-400">{v ?? '—'}</div><div className="font-sans text-[11px] text-navy-300">{l}{l !== 'Aniqlik' && ' WPM'}</div></div>
            ))}
          </div>
          <Link to="/my-courses"><Button className="mt-5 w-full">Mashqni boshlash</Button></Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['/battle', 'Battle', Swords], ['/hackathon', 'Xakaton', Trophy], ['/space-shop', 'Space Shop', ShoppingBag], ['/my-courses', 'Kurslarim', BookOpen]].map(([to, l, I]) => {
          const Icon = I as typeof Swords
          return (
            <Link key={to as string} to={to as string} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="grid size-10 place-items-center rounded-xl bg-mars-50 text-mars-500 group-hover:bg-mars-500 group-hover:text-white transition"><Icon className="size-5" /></div>
              <span className="text-sm font-bold">{l as string}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
