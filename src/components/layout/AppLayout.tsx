import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell, BookOpen, BookOpenCheck, Coins, Crown, Flame, Gamepad2, LayoutDashboard, LogOut, Menu,
  ShoppingBag, Wallet, X, Zap,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { backdropVariants, DURATION, EASE, fadeUpItem, pageVariants, popoverVariants, SPRING, staggerContainer } from '../../lib/motion'
import { ApiError, clearTokens } from '../../services/apiClient'
import { authService } from '../../services/authService'
import { notificationService } from '../../services/notificationService'
import { fmtDateTime, fmtMoney, fmtNum } from '../../utils/format'
import { paymentService } from '../../services/paymentService'
import { Badge, cn } from '../ui'
import { useLanguage } from '../../context/LanguageContext'
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
  const tone = w.warning === 'debt' ? 'border-red-200 bg-red-50' : w.warning === 'ending' ? 'border-amber-200 bg-amber-50' : 'border-line bg-white'
  return (
    <NavLink to="/online-payment" aria-label={tr('To‘lov hisobi')}
      className={cn('mb-3 block rounded-[10px] border px-3 py-3 transition-colors hover:brightness-[0.98]', tone)}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted"><Wallet className="size-4" />{w.debt > 0 ? tr('Qarz') : tr('To‘langan qoldiq')}</div>
      <div className={cn('mt-1 text-xl font-extrabold', w.debt > 0 ? 'text-red-600' : 'text-ink')}>{fmtMoney(w.debt > 0 ? w.debt : w.remaining)}</div>
      {w.lessonPrice > 0 && <div className="mt-0.5 text-[11px] text-muted">{tr('1 dars')} ≈ {fmtMoney(w.lessonPrice)}</div>}
    </NavLink>
  )
}

function Logo({ light }: { light?: boolean }) {
  return (
    <MarsLogo variant={light ? 'white' : 'navy'} withStrapline={false} className="h-6 w-auto" />
  )
}

function Sidebar({ onNavigate, scope, stagger }: { onNavigate?: () => void; scope: string; stagger?: boolean }) {
  const { tr } = useLanguage()
  return (
    <>
    <WalletCard />
    {/* LayoutGroup keeps the desktop and drawer pills apart (both can be mounted). */}
    <LayoutGroup id={scope}>
    <motion.nav className="flex flex-col gap-1" aria-label={tr('Asosiy navigatsiya')}
      variants={stagger ? staggerContainer(0.03, 0.06) : undefined} initial={stagger ? 'initial' : false} animate="animate">
      {NAV.map(({ to, label, icon: Icon }) => (
        <motion.div key={to} variants={stagger ? fadeUpItem : undefined}>
          <NavLink to={to} onClick={onNavigate}
            className={({ isActive }) => cn(
              'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[17px] transition-colors',
              isActive ? 'font-semibold text-white' : 'font-medium text-ink hover:bg-black/5 active:bg-black/10',
            )}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[10px] bg-mars-500 shadow-sm shadow-mars-500/30" transition={SPRING.snappy} aria-hidden="true" />}
                <Icon className={cn('relative size-5 transition-transform duration-150 group-hover:scale-110', isActive ? 'text-white' : 'text-ink')} />
                <span className="relative">{tr(label)}</span>
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
    </LayoutGroup>
    </>
  )
}

function Stat({ icon, value, className, title }: { icon: React.ReactNode; value: string; className: string; title: string }) {
  return (
    <div title={title} className={cn(!className.includes('hidden') && 'flex', 'h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold', className)}>
      {icon}{value}
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
      <button onClick={() => setOpen((v) => !v)} className="relative grid size-9 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink" aria-label={tr('Bildirishnomalar')}>
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 h-4 place-items-center rounded-full bg-mars-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      <AnimatePresence>
      {open && (
        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" style={{ transformOrigin: 'top right' }} className="absolute right-0 top-11 z-40 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
          <div className="border-b border-line px-4 py-3 font-bold">{tr('Bildirishnomalar')}</div>
          <div className="max-h-80 overflow-auto">
            {!data?.length && <p className="p-6 text-center text-sm text-muted">{tr("Bildirishnomalar yo'q")}</p>}
            {data?.map((n) => (
              <button key={n.id} onClick={() => !n.read && read.mutate(n.id)} className={cn('block w-full px-4 py-3 text-left hover:bg-canvas', !n.read && 'bg-mars-50/50')}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {!n.read && <span className="size-2 rounded-full bg-mars-500" />}
                  {n.type === 'coin' && <Coins className="size-4 shrink-0 text-amber-600" />}
                  {n.type === 'coin'
                    ? tr('Mentor sizga {amount} coin berdi').replace('{amount}', fmtNum(n.data?.amount ?? 0))
                    : n.title}
                </div>
                <div className="text-xs text-muted">
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
      <button onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-canvas" aria-label={tr('Profil menyusi')}>
        {me?.avatarUrl ? <img src={me.avatarUrl} alt="" className="size-8 rounded-lg object-cover" />
          : <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-mars-400 to-mars-600 text-xs font-bold text-white">{initials}</div>}
        <span className="hidden text-sm font-semibold lg:block">{me?.fullName ?? ''}</span>
      </button>
      <AnimatePresence>
      {open && (
        <motion.div variants={popoverVariants} initial="initial" animate="animate" exit="exit" style={{ transformOrigin: 'top right' }} className="absolute right-0 top-11 z-40 w-56 rounded-2xl border border-line bg-white p-2 shadow-lift">
          <div className="px-3 py-2"><div className="font-bold">{me?.fullName}</div><div className="text-xs text-muted">{tr('Guruh')}: {me?.group ?? '—'} · {tr('Level')} {me?.level}</div></div>
          <button onClick={() => authService.logout().catch(() => {}).finally(() => { clearTokens(); location.reload() })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut className="size-4" />{tr('Chiqish')}
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
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="flex h-16 items-center gap-2 px-2 sm:gap-3 sm:px-4 lg:px-6">
          <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden" aria-label={tr('Menyu')}><Menu className="size-5" /></button>
          <NavLink to="/main-page" aria-label={tr('Asosiy sahifa')}><Logo /></NavLink>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {me && (
              <>
                <Stat title={tr('MARS Coin')} icon={<Coins className="size-4" />} value={fmtNum(me.coins)} className="hidden sm:flex bg-amber-50 text-amber-700" />
                <Stat title={tr('Streak')} icon={<Flame className="size-4" />} value={String(me.streak)} className="hidden sm:flex bg-mars-50 text-mars-600" />
                <Stat title={tr('Ballar')} icon={<Gamepad2 className="size-4" />} value={fmtNum(me.points)} className="hidden md:flex bg-violet-50 text-violet-700" />
                <Stat title={tr('Energiya')} icon={<Zap className="size-4" />} value={`${me.energy}/${me.maxEnergy}`} className="hidden md:flex bg-sky-50 text-sky-700" />
                {me.isPremium && <Badge tone="violet" className="hidden xl:inline-flex"><Crown className="size-3" />Premium</Badge>}
              </>
            )}
            <LangSwitcher />
            <Notifications />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-[248px] overflow-y-auto bg-canvas p-3 lg:block">
        <Sidebar scope="desktop" />
      </aside>

      <AnimatePresence>
        {drawer && (
          <motion.div key="drawer" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={tr('Menyu')} initial="initial" animate="animate" exit="exit">
            <motion.div variants={backdropVariants} className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={() => setDrawer(false)} aria-hidden="true" />
            <motion.div
              variants={{ initial: { x: '-100%' }, animate: { x: 0, transition: SPRING.drawer }, exit: { x: '-100%', transition: { duration: DURATION.base, ease: EASE.inOut } } }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-lift"
            >
              <div className="mb-6 flex items-center justify-between"><Logo /><button type="button" autoFocus onClick={() => setDrawer(false)} className="grid size-11 place-items-center rounded-lg hover:bg-canvas" aria-label={tr('Yopish')}><X className="size-5" /></button></div>
              <Sidebar scope="drawer" stagger onNavigate={() => setDrawer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-[248px]">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
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
