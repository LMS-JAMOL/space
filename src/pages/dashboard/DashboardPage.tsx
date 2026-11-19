import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, CalendarClock, Check, ClipboardList, Flame, Gamepad2, Keyboard, ListChecks, Lock, MapPin, QrCode, ShoppingBag, Swords, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BrowserQRCodeReader } from '@zxing/browser'
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, InlineAlert, Progress, Section, Skeleton, cn } from '../../components/ui'
import { MarsCoin } from '../../components/ui/MarsCoin'
import { dashboardService } from '../../services/dashboardService'
import { attendanceService, type AttendanceMark } from '../../services/attendanceService'
import TutorSection from './TutorSection'
import HomeworkSection from './HomeworkSection'
import { errorMessage } from '../../services/apiClient'
import { useLanguage } from '../../context/LanguageContext'
import { fill, fmtDate, fmtMoney, fmtNum } from '../../utils/format'
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
    <Card className="flex flex-col p-5">
      <CardHeader icon={<QrCode />} title={tr('Darsga kelganingizni tasdiqlang')}
        description={tr('Mentor ko‘rsatgan QR kodni skanerlang yoki uning yonidagi 6 xonali PIN kodni kiriting.')} />
      <div className="mt-5 space-y-3">
        <Button type="button" className="w-full" onClick={() => { setCameraError(''); setScanning(true) }} disabled={scanning || checkin.isPending}>
          <QrCode className="size-4" aria-hidden="true" /> {tr('QR skan qilish')}
        </Button>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted" aria-hidden="true"><span className="h-px flex-1 bg-line" />{tr('yoki')}<span className="h-px flex-1 bg-line" /></div>
        <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); if (/^\d{6}$/.test(pin)) checkin.mutate({ pin }) }}>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted">
            {tr('PIN kod')}
            <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} placeholder="••••••"
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-center font-mono text-base tracking-[0.3em] text-ink outline-none transition placeholder:text-muted hover:border-mars-200 focus:border-mars-400 focus:ring-4 focus:ring-mars-100" />
          </label>
          <Button type="submit" variant="secondary" className="sm:h-11" disabled={pin.length !== 6 || checkin.isPending}><Keyboard className="size-4" aria-hidden="true" /> {tr('Tasdiqlash')}</Button>
        </form>
      </div>
      {scanning && <div className="mt-3 space-y-2"><video ref={videoRef} className="max-h-64 w-full rounded-xl bg-navy-900 object-contain" muted playsInline aria-label={tr('QR kod uchun kamera')} /><Button type="button" variant="secondary" className="w-full" onClick={() => setScanning(false)}>{tr('Kamerani yopish')}</Button></div>}
      {cameraError && <InlineAlert tone="warning" role="alert" className="mt-3" title={cameraError}>{tr('Kamera ishlamasa, mentor ekranidagi PIN kodni kiriting.')}</InlineAlert>}
      {checkin.isPending && <p role="status" className="mt-3 text-sm text-muted">{tr('Tekshirilmoqda…')}</p>}
      {failure && <InlineAlert tone="danger" role="alert" className="mt-3">{CHECKIN_ERRORS[failure] ? tr(CHECKIN_ERRORS[failure]) : failure}</InlineAlert>}
      {done && <InlineAlert tone="success" role="status" className="mt-3">{done.repeated ? tr('Siz allaqachon tasdiqlagansiz') : tr('Tasdiqlandi')}{done.group ? ` — ${done.group}` : ''}</InlineAlert>}
    </Card>
  )
}

const MARK_TONE: Record<AttendanceMark['status'], string> = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  unmarked: 'bg-slate-100 text-slate-700',
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
      <CardHeader icon={<CalendarClock />} title={tr('Mening davomatim')} description={tr('Mentor yakunlagan darslar. Belgi xato bo‘lsa, mentorga murojaat qiling.')} />
      {isLoading && <div className="space-y-2" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
      {error && <ErrorState compact error={error} onRetry={refetch} />}
      {!isLoading && !error && marks.length === 0 && <EmptyState compact icon={<CalendarClock />} title={tr('Hali yakunlangan darslar yo‘q.')} />}
      {marks.length > 0 && (
        <ul className="-mx-1 divide-y divide-line">
          {marks.slice(0, 10).map((m) => (
            <li key={m.attendanceId} className="flex items-center justify-between gap-3 px-1 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-semibold tabular-nums">{fmtDate(m.lessonStartsAt || m.date)}</span>
                <span className="text-muted"> · {m.group?.name ?? '—'}</span>
                {m.lessonStartsAt && <span className="block text-xs text-muted tabular-nums">
                  {fill(tr('Dars {start}'), { start: fmtClock(m.lessonStartsAt) })}
                  {m.arrivedAt ? ` · ${fill(tr('kelgan {time}'), { time: fmtClock(m.arrivedAt) })}` : ''}
                </span>}
              </span>
              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', m.status === 'present' && m.late ? 'bg-amber-50 text-amber-800' : MARK_TONE[m.status])}>{label(m)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function DashboardSkeleton() {
  const { tr } = useLanguage()
  return (
    <div className="space-y-8" role="status" aria-label={tr('Yuklanmoqda')}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" /><Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}

export default function DashboardPage() {
  const { tr } = useLanguage()
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get })
  const wallet = usePaymentInfo().data?.wallet

  if (isLoading) return <DashboardSkeleton />
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />

  const { student: s, journey, activeCourse, assignments, schedule, unfinishedLessons, typing } = data
  const stats = [
    { l: 'MARS Coin', v: fmtNum(s.coins), i: <MarsCoin size={22} />, c: 'bg-amber-50' },
    { l: 'Streak', v: fill(tr('{n} kun'), { n: s.streak }), i: <Flame className="size-5" aria-hidden="true" />, c: 'text-mars-700 bg-mars-50' },
    { l: 'Ballar', v: fmtNum(s.points), i: <Gamepad2 className="size-5" aria-hidden="true" />, c: 'text-violet-700 bg-violet-50' },
    { l: 'Energiya', v: `${s.energy}/${s.maxEnergy}`, i: <Zap className="size-5" aria-hidden="true" />, c: 'text-sky-700 bg-sky-50' },
  ]
  const lessonsKnown = Boolean(activeCourse && activeCourse.lessonsTotal > 0)

  return (
    <div className="space-y-8 sm:space-y-10">
      {wallet?.warning && (
        <InlineAlert role="alert" tone={wallet.warning === 'debt' ? 'danger' : 'warning'}
          action={<Link to="/online-payment"><Button size="sm" className="w-full sm:w-auto">{tr("To'lash")}</Button></Link>}>
          {wallet.warning === 'debt'
            ? fill(tr("Sizda {sum} qarz bor. Iltimos, to'lovni amalga oshiring."), { sum: fmtMoney(wallet.debt) })
            : fill(tr("Oy oxiri yaqinlashmoqda: to'langan qoldiq {sum}. Keyingi oy darslari uchun to'lovni oldindan qiling."), { sum: fmtMoney(wallet.remaining) })}
        </InlineAlert>
      )}

      {/* (a) Hero: who I am, my level, my counters — and the course to continue. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-mars-600">{tr('Xush kelibsiz')}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-balance sm:text-[28px] sm:leading-9">{s.fullName}</h1>
          <p className="mt-1 text-sm text-muted">{tr('Guruh')} {s.group ?? '—'}</p>

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-mars-50/70 p-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-center shadow-card ring-1 ring-mars-100">
              <div className="leading-none"><div className="text-[10px] font-bold uppercase tracking-wide text-muted">{tr('Level')}</div><div className="mt-0.5 text-2xl font-extrabold tabular-nums">{s.level}</div></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-baseline justify-between gap-2 text-sm"><span className="font-semibold">{tr('Keyingi levelgacha')}</span><span className="font-extrabold tabular-nums text-mars-700">{s.levelProgress}%</span></div>
              <Progress value={s.levelProgress} className="h-2.5 bg-white" label={tr('Keyingi levelgacha')} />
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((x) => (
              <div key={x.l} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', x.c)} aria-hidden="true">{x.i}</span>
                <div className="min-w-0">
                  <dt className="truncate text-xs font-medium text-muted">{tr(x.l)}</dt>
                  <dd className="truncate font-extrabold tabular-nums">{x.v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <CardHeader icon={<BookOpen />} title={tr('Faol kurs')} />
          {activeCourse ? (
            <div className="flex flex-1 flex-col">
              <p className="text-lg font-extrabold leading-snug text-balance">{activeCourse.title}</p>
              {activeCourse.code && <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-muted"><span>{tr('Kurs kodi')}:</span><span title={activeCourse.code} className="inline-block min-w-0 max-w-full truncate rounded-full bg-mars-50 px-2.5 py-0.5 font-mono font-semibold text-mars-700">{activeCourse.code}</span></p>}
              <div className="mt-5">
                {lessonsKnown ? (
                  <>
                    <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold tabular-nums">{fill(tr('{done}/{total} dars'), { done: activeCourse.lessonsDone, total: activeCourse.lessonsTotal })}</span>
                      {activeCourse.progress !== null && <span className="font-extrabold tabular-nums text-mars-700">{activeCourse.progress}%</span>}
                    </div>
                    {activeCourse.progress !== null && <Progress value={activeCourse.progress} label={tr('Kurs progressi')} />}
                  </>
                ) : (
                  <p className="rounded-xl bg-canvas px-3 py-2.5 text-sm text-muted">{tr('Darslar rejasi hali kiritilmagan')}</p>
                )}
              </div>
              <Link to={`/my-courses/${activeCourse.id}`} className="mt-auto pt-5"><Button className="w-full">{tr('Davom etish')} <ArrowRight className="size-4" aria-hidden="true" /></Button></Link>
            </div>
          ) : (
            <EmptyState compact icon={<BookOpen />} title={tr("Faol kurs yo'q")} action={<Link to="/my-courses"><Button size="sm" variant="secondary">{tr('Kurslarim')}</Button></Link>} />
          )}
        </Card>
      </div>

      {/* (b) Today: what the student needs to do now. */}
      <Section title={tr('Bugun')} description={tr('Darsga kelishni tasdiqlang, yaqin darslar va vazifalarni ko‘ring')}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CheckinCard />

          <Card className="p-5">
            <CardHeader icon={<CalendarClock />} title={tr('Yaqin darslar')} />
            {schedule.length === 0 ? <EmptyState compact icon={<CalendarClock />} title={tr("Yaqin darslar yo'q")} /> : (
              <ul className="space-y-2">
                {schedule.map((x) => {
                  const at = new Date(x.startsAt)
                  return (
                    <li key={x.id} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                      <div className={cn('grid w-14 shrink-0 place-items-center rounded-lg py-1.5 text-center leading-tight', x.type === 'extra' ? 'bg-violet-50 text-violet-800' : 'bg-mars-50 text-mars-800')}>
                        <span className="text-base font-extrabold tabular-nums">{at.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[11px] font-semibold tabular-nums">{at.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{x.title}</p>
                        {x.room && <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="size-3" aria-hidden="true" />{x.room}</p>}
                      </div>
                      {x.type === 'extra' && <Badge tone="violet">{tr("Qo'shimcha")}</Badge>}
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="p-5 md:col-span-2 xl:col-span-1">
            <CardHeader icon={<ListChecks />} title={tr('Vazifalar')} />
            <dl className="grid grid-cols-2 gap-2">
              {([['Jami', assignments.total, 'bg-canvas text-ink'], ['Kutilmoqda', assignments.pending, 'bg-amber-50 text-amber-800'], ['Tekshirildi', assignments.reviewed, 'bg-emerald-50 text-emerald-800'], ["Muddati o'tgan", assignments.overdue, 'bg-red-50 text-red-700']] as const).map(([l, v, c]) => (
                <div key={l} className={cn('rounded-xl p-3', c)}><dd className="text-2xl font-extrabold tabular-nums">{v}</dd><dt className="text-xs font-semibold">{tr(l)}</dt></div>
              ))}
            </dl>
            {unfinishedLessons.length > 0 && (
              <div className="mt-4 rounded-xl border border-mars-200 bg-mars-50/60 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-mars-700">{tr('Tugallanmagan dars')}</p>
                <ul className="mt-1">
                  {unfinishedLessons.map((l) => (
                    <li key={l.id}>
                      <Link to={`/my-courses/${l.courseId}`} className="flex min-h-11 items-center justify-between gap-2 rounded-lg text-sm font-semibold transition-colors duration-150 hover:text-mars-700">
                        <span className="min-w-0 truncate">{l.title} · <span className="font-medium text-muted">{l.courseTitle}</span></span><ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
        <div className="mt-4"><HomeworkSection /></div>
      </Section>

      {/* (c) More: extra lessons, my record, my path, practice. */}
      <Section title={tr('Ko‘proq imkoniyatlar')} description={tr('Qo‘shimcha dars, davomat va o‘quv yo‘lingiz')}>
        <div className="space-y-4">
          <TutorSection />
          <div className="grid gap-4 lg:grid-cols-2">
            <MyAttendanceCard />
            <div className="space-y-4">
              <Card className="p-5">
                <CardHeader icon={<ClipboardList />} title={tr("O'quv yo'li")} />
                {journey.length === 0 ? <EmptyState compact icon={<ClipboardList />} title={tr("O'quv yo'li hali shakllanmagan")} /> : (
                  <ol className="-mx-1 flex items-start overflow-x-auto px-1 pb-2">
                    {journey.map((j, i) => (
                      <li key={j.id} className="flex items-start" aria-current={j.status === 'current' ? 'step' : undefined}>
                        <div className="flex w-20 flex-col items-center gap-2 text-center">
                          <div className={cn('grid size-11 place-items-center rounded-2xl border-2 font-bold tabular-nums',
                            j.status === 'done' && 'border-emerald-600 bg-emerald-600 text-white',
                            j.status === 'current' && 'border-mars-500 bg-white text-mars-700 animate-pulse-ring',
                            j.status === 'locked' && 'border-line bg-canvas text-slate-500')}>
                            {j.status === 'done' ? <Check className="size-5" aria-label={tr('Bajarildi')} /> : j.status === 'locked' ? <Lock className="size-4" aria-label={tr('Yopiq')} /> : i + 1}
                          </div>
                          <span className={cn('text-xs font-semibold leading-snug', j.status === 'locked' ? 'text-muted' : 'text-ink')}>{j.title}</span>
                        </div>
                        {i < journey.length - 1 && <div className={cn('mt-5 h-1 w-6 shrink-0 rounded-full sm:w-10', j.status === 'done' ? 'bg-emerald-400' : 'bg-line')} aria-hidden="true" />}
                      </li>
                    ))}
                  </ol>
                )}
              </Card>

              <Card className="border-navy-50 bg-navy-50/60 p-5">
                <CardHeader icon={<Keyboard />} title={tr('Tez yozish')} description={tr('Har kuni 5 daqiqa mashq')} />
                <dl className="grid grid-cols-3 gap-2">
                  {([['Eng yaxshi', typing.bestWpm], ['Oxirgi', typing.lastWpm], ['Aniqlik', typing.accuracy !== null ? `${typing.accuracy}%` : null]] as const).map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-white p-3">
                      <dd className="font-mono text-xl font-bold tabular-nums text-navy-700">{v ?? '—'}</dd>
                      <dt className="text-xs text-muted">{tr(l)}{l !== 'Aniqlik' && ' WPM'}</dt>
                    </div>
                  ))}
                </dl>
                <Link to="/my-courses"><Button variant="secondary" className="mt-4 w-full">{tr('Mashqni boshlash')}</Button></Link>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['/space-shop', 'Space Shop', ShoppingBag], ['/my-courses', 'Kurslarim', BookOpen]].map(([to, l, I]) => {
              const Icon = I as typeof Swords
              return (
                <Link key={to as string} to={to as string} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition duration-150 hover:-translate-y-0.5 hover:border-mars-200 hover:shadow-lift">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-mars-50 text-mars-600 transition-colors duration-150 group-hover:bg-mars-600 group-hover:text-white" aria-hidden="true"><Icon className="size-5" /></div>
                  <span className="min-w-0 flex-1 text-sm font-bold">{tr(l as string)}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </div>
      </Section>
    </div>
  )
}
