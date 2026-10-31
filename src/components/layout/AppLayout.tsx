import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell, BookOpen, Briefcase, Code2, Coins, Crown, Flame, Gamepad2, Globe2, LayoutDashboard, LogOut, Menu,
  Newspaper, ShoppingBag, Swords, Trophy, Wallet, X, Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, USE_MOCKS, clearTokens } from '../../services/apiClient'
import { authService } from '../../services/authService'
import { notificationService } from '../../services/notificationService'
import { fmtDateTime, fmtNum } from '../../utils/format'
import { Badge, cn } from '../ui'

export const NAV = [
  { to: '/main-page', label: 'Asosiy', icon: LayoutDashboard },
  { to: '/my-courses', label: 'Kurslarim', icon: BookOpen },
  { to: '/my-works', label: 'Mening ishlarim', icon: Briefcase },
  { to: '/battle', label: 'Battle', icon: Swords },
  { to: '/hackathon', label: 'Xakaton', icon: Trophy },
  { to: '/edverse', label: 'Edverse', icon: Globe2 },
  { to: '/algo', label: 'Algo', icon: Code2 },
  { to: '/blog', label: 'Blog', icon: Newspaper },
  { to: '/online-payment', label: "Onlayn to'lov", icon: Wallet },
  { to: '/space-shop', label: 'Space Shop', icon: ShoppingBag },
]

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: authService.me })

function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-9 place-items-center rounded-xl bg-mars-500 shadow-md shadow-mars-500/40">
        <div className="size-4 rounded-full bg-white" />
        <div className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-mars-500" />
      </div>
      <div className="leading-none">
        <div className={cn('text-lg font-extrabold tracking-tight', light && 'text-white')}>MARS</div>
        <div className="text-[10px] font-bold uppercase tracking-[.25em] text-mars-500">Space</div>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Asosiy navigatsiya">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          className={({ isActive }) => cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
            isActive ? 'bg-mars-50 text-mars-600' : 'text-muted hover:bg-canvas hover:text-ink',
          )}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-mars-500" />}
              <Icon className={cn('size-5', isActive ? 'text-mars-500' : 'text-slate-400 group-hover:text-ink')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Stat({ icon, value, className, title }: { icon: React.ReactNode; value: string; className: string; title: string }) {
  return (
    <div title={title} className={cn('flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold', className)}>
      {icon}{value}
    </div>
  )
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: notificationService.list })
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
      <button onClick={() => setOpen((v) => !v)} className="relative grid size-9 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink" aria-label="Bildirishnomalar">
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 h-4 place-items-center rounded-full bg-mars-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-up">
          <div className="border-b border-line px-4 py-3 font-bold">Bildirishnomalar</div>
          <div className="max-h-80 overflow-auto">
            {!data?.length && <p className="p-6 text-center text-sm text-muted">Bildirishnomalar yo'q</p>}
            {data?.map((n) => (
              <button key={n.id} onClick={() => !n.read && read.mutate(n.id)} className={cn('block w-full px-4 py-3 text-left hover:bg-canvas', !n.read && 'bg-mars-50/50')}>
                <div className="flex items-center gap-2 text-sm font-semibold">{!n.read && <span className="size-2 rounded-full bg-mars-500" />}{n.title}</div>
                <div className="text-xs text-muted">{n.body} · {fmtDateTime(n.createdAt)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileMenu() {
  const { data: me } = useMe()
  const [open, setOpen] = useState(false)
  const initials = me?.fullName.split(' ').map((s) => s[0]).join('').slice(0, 2) ?? '··'
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-canvas" aria-label="Profil menyusi">
        {me?.avatarUrl ? <img src={me.avatarUrl} alt="" className="size-8 rounded-lg object-cover" />
          : <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-mars-400 to-mars-600 text-xs font-bold text-white">{initials}</div>}
        <span className="hidden text-sm font-semibold lg:block">{me?.fullName ?? ''}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-56 rounded-2xl border border-line bg-white p-2 shadow-lift animate-fade-up">
          <div className="px-3 py-2"><div className="font-bold">{me?.fullName}</div><div className="text-xs text-muted">Guruh: {me?.group ?? '—'} · Level {me?.level}</div></div>
          <button onClick={() => authService.logout().catch(() => {}).finally(() => { clearTokens(); location.reload() })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut className="size-4" />Chiqish
          </button>
        </div>
      )}
    </div>
  )
}

export function AppLayout() {
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: me, error } = useMe()
  const dark = pathname.startsWith('/battle')

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

  return (
    <div className={cn('min-h-full', dark && 'bg-navy-950')}>
      {USE_MOCKS && (
        <div className="bg-amber-400 px-4 py-1 text-center text-xs font-bold text-amber-950">
          DEV MOCK REJIMI — ma'lumotlar soxta, backend ulanmagan (VITE_USE_MOCKS=true)
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden" aria-label="Menyu"><Menu className="size-5" /></button>
          <NavLink to="/main-page"><Logo /></NavLink>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {me && (
              <>
                <Stat title="MARS Coin" icon={<Coins className="size-4" />} value={fmtNum(me.coins)} className="bg-amber-50 text-amber-700" />
                <Stat title="Streak" icon={<Flame className="size-4" />} value={String(me.streak)} className="hidden sm:flex bg-mars-50 text-mars-600" />
                <Stat title="Ballar" icon={<Gamepad2 className="size-4" />} value={fmtNum(me.points)} className="hidden md:flex bg-violet-50 text-violet-700" />
                <Stat title="Energiya" icon={<Zap className="size-4" />} value={`${me.energy}/${me.maxEnergy}`} className="hidden md:flex bg-sky-50 text-sky-700" />
                {me.isPremium && <Badge tone="violet" className="hidden xl:inline-flex"><Crown className="size-3" />Premium</Badge>}
              </>
            )}
            <Notifications />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-line bg-white p-4 lg:block" style={USE_MOCKS ? { top: 88 } : undefined}>
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-lift animate-fade-up">
            <div className="mb-6 flex items-center justify-between"><Logo /><button onClick={() => setDrawer(false)} className="rounded-lg p-2 hover:bg-canvas" aria-label="Yopish"><X className="size-5" /></button></div>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8"><Outlet /></div>
      </main>
    </div>
  )
}
