import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, CalendarDays, ExternalLink, Plus, Trophy, Users } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, EmptyState, ErrorState, Field, Modal, PageHeader, Skeleton, Tabs, cn, inputCls } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { errorMessage } from '../../services/apiClient'
import { hackathonService } from '../../services/hackathonService'
import type { Hackathon } from '../../types'
import { fmtDate, fmtDateTime } from '../../utils/format'

type Tab = 'teams' | 'submit' | 'gallery' | 'results'

export default function HackathonPage() {
  const list = useQuery({ queryKey: ['hackathons'], queryFn: hackathonService.list })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const current = list.data?.find((h) => h.id === selectedId) ?? list.data?.[0]

  return (
    <>
      <PageHeader title="Xakaton" subtitle="Jamoa tuzing, loyiha topshiring, g'olib bo'ling" />
      {list.isLoading ? <Skeleton className="h-60" /> : list.error ? <ErrorState error={list.error} onRetry={list.refetch} />
        : !current ? <EmptyState title="Xakatonlar yo'q" icon={<Trophy />} /> : (
          <>
            {list.data!.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {list.data!.map((h) => (
                  <button key={h.id} onClick={() => setSelectedId(h.id)} className={cn('rounded-xl border px-3 py-2 text-sm font-semibold', h.id === current.id ? 'border-mars-500 bg-mars-50 text-mars-600' : 'border-line bg-white text-muted')}>{h.title}</button>
                ))}
              </div>
            )}
            <HackathonView key={current.id} h={current} />
          </>
        )}
    </>
  )
}

function HackathonView({ h }: { h: Hackathon }) {
  const [tab, setTab] = useState<Tab>(h.status === 'finished' ? 'results' : 'teams')
  return (
    <>
      <Card className="relative mb-5 overflow-hidden bg-gradient-to-br from-ink to-navy-700 p-6 text-white border-ink">
        <Trophy className="absolute -bottom-6 -right-6 size-40 text-white/5" />
        <StatusBadge status={h.status} />
        <h2 className="mt-2 text-2xl font-extrabold">{h.title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-navy-300">{h.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-mars-400" />{fmtDate(h.startsAt)} – {fmtDate(h.endsAt)}</span>
          <span className="flex items-center gap-1.5"><Users className="size-4 text-mars-400" />Jamoada {h.maxTeamSize} kishigacha</span>
          <span>Topshirish: {fmtDateTime(h.submissionDeadline)}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{h.topics.map((t) => <span key={t} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold">{t}</span>)}</div>
      </Card>
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'teams', label: 'Jamoalar' }, { value: 'submit', label: 'Topshirish' },
        { value: 'gallery', label: 'Loyihalar' }, { value: 'results', label: 'Natijalar' },
      ]} />
      {tab === 'teams' && <Teams h={h} />}
      {tab === 'submit' && <Submit h={h} />}
      {tab === 'gallery' && <Gallery h={h} />}
      {tab === 'results' && <Results h={h} />}
    </>
  )
}

function Teams({ h }: { h: Hackathon }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [topic, setTopic] = useState(h.topics[0] ?? '')
  const teams = useQuery({ queryKey: ['hack', h.id, 'teams'], queryFn: () => hackathonService.teams(h.id) })
  const refresh = () => { qc.invalidateQueries({ queryKey: ['hackathons'] }); qc.invalidateQueries({ queryKey: ['hack', h.id] }) }
  const create = useMutation({ mutationFn: () => hackathonService.createTeam(h.id, { name, topic }), onSuccess: () => { setOpen(false); setName(''); refresh() } })
  const join = useMutation({ mutationFn: (teamId: string) => hackathonService.join(h.id, teamId), onSuccess: refresh })
  const canRegister = h.status === 'registration' && !h.myTeamId
  const myTeam = teams.data?.find((t) => t.id === h.myTeamId)

  if (teams.isLoading) return <Skeleton className="h-48" />
  if (teams.error) return <ErrorState error={teams.error} onRetry={teams.refetch} />
  return (
    <>
      {myTeam && (
        <Card className="mb-5 border-mars-200 bg-mars-50/50 p-5">
          <p className="text-xs font-bold uppercase text-mars-600">Mening jamoam</p>
          <p className="text-lg font-extrabold">{myTeam.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">{myTeam.members.map((m) => <Badge key={m.id}>{m.fullName}{m.role && ` · ${m.role}`}</Badge>)}</div>
        </Card>
      )}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Mavjud jamoalar</h3>
        {canRegister && <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" />Jamoa yaratish</Button>}
      </div>
      {join.error && <p className="mb-3 text-sm text-red-600">{errorMessage(join.error)}</p>}
      {!teams.data?.length ? <EmptyState title="Jamoalar yo'q" icon={<Users />} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.data.map((t) => {
            const full = !t.isOpen || t.members.length >= h.maxTeamSize
            return (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between"><p className="font-bold">{t.name}</p><Badge tone={full ? 'gray' : 'green'}>{t.members.length}/{h.maxTeamSize}</Badge></div>
                {t.topic && <p className="text-xs text-muted">{t.topic}</p>}
                <div className="my-3 flex -space-x-2">{t.members.map((m) => <div key={m.id} title={m.fullName} className="grid size-8 place-items-center rounded-full border-2 border-white bg-navy-600 text-xs font-bold text-white">{m.fullName[0]}</div>)}</div>
                {canRegister && <Button size="sm" variant="secondary" className="w-full" disabled={full} loading={join.isPending && join.variables === t.id} onClick={() => join.mutate(t.id)}>{full ? "To'lgan" : "Qo'shilish"}</Button>}
              </Card>
            )
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Jamoa yaratish" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Bekor</Button><Button loading={create.isPending} disabled={!name.trim()} onClick={() => create.mutate()}>Yaratish</Button></>}>
        <div className="space-y-4">
          <Field label="Jamoa nomi"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></Field>
          <Field label="Mavzu"><select className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)}>{h.topics.map((t) => <option key={t}>{t}</option>)}</select></Field>
          {create.error && <p className="text-sm text-red-600">{errorMessage(create.error)}</p>}
        </div>
      </Modal>
    </>
  )
}

function Submit({ h }: { h: Hackathon }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ projectTitle: '', repoUrl: '', demoUrl: '' })
  const subs = useQuery({ queryKey: ['hack', h.id, 'subs'], queryFn: () => hackathonService.submissions(h.id) })
  const submit = useMutation({ mutationFn: () => hackathonService.submit(h.id, form), onSuccess: () => qc.invalidateQueries({ queryKey: ['hack', h.id, 'subs'] }) })
  const mine = subs.data?.find((s) => s.teamId === h.myTeamId)
  const closed = new Date(h.submissionDeadline) < new Date()

  if (!h.myTeamId) return <EmptyState title="Avval jamoaga qo'shiling" text="Loyihani faqat jamoa a'zolari topshira oladi." icon={<Users />} />
  return (
    <Card className="max-w-xl p-6">
      {mine && <div className="mb-4 flex items-center justify-between rounded-xl bg-canvas p-3 text-sm"><span>Joriy topshiriq: <b>{mine.projectTitle}</b></span><StatusBadge status={mine.status} /></div>}
      {closed ? <p className="text-sm text-muted">Topshirish muddati tugagan.</p> : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit.mutate() }}>
          <Field label="Loyiha nomi"><input required className={inputCls} value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} /></Field>
          <Field label="Repozitoriya (URL)"><input type="url" className={inputCls} value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/..." /></Field>
          <Field label="Demo (URL)"><input type="url" className={inputCls} value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} /></Field>
          {submit.error && <p className="text-sm text-red-600">{errorMessage(submit.error)}</p>}
          {submit.isSuccess && <p className="text-sm font-semibold text-emerald-600">Server javobi: {submit.data.status}</p>}
          <Button type="submit" loading={submit.isPending}>{mine ? 'Yangilash' : 'Topshirish'}</Button>
        </form>
      )}
    </Card>
  )
}

function Gallery({ h }: { h: Hackathon }) {
  const subs = useQuery({ queryKey: ['hack', h.id, 'subs'], queryFn: () => hackathonService.submissions(h.id) })
  if (subs.isLoading) return <Skeleton className="h-40" />
  if (subs.error) return <ErrorState error={subs.error} onRetry={subs.refetch} />
  if (!subs.data?.length) return <EmptyState title="Hali loyihalar yo'q" />
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {subs.data.map((s) => (
        <Card key={s.id} className="p-5">
          <div className="flex justify-between gap-2"><p className="font-bold">{s.projectTitle}</p><StatusBadge status={s.status} /></div>
          <p className="text-sm text-muted">{s.teamName}</p>
          <div className="mt-3 flex gap-3 text-sm font-semibold text-mars-600">
            {s.repoUrl && <a href={s.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">Repo<ExternalLink className="size-3" /></a>}
            {s.demoUrl && <a href={s.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">Demo<ExternalLink className="size-3" /></a>}
          </div>
        </Card>
      ))}
    </div>
  )
}

function Results({ h }: { h: Hackathon }) {
  const results = useQuery({ queryKey: ['hack', h.id, 'results'], queryFn: () => hackathonService.results(h.id) })
  const certs = useQuery({ queryKey: ['hack', h.id, 'certs'], queryFn: () => hackathonService.certificates(h.id) })
  if (results.isLoading) return <Skeleton className="h-40" />
  if (results.error) return <ErrorState error={results.error} onRetry={results.refetch} />
  if (!results.data?.length) return <EmptyState title="Natijalar hali e'lon qilinmagan" icon={<Trophy />} />
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="divide-y divide-line lg:col-span-2">
        {results.data.map((r) => (
          <div key={r.teamId} className={cn('flex items-center gap-4 px-5 py-4', r.teamId === h.myTeamId && 'bg-mars-50/60')}>
            <span className={cn('grid size-10 place-items-center rounded-xl font-extrabold', r.rank === 1 ? 'bg-amber-100 text-amber-700' : r.rank === 2 ? 'bg-slate-100 text-slate-600' : r.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-canvas text-muted')}>{r.rank}</span>
            <span className="flex-1 font-semibold">{r.teamName}{r.teamId === h.myTeamId && <Badge tone="orange" className="ml-2">Siz</Badge>}</span>
            <span className="font-mono font-bold">{r.score}</span>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold"><Award className="size-5 text-mars-500" />Sertifikatlar</h3>
        {certs.isLoading ? <Skeleton className="h-16" /> : !certs.data?.length ? <p className="text-sm text-muted">Sertifikat yo'q</p> : (
          certs.data.map((c) => <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="mb-2 flex items-center justify-between rounded-xl border border-line p-3 text-sm font-semibold hover:border-mars-300">{c.title}<ExternalLink className="size-4" /></a>)
        )}
      </Card>
    </div>
  )
}
