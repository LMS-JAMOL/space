import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, BookOpen, CalendarClock, Check, Coins, Flame, Keyboard, Lock, PlayCircle, ShoppingBag, Swords, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Badge, Button, Card, ErrorState, Progress, Skeleton, cn } from '../../components/ui'
import { dashboardService } from '../../services/dashboardService'
import { attendanceService } from '../../services/attendanceService'
import TutorSection from './TutorSection'
import { errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fill, fmtDateTime, fmtMoney, fmtNum } from '../../utils/format'
import { usePaymentInfo } from '../../components/layout/AppLayout'

/** The student types the code the mentor shows in class: a second witness that he was at the lesson. */
function CheckinCard() {
  const { tr } = useLanguage()
  const [code, setCode] = useState('')
  const checkin = useMutation({ mutationFn: () => attendanceService.checkin(code), onSuccess: () => setCode('') })
  const done = checkin.data?.checkin
  return (
    <Card className="p-5">
      <h2 className="font-bold">{tr('Darsga kelganingizni tasdiqlang')}</h2>
      <p className="mt-1 text-sm text-muted">{tr('Mentor darsda 6 xonali kod ko‘rsatadi — uni shu yerga kiriting.')}</p>
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (/^\d{6}$/.test(code)) checkin.mutate() }}>
        <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          aria-label={tr('Davomat kodi')} placeholder="000000"
          className="h-10 w-40 rounded-[10px] border border-line bg-white px-3 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
        <Button type="submit" loading={checkin.isPending} disabled={!/^\d{6}$/.test(code)}>{tr('Tasdiqlash')}</Button>
      </form>
      {checkin.error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage(checkin.error)}</p>}
      {done && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{done.repeated ? tr('Siz allaqachon tasdiqlagansiz') : tr('Tasdiqlandi')}{done.group ? ` — ${done.group}` : ''}</p>}
    </Card>
  )
}

export default function DashboardPage() {
  const { tr } = useLanguage()
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get })
  const wallet = usePaymentInfo().data?.wallet

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
      {wallet?.warning && (
        <div role="alert" className={cn('flex flex-wrap items-center gap-3 rounded-[10px] border px-4 py-3', wallet.warning === 'debt' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-300 bg-amber-50 text-amber-900')}>
          <AlertTriangle className="size-5 shrink-0" />
          <p className="min-w-0 flex-1 text-sm font-semibold">
            {wallet.warning === 'debt'
              ? fill(tr("Sizda {sum} qarz bor. Iltimos, to'lovni amalga oshiring."), { sum: fmtMoney(wallet.debt) })
              : fill(tr("Oy oxiri yaqinlashmoqda: to'langan qoldiq {sum}. Keyingi oy darslari uchun to'lovni oldindan qiling."), { sum: fmtMoney(wallet.remaining) })}
          </p>
          <Link to="/online-payment"><Button size="sm">{tr("To'lash")}</Button></Link>
        </div>
      )}
      <CheckinCard />
      <TutorSection />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-6 lg:col-span-2 animate-fade-up">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-mars-200 to-mars-500 opacity-25 blur-2xl" />
          <p className="text-sm font-semibold text-mars-600">{tr('Xush kelibsiz 👋')}</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">{s.fullName}</h1>
          <p className="mt-1 text-sm text-muted">{tr('Guruh')} {s.group ?? '—'}</p>
          <div className="mt-6 flex items-end gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-ink text-white">
              <div className="text-center leading-none"><div className="text-[10px] uppercase text-navy-300">{tr('Level')}</div><div className="text-2xl font-extrabold">{s.level}</div></div>
            </div>
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">{tr('Keyingi levelgacha')}</span><span className="font-bold text-mars-600">{s.levelProgress}%</span></div>
              <Progress value={s.levelProgress} className="h-3" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: 'MARS Coin', v: fmtNum(s.coins), i: <Coins className="size-4" />, c: 'text-amber-600 bg-amber-50' },
              { l: 'Streak', v: fill(tr('{n} kun'), { n: s.streak }), i: <Flame className="size-4" />, c: 'text-mars-600 bg-mars-50' },
              { l: 'Ballar', v: fmtNum(s.points), i: <Trophy className="size-4" />, c: 'text-violet-600 bg-violet-50' },
              { l: 'Energiya', v: `${s.energy}/${s.maxEnergy}`, i: <PlayCircle className="size-4" />, c: 'text-sky-600 bg-sky-50' },
            ].map((x) => (
              <div key={x.l} className="rounded-xl border border-line p-3">
                <div className={cn('mb-2 grid size-7 place-items-center rounded-lg', x.c)}>{x.i}</div>
                <div className="font-extrabold">{x.v}</div><div className="text-xs text-muted">{tr(x.l)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 animate-fade-up">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{tr('Faol kurs')}</h2><BookOpen className="size-5 text-mars-500" /></div>
          {activeCourse ? (
            <>
              <Badge tone="orange">{activeCourse.code}</Badge>
              <p className="mt-2 text-lg font-extrabold">{activeCourse.title}</p>
              <p className="text-sm text-muted">{fill(tr('{done}/{total} dars'), { done: activeCourse.lessonsDone, total: activeCourse.lessonsTotal })}</p>
              {activeCourse.progress !== null && <><Progress value={activeCourse.progress} className="mt-4" /><p className="mt-1 text-right text-xs font-bold text-mars-600">{activeCourse.progress}%</p></>}
              <Link to={`/my-courses/${activeCourse.id}`}><Button className="mt-4 w-full">{tr('Davom etish')} <ArrowRight className="size-4" /></Button></Link>
            </>
          ) : <p className="text-sm text-muted">{tr("Faol kurs yo'q")}</p>}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-5 font-bold">{tr("O'quv yo'li")}</h2>
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
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{tr('Vazifalar')}</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {[['Jami', assignments.total, 'bg-canvas'], ['Kutilmoqda', assignments.pending, 'bg-amber-50 text-amber-700'], ['Tekshirildi', assignments.reviewed, 'bg-emerald-50 text-emerald-700'], ["Muddati o'tgan", assignments.overdue, 'bg-red-50 text-red-600']].map(([l, v, c]) => (
              <div key={l as string} className={cn('rounded-xl p-3', c as string)}><div className="text-2xl font-extrabold">{v}</div><div className="text-xs font-semibold opacity-80">{tr(l as string)}</div></div>
            ))}
          </div>
          {unfinishedLessons.length > 0 && (
            <div className="mt-4 rounded-xl border border-mars-200 bg-mars-50 p-3">
              <p className="text-xs font-bold uppercase text-mars-600">{tr('Tugallanmagan dars')}</p>
              {unfinishedLessons.map((l) => (
                <Link key={l.id} to={`/my-courses/${l.courseId}`} className="mt-1 flex items-center justify-between text-sm font-semibold hover:text-mars-600">{l.title} · {l.courseTitle}<ArrowRight className="size-4" /></Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{tr('Jadval')}</h2><CalendarClock className="size-5 text-mars-500" /></div>
          {schedule.length === 0 ? <p className="text-sm text-muted">{tr("Yaqin darslar yo'q")}</p> : (
            <ul className="space-y-3">
              {schedule.map((x) => (
                <li key={x.id} className="flex gap-3">
                  <div className={cn('w-1 rounded-full', x.type === 'extra' ? 'bg-violet-400' : 'bg-mars-500')} />
                  <div className="flex-1"><p className="text-sm font-semibold">{x.title}</p><p className="text-xs text-muted">{fmtDateTime(x.startsAt)} · {x.room ?? ''}</p></div>
                  {x.type === 'extra' && <Badge tone="violet">{tr("Qo'shimcha")}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="relative overflow-hidden bg-ink p-6 text-white border-ink">
          <Keyboard className="absolute -bottom-4 -right-4 size-32 text-white/5" />
          <h2 className="font-bold">{tr('Tez yozish')}</h2>
          <p className="mt-1 text-sm text-navy-300">{tr('Har kuni 5 daqiqa mashq')}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 font-mono">
            {[['Eng yaxshi', typing.bestWpm], ['Oxirgi', typing.lastWpm], ['Aniqlik', typing.accuracy !== null ? `${typing.accuracy}%` : null]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-white/5 p-3"><div className="text-xl font-bold text-mars-400">{v ?? '—'}</div><div className="font-sans text-[11px] text-navy-300">{tr(l as string)}{l !== 'Aniqlik' && ' WPM'}</div></div>
            ))}
          </div>
          <Link to="/my-courses"><Button className="mt-5 w-full">{tr('Mashqni boshlash')}</Button></Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[['/space-shop', 'Space Shop', ShoppingBag], ['/my-courses', 'Kurslarim', BookOpen]].map(([to, l, I]) => {
          const Icon = I as typeof Swords
          return (
            <Link key={to as string} to={to as string} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="grid size-10 place-items-center rounded-xl bg-mars-50 text-mars-500 group-hover:bg-mars-500 group-hover:text-white transition"><Icon className="size-5" /></div>
              <span className="text-sm font-bold">{tr(l as string)}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
