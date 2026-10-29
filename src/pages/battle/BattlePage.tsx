import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crown, Flame, Loader2, Search, Swords, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { Button, Chips, ErrorState, PageHeader, Skeleton, cn } from '../../components/ui'
import { errorMessage } from '../../services/apiClient'
import { battleService } from '../../services/battleService'
import type { BattleMatch } from '../../types'
import { fmtDateTime } from '../../utils/format'

const LANGS = ['JavaScript', 'Python'] as const
const DIFFS = ['Oson', "O'rta", 'Qiyin'] as const
const MATCH_KEY = 'battle_active_match'

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl border border-white/8 bg-navy-900 p-5 text-white', className)}>{children}</div>
}

export default function BattlePage() {
  const qc = useQueryClient()
  const [lang, setLang] = useState<string>(LANGS[0])
  const [diff, setDiff] = useState<string>(DIFFS[1])
  const [matchId, setMatchId] = useState<string | null>(() => sessionStorage.getItem(MATCH_KEY))

  const profile = useQuery({ queryKey: ['battle', 'profile'], queryFn: battleService.profile })
  const opponents = useQuery({ queryKey: ['battle', 'opponents'], queryFn: battleService.opponents })
  const leaderboard = useQuery({ queryKey: ['battle', 'leaderboard'], queryFn: battleService.leaderboard })
  const history = useQuery({ queryKey: ['battle', 'history'], queryFn: battleService.history })

  const track = (m: BattleMatch | null) => {
    if (m) sessionStorage.setItem(MATCH_KEY, m.id); else sessionStorage.removeItem(MATCH_KEY)
    setMatchId(m?.id ?? null)
  }

  const match = useQuery({
    queryKey: ['battle', 'match', matchId],
    queryFn: () => battleService.match(matchId!),
    enabled: !!matchId,
    refetchInterval: (q) => (q.state.data?.status === 'searching' ? 2000 : false),
    retry: 1,
  })

  const create = useMutation({
    mutationFn: (opponentId?: string) => battleService.createMatch({ opponentId, language: lang, difficulty: diff }),
    onSuccess: (m) => { track(m); qc.setQueryData(['battle', 'match', m.id], m) },
  })
  const cancel = useMutation({
    mutationFn: () => battleService.cancel(matchId!),
    onSuccess: () => track(null),
  })

  const m = match.data
  const active = m && ['searching', 'matched', 'in_progress'].includes(m.status)
  const p = profile.data

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-4rem)] bg-navy-950 px-4 py-6 lg:-mx-8 lg:-my-8 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-16 h-72 bg-[radial-gradient(ellipse_at_top,rgba(255,90,31,.18),transparent_60%)]" />
      <PageHeader dark title="Battle Arena" subtitle="Real raqiblar bilan kod jangi" />

      <div className="relative grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          {profile.isLoading ? <Skeleton className="h-40 bg-navy-800" /> : profile.error ? <ErrorState dark error={profile.error} onRetry={profile.refetch} /> : p && (
            <>
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-mars-400 to-mars-600 text-xl font-extrabold">{p.nickname[0].toUpperCase()}</div>
                <div><p className="text-lg font-extrabold">{p.nickname}</p><p className="font-mono text-sm text-mars-400">{p.rating} reyting</p></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[['G\'alaba', p.wins, 'text-emerald-400'], ['Mag\'lub', p.losses, 'text-red-400'], ['Streak', p.streak, 'text-mars-400']].map(([l, v, c]) => (
                  <div key={l as string} className="rounded-xl bg-navy-800 p-3"><div className={cn('font-mono text-xl font-bold', c as string)}>{v}</div><div className="text-[11px] text-navy-300">{l}</div></div>
                ))}
              </div>
              <p className="mb-2 mt-5 text-xs font-bold uppercase text-navy-300">Yutuqlar</p>
              <div className="flex flex-wrap gap-2">
                {p.achievements.length === 0 && <span className="text-sm text-navy-400">Hali yo'q</span>}
                {p.achievements.map((a) => <span key={a.id} title={fmtDateTime(a.earnedAt)} className="rounded-lg bg-navy-800 px-2.5 py-1 text-xs font-semibold">{a.icon} {a.title}</span>)}
              </div>
            </>
          )}
        </Panel>

        <Panel className="relative flex flex-col items-center justify-center overflow-hidden text-center lg:col-span-2">
          {!active ? (
            <>
              <div className="mb-4 flex flex-wrap justify-center gap-3">
                <Chips dark value={lang} onChange={setLang} options={LANGS.map((l) => ({ value: l, label: l }))} />
                <Chips dark value={diff} onChange={setDiff} options={DIFFS.map((d) => ({ value: d, label: d }))} />
              </div>
              <button onClick={() => create.mutate(undefined)} disabled={create.isPending}
                className="group my-4 grid size-40 place-items-center rounded-full bg-gradient-to-br from-mars-400 to-mars-600 shadow-[0_0_60px_-10px] shadow-mars-500 transition hover:scale-105 active:scale-95 disabled:opacity-60">
                {create.isPending ? <Loader2 className="size-10 animate-spin" /> : <div><Swords className="mx-auto size-10" /><span className="mt-1 block text-sm font-extrabold">Raqib topish</span></div>}
              </button>
              {create.error && <p className="text-sm text-red-400">{errorMessage(create.error)}</p>}
              {m?.status === 'cancelled' && <p className="text-sm text-navy-300">Qidiruv bekor qilindi</p>}
              {match.error && <p className="text-sm text-red-400">Jang holatini olib bo'lmadi: {errorMessage(match.error)} <button className="underline" onClick={() => track(null)}>Tozalash</button></p>}
            </>
          ) : m.status === 'searching' ? (
            <>
              <div className="relative my-6 grid size-40 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-mars-500/20" />
                <span className="absolute inset-4 rounded-full border-2 border-dashed border-mars-500/60 animate-spin [animation-duration:6s]" />
                <Search className="size-10 text-mars-400" />
              </div>
              <p className="text-lg font-bold">Raqib qidirilmoqda...</p>
              <p className="text-sm text-navy-300">{m.language} · {m.difficulty}</p>
              <Button variant="dark" className="mt-5" loading={cancel.isPending} onClick={() => cancel.mutate()}><X className="size-4" />Bekor qilish</Button>
              {cancel.error && <p className="mt-2 text-sm text-red-400">{errorMessage(cancel.error)}</p>}
            </>
          ) : (
            <>
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-mars-400">Raqib topildi</p>
              <div className="flex items-center gap-6 sm:gap-10">
                <div><div className="mx-auto grid size-20 place-items-center rounded-2xl bg-mars-500 text-2xl font-extrabold">{p?.nickname[0].toUpperCase()}</div><p className="mt-2 font-bold">{p?.nickname}</p></div>
                <span className="font-mono text-3xl font-extrabold text-mars-400">VS</span>
                <div><div className="mx-auto grid size-20 place-items-center rounded-2xl bg-navy-600 text-2xl font-extrabold">{m.opponent?.nickname[0].toUpperCase() ?? '?'}</div><p className="mt-2 font-bold">{m.opponent?.nickname ?? '—'}</p></div>
              </div>
              <p className="mt-6 text-sm text-navy-300">Holat: {m.status}. Jang interfeysi backend real-time kontraktidan keyin ulanadi.</p>
              <Button variant="dark" className="mt-4" onClick={() => track(null)}>Yopish</Button>
            </>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-3 font-bold">Onlayn raqiblar</h2>
          {opponents.isLoading ? <Skeleton className="h-40 bg-navy-800" /> : opponents.error ? <ErrorState dark error={opponents.error} onRetry={opponents.refetch} /> : (
            <ul className="space-y-2">
              {opponents.data?.map((o) => (
                <li key={o.id} className="flex items-center gap-3 rounded-xl bg-navy-800 p-3">
                  <span className={cn('size-2 rounded-full', o.online ? 'bg-emerald-400' : 'bg-navy-400')} />
                  <span className="flex-1 font-semibold">{o.nickname}<span className="ml-2 font-mono text-xs text-navy-300">{o.rating}</span></span>
                  <Button size="sm" disabled={!o.online || !!active || create.isPending} onClick={() => create.mutate(o.id)}>Chaqirish</Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Crown className="size-4 text-amber-400" />Reyting</h2>
          {leaderboard.isLoading ? <Skeleton className="h-40 bg-navy-800" /> : leaderboard.error ? <ErrorState dark error={leaderboard.error} /> : (
            <ol className="space-y-1.5">
              {leaderboard.data?.map((e) => (
                <li key={e.playerId} className={cn('flex items-center gap-3 rounded-xl px-3 py-2', e.playerId === p?.playerId ? 'bg-mars-500/15 ring-1 ring-mars-500/40' : 'bg-navy-800')}>
                  <span className={cn('w-6 font-mono font-bold', e.rank <= 3 ? 'text-amber-400' : 'text-navy-300')}>#{e.rank}</span>
                  <span className="flex-1 font-semibold">{e.nickname}</span><span className="font-mono text-sm">{e.rating}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel>
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Trophy className="size-4 text-mars-400" />Janglar tarixi</h2>
          {history.isLoading ? <Skeleton className="h-40 bg-navy-800" /> : history.error ? <ErrorState dark error={history.error} />
            : !history.data?.length ? <p className="text-sm text-navy-300">Hali janglar yo'q</p> : (
              <ul className="space-y-2">
                {history.data.map((h) => (
                  <li key={h.id} className="flex items-center gap-3 rounded-xl bg-navy-800 p-3 text-sm">
                    <span className={cn('rounded-md px-2 py-0.5 text-xs font-bold', h.result === 'win' ? 'bg-emerald-500/15 text-emerald-400' : h.result === 'loss' ? 'bg-red-500/15 text-red-400' : 'bg-navy-600 text-navy-300')}>
                      {h.result === 'win' ? "G'ALABA" : h.result === 'loss' ? "MAG'LUB" : 'DURANG'}
                    </span>
                    <span className="flex-1">vs {h.opponent?.nickname}<span className="block text-xs text-navy-300">{fmtDateTime(h.createdAt)}</span></span>
                    {h.ratingDelta != null && <span className={cn('font-mono font-bold', h.ratingDelta >= 0 ? 'text-emerald-400' : 'text-red-400')}>{h.ratingDelta > 0 && '+'}{h.ratingDelta}</span>}
                  </li>
                ))}
              </ul>
            )}
          {p && p.streak >= 3 && <p className="mt-3 flex items-center gap-1 text-xs text-mars-400"><Flame className="size-3" />{p.streak} ketma-ket g'alaba!</p>}
        </Panel>
      </div>
    </div>
  )
}
