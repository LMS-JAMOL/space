import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, BookOpen, CalendarClock, Check, Coins, Flame, Keyboard, Lock, PlayCircle, QrCode, ShoppingBag, Swords, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BrowserQRCodeReader } from '@zxing/browser'
import { Badge, Button, Card, ErrorState, Progress, Skeleton, cn } from '../../components/ui'
import { dashboardService } from '../../services/dashboardService'
import { attendanceService, type AttendanceMark } from '../../services/attendanceService'
import TutorSection from './TutorSection'
import HomeworkSection from './HomeworkSection'
import { errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fill, fmtDate, fmtDateTime, fmtMoney, fmtNum } from '../../utils/format'
import { usePaymentInfo } from '../../components/layout/AppLayout'

// Server reasons a scan was refused, in the student's words.
const CHECKIN_ERRORS: Record<string, string> = {
  'Lesson QR has expired; scan the current code': 'QR eskirgan. Mentor ekranidagi yangi kodni skanerlang.',
  'Lesson QR has expired': 'Dars tugagan yoki hali boshlanmagan.',
  'Check in from the branch Wi-Fi': 'Filial Wi-Fi tarmog‘iga ulanib, qayta skanerlang.',
  'This phone has already checked in another student for this lesson': 'Bu telefon bu darsda boshqa o‘quvchini tasdiqlagan. O‘z telefoningizdan skanerlang.',
  'This device has already checked in another student for this lesson': 'Bu qurilma bu darsda boshqa o‘quvchini tasdiqlagan. O‘z qurilmangizdan belgilang.',
  'Wrong or expired PIN': 'PIN noto‘g‘ri yoki eskirgan. Mentor ekranidagi yangi PIN’ni kiriting.',
  'PIN must be 6 digits': 'PIN 6 ta raqamdan iborat.',
  'No lesson of yours is in progress': 'Hozir sizning darsingiz davom etmayapti.',
  'Too many wrong PINs for this lesson; scan the QR or ask the mentor': 'PIN ko‘p marta xato kiritildi. QR kodni skanerlang yoki mentorga ayting.',
  'Student is not enrolled in this lesson group': 'Siz bu dars guruhida emassiz.',
  'Invalid lesson QR code': 'Bu MARS dars QR kodi emas.',
}

/**
 * The student scans the code shown on the mentor's lesson page. Camera only:
 * a pasted code could be forwarded from the classroom to someone at home.
 */
function CheckinCard() {
  const { tr } = useLanguage()
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [pin, setPin] = useState('')
  const checkin = useMutation({
    mutationFn: (value: { code?: string; pin?: string }) =>
      value.pin ? attendanceService.checkinWithPin(value.pin) : attendanceService.checkin(value.code ?? ''),
    onSuccess: () => setPin(''),
  })
  const failure = checkin.error ? errorMessage(checkin.error) : ''
  const done = checkin.data?.checkin
  useEffect(() => {
    if (!scanning || !videoRef.current) return
    let cancelled = false
    const reader = new BrowserQRCodeReader()
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (!result || cancelled) return
      cancelled = true
      controlsRef.current?.stop()
      setScanning(false)
      checkin.mutate({ code: result.getText() })
    }).then((controls) => {
      if (cancelled) controls.stop()
      else controlsRef.current = controls
    }).catch((error) => {
      setCameraError(error instanceof Error ? error.message : tr('Kamerani ochib bo‘lmadi'))
      setScanning(false)
    })
    return () => { cancelled = true; controlsRef.current?.stop(); controlsRef.current = null }
  }, [scanning])
  return (
    <Card className="p-5">
      <h2 className="font-bold">{tr('Darsga kelganingizni tasdiqlang')}</h2>
      <p className="mt-1 text-sm text-muted">{tr('Mentor ko‘rsatgan QR kodni skanerlang yoki uning yonidagi 6 xonali PIN kodni kiriting.')}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Button type="button" onClick={() => { setCameraError(''); setScanning(true) }} disabled={scanning || checkin.isPending}><QrCode className="size-4" /> {tr('QR skan qilish')}</Button>
        <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); if (/^\d{6}$/.test(pin)) checkin.mutate({ pin }) }}>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            {tr('PIN kod')}
            <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} placeholder="••••••"
              className="h-10 w-32 rounded-[10px] border border-line bg-white px-3 text-center font-mono text-base tracking-[0.3em] text-ink outline-none transition focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
          </label>
          <Button type="submit" variant="secondary" disabled={pin.length !== 6 || checkin.isPending}><Keyboard className="size-4" /> {tr('Tasdiqlash')}</Button>
        </form>
      </div>
      {scanning && <div className="mt-3 space-y-2"><video ref={videoRef} className="max-h-64 w-full rounded-xl bg-black object-contain" muted playsInline aria-label={tr('QR kod uchun kamera')} /><Button type="button" variant="secondary" onClick={() => setScanning(false)}>{tr('Kamerani yopish')}</Button></div>}
      {cameraError && <p role="alert" className="mt-3 text-sm text-red-600">{cameraError}</p>}
      {cameraError && <p className="mt-2 text-sm text-muted">{tr('Kamera ishlamasa, mentor ekranidagi PIN kodni kiriting.')}</p>}
      {checkin.isPending && <p role="status" className="mt-3 text-sm text-muted">{tr('Tekshirilmoqda…')}</p>}
      {failure && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{CHECKIN_ERRORS[failure] ? tr(CHECKIN_ERRORS[failure]) : failure}</p>}
      {done && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{done.repeated ? tr('Siz allaqachon tasdiqlagansiz') : tr('Tasdiqlandi')}{done.group ? ` — ${done.group}` : ''}</p>}
    </Card>
  )
}

const MARK_TONE: Record<AttendanceMark['status'], string> = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  unmarked: 'bg-slate-100 text-slate-600',
}
const fmtClock = (iso: string) => new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

/** Own confirmed attendance (finalized journals): date, arrival time, minutes late. */
function MyAttendanceCard() {
  const { tr } = useLanguage()
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['my-attendance'], queryFn: attendanceService.history })
  const marks = data?.attendance ?? []
  const label = (m: AttendanceMark) => m.status === 'present'
    ? (m.late ? (m.lateMinutes != null ? fill(tr('Kechikdi: {n} daqiqa'), { n: m.lateMinutes }) : tr('Kechikdi')) : tr('Keldi'))
    : m.status === 'absent' ? tr('Kelmadi') : tr('Belgilanmagan')
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-bold"><CalendarClock className="size-5 text-mars-600" aria-hidden="true" />{tr('Mening davomatim')}</h2>
      <p className="mt-1 text-sm text-muted">{tr('Mentor yakunlagan darslar. Belgi xato bo‘lsa, mentorga murojaat qiling.')}</p>
      {isLoading && <div className="mt-3 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /></div>}
      {error && <div className="mt-3"><ErrorState error={error} onRetry={refetch} /></div>}
      {!isLoading && !error && marks.length === 0 && <p className="mt-3 rounded-xl bg-canvas p-3 text-sm text-muted">{tr('Hali yakunlangan darslar yo‘q.')}</p>}
      {marks.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {marks.slice(0, 10).map((m) => (
            <li key={m.attendanceId} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-semibold">{fmtDate(m.lessonStartsAt || m.date)}</span>
                <span className="text-muted"> · {m.group?.name ?? '—'}</span>
                {m.lessonStartsAt && <span className="block text-xs text-muted">
                  {fill(tr('Dars {start}'), { start: fmtClock(m.lessonStartsAt) })}
                  {m.arrivedAt ? ` · ${fill(tr('kelgan {time}'), { time: fmtClock(m.arrivedAt) })}` : ''}
                </span>}
              </span>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', m.status === 'present' && m.late ? 'bg-amber-50 text-amber-800' : MARK_TONE[m.status])}>{label(m)}</span>
            </li>
          ))}
        </ul>
      )}
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
      <div className="grid gap-5 lg:grid-cols-2">
        <CheckinCard />
        <MyAttendanceCard />
      </div>
      <TutorSection />
      <HomeworkSection />
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
