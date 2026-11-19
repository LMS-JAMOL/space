import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell, BookOpen, BookOpenCheck, ChevronDown, ChevronRight, Crown, Flame, Gamepad2, LayoutDashboard, LogOut, Menu,
  ArrowUpRight, ShoppingBag, Wallet, X, Zap,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { backdropVariants, DURATION, EASE, fadeUpItem, pageVariants, popoverVariants, SPRING, staggerContainer } from '../../lib/motion'
import { ApiError, clearTokens } from '../../services/apiClient'
import { authService } from '../../services/authService'
import { notificationService } from '../../services/notificationService'
import { fill, fmtDateTime, fmtMoney, fmtNum } from '../../utils/format'
import { paymentService } from '../../services/paymentService'
import { Badge, cn } from '../ui'
import { MarsCoin } from '../ui/MarsCoin'
import { useLanguage } from '../../context/LanguageContext'
import type { Student } from '../../types'
import MarsLogo from '../ui/MarsLogo'
import { LangSwitcher } from './LangSwitcher'

export const NAV = [
  { to: '/main-page', label: 'Asosiy', icon: LayoutDashboard },
  { to: '/my-courses', label: 'Kurslarim', icon: BookOpen },
  { to: '/quizzes', label: 'Quizlar', icon: BookOpenCheck },
  { to: '/online-payment', label: "Onlayn to'lov", icon: Wallet },
  { to: '/space-shop', label: 'Space Shop', icon: ShoppingBag },
]

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: authService.me })

/** Payment info with the wallet; shared by the sidebar, the main page and the payment page. */
export const usePaymentInfo = () => useQuery({ queryKey: ['payments', 'info'], queryFn: paymentService.info, refetchInterval: 5 * 60_000 })

/**
 * The wallet, in front of the menu: how much of the paid money is left. It falls by one lesson
 * price after every lesson that is held. A debt shows in red, an ending balance in amber.
 */
function WalletCard() {
  const { tr } = useLanguage()
  const { data } = usePaymentInfo()
  const w = data?.wallet
  if (!w) return null
  const debt = w.debt > 0
  const tone = w.warning === 'debt' || debt ? 'border-red-200 bg-red-50/70 hover:border-red-300'
    : w.warning === 'ending' ? 'border-amber-200 bg-amber-50/70 hover:border-amber-300'
    : 'border-line bg-canvas/60 hover:border-mars-200 hover:bg-mars-50/40'
  const label = debt ? tr('Qarz') : tr('To‘langan qoldiq')
  const amount = fmtMoney(debt ? w.debt : w.remaining)
  return (
    <NavLink to="/online-payment" aria-label={`${tr('To‘lov hisobi')}: ${label} ${amount}`}
      className={cn('group mb-4 block rounded-xl border px-3.5 py-3 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-mars-400', tone)}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <span className={cn('grid size-6 place-items-center rounded-lg', debt ? 'bg-red-100 text-red-700' : 'bg-white text-ink/70')} aria-hidden="true"><Wallet className="size-3.5" /></span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="size-4 text-ink/40 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <div className={cn('mt-1.5 text-lg font-extrabold leading-tight tabular-nums', debt ? 'text-red-700' : 'text-ink')}>{amount}</div>
      {w.lessonPrice > 0 && <div className="mt-0.5 text-xs text-muted tabular-nums">{tr('1 dars')} ≈ {fmtMoney(w.lessonPrice)}</div>}
      {w.warning === 'ending' && !debt && <div className="mt-1.5 text-xs font-semibold text-amber-800">{tr('Qoldiq tugab bormoqda')}</div>}
    </NavLink>
  )
}

function Logo({ light }: { light?: boolean }) {
  return (
    // 16px tall below 380px so the header (menu, logo, coin, language, bell, profile) fits a 360px phone.
    <MarsLogo variant={light ? 'white' : 'navy'} withStrapline={false} className="h-4 w-auto min-[380px]:h-5 sm:h-6" />
  )
}

function Sidebar({ onNavigate, scope, stagger }: { onNavigate?: () => void; scope: string; stagger?: boolean }) {
  const { tr } = useLanguage()
  return (
    <>
    <WalletCard />
    {/* LayoutGroup keeps the desktop and drawer pills apart (both can be mounted). */}
    <LayoutGroup id={scope}>
    {/* Same look as the Branch Manager sidebar: soft section label, 44px rows, orange pill. */}
    <p className="px-3 pb-1.5 pt-1 text-xs font-medium text-muted">{tr('O‘quv maydoni')}</p>
    <motion.nav className="flex flex-col gap-0.5" aria-label={tr('Asosiy navigatsiya')}
      variants={stagger ? staggerContainer(0.03, 0.06) : undefined} initial={stagger ? 'initial' : false} animate="animate">
      {NAV.map(({ to, label, icon: Icon }) => (
        <motion.div key={to} variants={stagger ? fadeUpItem : undefined}>
          <NavLink to={to} onClick={onNavigate}
            className={({ isActive }) => cn(
              'group relative isolate flex min-h-11 items-center gap-3 rounded-[11px] px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-mars-400',
              isActive ? 'font-semibold text-white' : 'font-medium text-ink/75 hover:bg-canvas hover:text-ink active:bg-black/5',
            )}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-[11px] bg-[#f44516] shadow-[0_3px_8px_rgb(0_0_0/9%)]" transition={SPRING.snappy} aria-hidden="true" />}
                <Icon className={cn('relative size-[19px] shrink-0', isActive ? 'text-white' : 'text-ink/70 group-hover:text-ink')} aria-hidden="true" />
                <span className="relative">{tr(label)}</span>
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
    </LayoutGroup>
    <NavLink to="/space-shop" onClick={onNavigate} className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3.5 text-ink/70 outline-none transition-colors duration-150 hover:border-mars-200 hover:bg-canvas focus-visible:ring-2 focus-visible:ring-mars-400">
      <MarsCoin size={28} className="shrink-0" />
      <span className="min-w-0 flex-1"><strong className="block text-xs tracking-wide text-ink">MARS Space</strong><span className="mt-0.5 block text-xs text-muted">{tr('Coin evaziga sovg‘alar')}</span></span>
      <ArrowUpRight className="size-[17px] shrink-0" aria-hidden="true" />
    </NavLink>
    </>
  )
}

type StatDef = { key: string; label: string; hint?: string; value: string; short: string; icon: (size: number) => ReactNode; tone: string; show: string }

/** The four gamification counters, labelled: shared by the header pills and their popover. */
function useStats(me: Student): StatDef[] {
  const { tr } = useLanguage()
  return [
    { key: 'coins', label: tr('MARS Coin'), hint: tr('Mentor beradi, Space Shop’da sarflanadi'), value: fmtNum(me.coins), short: fmtNum(me.coins),
      icon: (size) => <MarsCoin size={size + 2} className="shrink-0" />, tone: 'bg-amber-50 text-amber-800', show: 'flex' },
    { key: 'streak', label: tr('Streak'), hint: tr('Ketma-ket kunlar seriyasi'), value: fill(tr('{n} kun'), { n: me.streak }), short: String(me.streak),
      icon: (size) => <Flame style={{ width: size, height: size }} className="shrink-0" aria-hidden="true" />, tone: 'bg-mars-50 text-mars-700', show: 'hidden md:flex' },
    { key: 'points', label: tr('Ballar'), value: fmtNum(me.points), short: fmtNum(me.points),
      icon: (size) => <Gamepad2 style={{ width: size, height: size }} className="shrink-0" aria-hidden="true" />, tone: 'bg-violet-50 text-violet-700', show: 'hidden xl:flex' },
    { key: 'energy', label: tr('Energiya'), value: `${me.energy}/${me.maxEnergy}`, short: `${me.energy}/${me.maxEnergy}`,
      icon: (size) => <Zap style={{ width: size, height: size }} className="shrink-0" aria-hidden="true" />, tone: 'bg-sky-50 text-sky-800', show: 'hidden xl:flex' },
  ]
}

/**
 * Header counters as one button: phones see only the coin pill, wider screens more pills.
 * A click opens the full labelled list, so the header itself never wraps.
 */
function HeaderStats({ me }: { me: Student }) {
  const { tr } = useLanguage()
  const stats = useStats(me)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey) }
  }, [open])
  const summary = stats.map((s) => `${s.label}: ${s.value}`).join(', ')
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        aria-label={`${tr('Mening ko‘rsatkichlarim')}. ${summary}`}
        className={cn('flex h-11 items-center gap-1 rounded-xl px-1 transition-colors duration-150 hover:bg-canvas sm:h-10', open && 'bg-canvas')}>
        {stats.map((s) => (
          <span key={s.key} className={cn(s.show, 'h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-bold tabular-nums', s.tone)} aria-hidden="true">
            {s.icon(16)}{s.short}
          </span>
        ))}
        <ChevronDown className={cn('hidden size-4 text-muted transition-transform duration-150 sm:block', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-label={tr('Mening ko‘rsatkichlarim')} variants={popoverVariants} initial="initial" animate="animate" exit="exit" style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-line bg-white p-2 shadow-lift max-sm:fixed max-sm:inset-x-2 max-sm:top-[68px] max-sm:w-auto">
            <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold text-muted">{tr('Mening ko‘rsatkichlarim')}</p>
            <ul>
              {stats.map((s) => (
                <li key={s.key} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', s.tone)} aria-hidden="true">{s.icon(20)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{s.label}</span>
                    {s.hint && <span className="block text-xs leading-snug text-muted">{s.hint}</span>}
                  </span>
                  <span className="text-sm font-extrabold tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Notifications() {
  const { tr } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    refetchInterval: 10_000,
  })
  const read = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const unread = data?.filter((n) => !n.read).length ?? 0
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className={cn('relative grid size-11 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink sm:size-10', open && 'bg-canvas text-ink')}
        aria-label={unread > 0 ? `${tr('Bildirishnomalar')}: ${unread}` : tr('Bildirishnomalar')}>
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-mars-600 px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-white" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
      </button>
      <AnimatePresence>
      {open && (
        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-lift max-sm:fixed max-sm:inset-x-2 max-sm:top-[68px] max-sm:w-auto">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <span className="font-bold">{tr('Bildirishnomalar')}</span>
            {unread > 0 && <Badge tone="orange">{fill(tr('{n} ta yangi'), { n: unread })}</Badge>}
          </div>
          <div className="max-h-[min(20rem,70dvh)] divide-y divide-line overflow-auto">
            {!data?.length && (
              <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                <span className="grid size-10 place-items-center rounded-xl bg-canvas text-muted" aria-hidden="true"><Bell className="size-5" /></span>
                <p className="text-sm text-muted">{tr("Bildirishnomalar yo'q")}</p>
              </div>
            )}
            {data?.map((n) => (
              <button key={n.id} type="button" onClick={() => !n.read && read.mutate(n.id)} className={cn('block w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas', !n.read && 'bg-mars-50/50')}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {!n.read && <span className="size-2 shrink-0 rounded-full bg-mars-500" aria-hidden="true" />}
                  {n.type === 'coin' && <MarsCoin size={18} className="shrink-0" />}
                  {n.type === 'coin'
                    ? tr('Mentor sizga {amount} coin berdi').replace('{amount}', fmtNum(n.data?.amount ?? 0))
                    : n.title}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {n.type === 'coin' ? `${tr('Guruh')}: ${n.body}` : n.body} · {fmtDateTime(n.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

function ProfileMenu() {
  const { tr } = useLanguage()
  const { data: me } = useMe()
  const [open, setOpen] = useState(false)
  const initials = me?.fullName.split(' ').map((s) => s[0]).join('').slice(0, 2) ?? '··'
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 150)} aria-expanded={open}
        className={cn('flex h-11 items-center gap-2 rounded-xl p-1.5 transition-colors duration-150 hover:bg-canvas sm:h-10 lg:pr-2.5', open && 'bg-canvas')} aria-label={tr('Profil menyusi')}>
        {me?.avatarUrl ? <img src={me.avatarUrl} alt="" className="size-8 rounded-lg object-cover" />
          : <div className="grid size-8 place-items-center rounded-lg bg-mars-600 text-xs font-bold text-white" aria-hidden="true">{initials}</div>}
        <span className="hidden max-w-40 truncate text-sm font-semibold lg:block">{me?.fullName ?? ''}</span>
        <ChevronDown className={cn('hidden size-4 text-muted transition-transform duration-150 lg:block', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence>
      {open && (
        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" style={{ transformOrigin: 'top right' }} className="absolute right-0 top-12 z-40 w-64 max-w-[calc(100vw-1rem)] rounded-2xl border border-line bg-white p-2 shadow-lift">
          <div className="mb-1 border-b border-line px-3 pb-3 pt-2">
            <div className="truncate font-bold">{me?.fullName}</div>
            <div className="mt-0.5 text-xs text-muted">{tr('Guruh')}: {me?.group ?? '—'}</div>
            {me && <div className="mt-2 flex flex-wrap gap-1.5"><Badge tone="orange">{tr('Level')} {me.level}</Badge>{me.isPremium && <Badge tone="violet"><Crown className="size-3" aria-hidden="true" />Premium</Badge>}</div>}
          </div>
          <button type="button" onClick={() => authService.logout().catch(() => {}).finally(() => { clearTokens(); location.reload() })}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-700 transition-colors duration-150 hover:bg-red-50 sm:min-h-10">
            <LogOut className="size-4" aria-hidden="true" />{tr('Chiqish')}
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

export function AppLayout() {
  const { tr } = useLanguage()
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: me, error } = useMe()
  // The rendered route is captured per render, so the leaving page keeps its own content while it fades out.
  const outlet = useOutlet()

  // Session genuinely dead (refresh failed too): drop the tokens and send the
  // user to the login screen instead of rendering the shell around a failing
  // profile. A plain access-token expiry never lands here — the client
  // refreshes silently before that (see apiClient's keep-alive).
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      clearTokens()
      navigate('/login', { replace: true })
    }
  }, [error, navigate])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  return (
    // "user": transform animations are skipped when the OS asks for reduced motion.
    <MotionConfig reducedMotion="user">
    <div className="min-h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:shadow-lift">{tr('Asosiy tarkibga o‘tish')}</a>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="flex h-16 min-w-0 items-center gap-0.5 px-1.5 min-[380px]:gap-1 min-[380px]:px-2 sm:gap-2 sm:px-4 lg:px-6">
          <button type="button" onClick={() => setDrawer(true)} aria-expanded={drawer} className="grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink lg:hidden" aria-label={tr('Menyu')}><Menu className="size-5" aria-hidden="true" /></button>
          <NavLink to="/main-page" aria-label={tr('Asosiy sahifa')} className="flex h-11 shrink-0 items-center rounded-xl px-0.5 min-[380px]:px-1"><Logo /></NavLink>
          <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-1.5">
            {me && <HeaderStats me={me} />}
            {me?.isPremium && <Badge tone="violet" className="hidden 2xl:inline-flex"><Crown className="size-3" aria-hidden="true" />Premium</Badge>}
            <LangSwitcher />
            <Notifications />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-[248px] overflow-y-auto border-r border-line bg-white p-3 pt-4 lg:block">
        <Sidebar scope="desktop" />
      </aside>

      <AnimatePresence>
        {drawer && (
          <motion.div key="drawer" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={tr('Menyu')} initial="initial" animate="animate" exit="exit">
            <motion.div variants={backdropVariants} className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={() => setDrawer(false)} aria-hidden="true" />
            <motion.div
              variants={{ initial: { x: '-100%' }, animate: { x: 0, transition: SPRING.drawer }, exit: { x: '-100%', transition: { duration: DURATION.base, ease: EASE.inOut } } }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto overscroll-contain bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lift"
            >
              <div className="mb-4 flex items-center justify-between pl-2"><Logo /><button type="button" autoFocus onClick={() => setDrawer(false)} className="grid size-11 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink" aria-label={tr('Yopish')}><X className="size-5" aria-hidden="true" /></button></div>
              <Sidebar scope="drawer" stagger onNavigate={() => setDrawer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" tabIndex={-1} className="outline-none lg:pl-[248px]">
        {/* The one page container: 1200px max, 16/24/32px gutters by breakpoint. */}
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
    </MotionConfig>
  )
}
