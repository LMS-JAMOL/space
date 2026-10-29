// ⚠️ DEVELOPMENT-ONLY MOCK ADAPTER.
// Simulates the proposed backend contract so the UI can be built before the API exists.
// Enabled only when `import.meta.env.DEV && VITE_USE_MOCKS === 'true'` (see apiClient.ts).
// Nothing here proves that a backend feature works.

import type {
  BattleMatch,
  BlogPost,
  Payment,
  Product,
  Purchase,
  Work,
} from '../types'
import { db } from './data'

class MockHttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Q = Record<string, unknown> | undefined
type Handler = (p: string[], query: Q, body: unknown) => unknown

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const now = () => new Date().toISOString()
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`

const routes: [string, RegExp, Handler][] = [
  ['GET', /^\/auth\/me$/, () => db.student],
  ['GET', /^\/dashboard$/, () => ({ ...db.dashboard, student: db.student })],

  ['GET', /^\/courses$/, (_, q) => (q?.status ? db.courses.filter((c) => c.status === q.status) : db.courses)],
  ['GET', /^\/courses\/([^/]+)$/, ([id]) => {
    const c = db.courses.find((x) => x.id === id)
    if (!c) throw new MockHttpError(404, 'Kurs topilmadi')
    return { ...c, description: `${c.title} kursi bo'yicha to'liq dastur.`, lessons: db.lessons(c) }
  }],
  ['GET', /^\/courses\/([^/]+)\/lessons$/, ([id]) => db.lessons(db.courses.find((x) => x.id === id)!)],

  ['GET', /^\/works$/, (_, q) => (q?.kind ? db.works.filter((w) => w.kind === q.kind) : db.works)],
  ['GET', /^\/works\/([^/]+)$/, ([id]) => db.works.find((w) => w.id === id)],
  ['GET', /^\/works\/([^/]+)\/submissions$/, ([id]) => db.submissions[id] ?? []],
  ['POST', /^\/works\/([^/]+)\/submissions$/, ([id], _, body) => {
    const form = body as FormData
    const files = form.getAll('files') as File[]
    const sub = {
      id: uid('sub'),
      createdAt: now(),
      status: 'submitted' as const,
      comment: String(form.get('comment') ?? ''),
      feedback: null,
      attachments: files.map((f) => ({ id: uid('f'), name: f.name, url: '#', sizeBytes: f.size })),
    }
    db.submissions[id] = [sub, ...(db.submissions[id] ?? [])]
    const w = db.works.find((x) => x.id === id) as Work
    w.status = 'submitted'
    w.submittedAt = sub.createdAt
    return sub
  }],

  ['GET', /^\/battle\/profile$/, () => db.battleProfile],
  ['GET', /^\/battle\/leaderboard$/, () => db.leaderboard],
  ['GET', /^\/battle\/opponents$/, () => db.opponents],
  ['GET', /^\/battle\/history$/, () => db.battleHistory],
  ['POST', /^\/battle\/matches$/, (_, __, body) => {
    const b = body as { opponentId?: string; language?: string; difficulty?: string }
    if (db.activeMatch && ['searching', 'matched', 'in_progress'].includes(db.activeMatch.status)) {
      throw new MockHttpError(409, 'Sizda tugallanmagan jang bor')
    }
    const m: BattleMatch = {
      id: uid('m'),
      status: 'searching',
      language: b.language ?? null,
      difficulty: b.difficulty ?? null,
      opponent: b.opponentId ? db.opponents.find((o) => o.id === b.opponentId) ?? null : null,
      createdAt: now(),
    }
    db.activeMatch = m
    db.matchStartedAt = Date.now()
    return m
  }],
  ['GET', /^\/battle\/matches\/([^/]+)$/, ([id]) => {
    const m = db.activeMatch
    if (!m || m.id !== id) throw new MockHttpError(404, 'Jang topilmadi')
    if (m.status === 'searching' && Date.now() - db.matchStartedAt > 4000) {
      m.status = 'matched'
      m.opponent ??= db.opponents.find((o) => o.online) ?? db.opponents[0]
    }
    return m
  }],
  ['POST', /^\/battle\/matches\/([^/]+)\/cancel$/, ([id]) => {
    const m = db.activeMatch
    if (!m || m.id !== id) throw new MockHttpError(404, 'Jang topilmadi')
    if (m.status !== 'searching') throw new MockHttpError(409, "Raqib topilgan — bekor qilib bo'lmaydi")
    m.status = 'cancelled'
    db.activeMatch = null
    return m
  }],

  ['GET', /^\/hackathons$/, () => db.hackathons],
  ['GET', /^\/hackathons\/([^/]+)$/, ([id]) => db.hackathons.find((h) => h.id === id)],
  ['GET', /^\/hackathons\/([^/]+)\/teams$/, () => db.teams],
  ['POST', /^\/hackathons\/([^/]+)\/teams$/, ([id], _, body) => {
    const h = db.hackathons.find((x) => x.id === id)!
    if (h.myTeamId) throw new MockHttpError(409, "Siz allaqachon jamoadasiz")
    if (h.status !== 'registration') throw new MockHttpError(403, "Ro'yxatdan o'tish yopiq")
    const b = body as { name: string; topic?: string }
    const team = { id: uid('t'), name: b.name, topic: b.topic ?? null, isOpen: true,
      members: [{ id: db.student.id, fullName: db.student.fullName, role: 'Kapitan' }] }
    db.teams.unshift(team)
    h.myTeamId = team.id
    return team
  }],
  ['POST', /^\/hackathons\/([^/]+)\/join$/, ([id], _, body) => {
    const h = db.hackathons.find((x) => x.id === id)!
    if (h.myTeamId) throw new MockHttpError(409, 'Siz allaqachon jamoadasiz')
    const team = db.teams.find((t) => t.id === (body as { teamId: string }).teamId)
    if (!team || !team.isOpen || team.members.length >= h.maxTeamSize) throw new MockHttpError(409, "Jamoa to'lgan")
    team.members.push({ id: db.student.id, fullName: db.student.fullName, role: "A'zo" })
    h.myTeamId = team.id
    return team
  }],
  ['GET', /^\/hackathons\/([^/]+)\/submissions$/, () => db.hackSubmissions],
  ['POST', /^\/hackathons\/([^/]+)\/submissions$/, ([id], _, body) => {
    const h = db.hackathons.find((x) => x.id === id)!
    if (!h.myTeamId) throw new MockHttpError(403, "Avval jamoaga qo'shiling")
    if (new Date(h.submissionDeadline) < new Date()) throw new MockHttpError(403, 'Topshirish muddati tugagan')
    const team = db.teams.find((t) => t.id === h.myTeamId)!
    const s = { id: uid('hs'), teamId: team.id, teamName: team.name, status: 'submitted' as const, submittedAt: now(),
      ...(body as { projectTitle: string; repoUrl?: string; demoUrl?: string }) }
    db.hackSubmissions = [s, ...db.hackSubmissions.filter((x) => x.teamId !== team.id)]
    return s
  }],
  ['GET', /^\/hackathons\/([^/]+)\/results$/, ([id]) => (id === 'h_old' ? db.hackResults : [])],
  ['GET', /^\/hackathons\/([^/]+)\/certificates$/, ([id]) =>
    id === 'h_old' ? [{ id: 'c1', title: 'Ishtirokchi sertifikati', url: '#' }] : []],

  ['GET', /^\/blog\/posts$/, (_, q) => {
    const page = Number(q?.page ?? 1)
    const size = Number(q?.pageSize ?? 9)
    const s = String(q?.search ?? '').toLowerCase()
    const list = db.posts.filter((p: BlogPost) =>
      (!s || p.title.toLowerCase().includes(s)) && (!q?.category || p.category === q.category))
    return { items: list.slice((page - 1) * size, page * size), page, pageSize: size, total: list.length,
      categories: [...new Set(db.posts.map((p) => p.category!))] }
  }],
  ['GET', /^\/blog\/posts\/([^/]+)$/, ([id]) => {
    const p = db.posts.find((x) => x.id === id)
    if (!p) throw new MockHttpError(404, 'Maqola topilmadi')
    return p
  }],

  ['GET', /^\/payments\/info$/, () => db.paymentInfo],
  ['GET', /^\/payments\/history$/, () => db.payments],
  ['GET', /^\/payments\/([^/]+)$/, ([id]) => {
    const p = db.payments.find((x) => x.id === id)
    if (!p) throw new MockHttpError(404, "To'lov topilmadi")
    return p
  }],
  ['POST', /^\/payments\/checkout$/, (_, __, body) => {
    const b = body as { amount: number; provider: string }
    if (!b.amount || b.amount < 1000) throw new MockHttpError(422, "Minimal summa 1 000 so'm")
    const p: Payment = { id: uid('pay'), amount: b.amount, currency: 'UZS', status: 'pending',
      provider: b.provider, createdAt: now(), description: "Kurs to'lovi" }
    db.payments.unshift(p)
    // Real backend returns the provider's hosted checkout URL. The mock returns to our own status page.
    return { paymentId: p.id, checkoutUrl: `/online-payment?paymentId=${p.id}&mock=1` }
  }],

  ['GET', /^\/shop\/products$/, () => db.products],
  ['GET', /^\/shop\/products\/([^/]+)$/, ([id]) => {
    const p = db.products.find((x) => x.id === id)
    if (!p) throw new MockHttpError(404, 'Mahsulot topilmadi')
    return p
  }],
  ['GET', /^\/shop\/categories$/, () => db.categories],
  ['GET', /^\/shop\/balance$/, () => ({ coins: db.student.coins })],
  ['POST', /^\/shop\/purchases$/, (_, __, body) => {
    // Server-side rules simulated here: price, stock and balance are checked by the "backend".
    const b = body as { productId: string; quantity: number }
    const p = db.products.find((x) => x.id === b.productId) as Product | undefined
    if (!p) throw new MockHttpError(404, 'Mahsulot topilmadi')
    if (p.stock < b.quantity) throw new MockHttpError(409, 'Mahsulot qolmagan')
    const total = p.price * b.quantity
    if (db.student.coins < total) throw new MockHttpError(402, 'Balansda yetarli MARS Coin yo\'q')
    p.stock -= b.quantity
    db.student.coins -= total
    const order: Purchase = { id: uid('ord'), productId: p.id, productName: p.name, productImage: p.images[0],
      quantity: b.quantity, totalPrice: total, status: 'pending', createdAt: now() }
    db.purchases.unshift(order)
    return order
  }],
  ['GET', /^\/shop\/purchases$/, () => db.purchases],
  ['GET', /^\/shop\/purchases\/([^/]+)$/, ([id]) => db.purchases.find((x) => x.id === id)],

  ['GET', /^\/notifications$/, () => db.notifications],
  ['PATCH', /^\/notifications\/([^/]+)\/read$/, ([id]) => {
    const n = db.notifications.find((x) => x.id === id)
    if (n) n.read = true
  }],

  ['GET', /^\/algo\/tasks$/, () => db.algoTasks],
  ['GET', /^\/edverse$/, () => db.edverse],
]

export async function mockAdapter<T>(method: string, path: string, query: Q, body: unknown): Promise<T> {
  await delay(250 + Math.random() * 350)
  for (const [m, re, handler] of routes) {
    const match = m === method ? path.match(re) : null
    if (!match) continue
    try {
      const res = handler(match.slice(1), query, body)
      if (res === undefined && method === 'GET') throw new MockHttpError(404, 'Topilmadi')
      return structuredClone(res) as T
    } catch (e) {
      if (e instanceof MockHttpError) {
        const { ApiError } = await import('../services/apiClient')
        throw new ApiError(e.status, e.message)
      }
      throw e
    }
  }
  const { ApiError } = await import('../services/apiClient')
  throw new ApiError(404, `[mock] ${method} ${path} — endpoint yo'q`)
}
