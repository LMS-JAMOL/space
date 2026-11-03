// ⚠️ DEVELOPMENT-ONLY MOCK ADAPTER.
// Simulates the proposed backend contract so the UI can be built before the API exists.
// Enabled only when `import.meta.env.DEV && VITE_USE_MOCKS === 'true'` (see apiClient.ts).
// Nothing here proves that a backend feature works.

import type {
  Payment,
  Product,
  Purchase,
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

  // extra lessons: tutors on the next two days (dev-only data)
  ['GET', /^\/tutor-booking$/, (_, q) => {
    const tashkent = (offset: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date(Date.now() + offset * 86400000))
    const offset = [1, 2].find((o) => tashkent(o) === q?.day)
    if (!offset) return []
    const at = (h: number) => `${tashkent(offset)}T${String(h).padStart(2, '0')}:00:00+05:00`
    const slot = (id: string, tutor: string, h: number, seatsLeft: number) => ({ id: `${id}${offset}`, dayId: `d${offset}`, tutor, course: 'Frontend', start: at(h), end: at(h + 1), seatsLeft, booked: false, canBook: true })
    return [slot('a', 'Anvar Tutor', 10, 3), slot('b', 'Anvar Tutor', 15, 2), slot('c', 'Bobur Tutor', 12, 3)]
  }],
  ['POST', /^\/tutor-booking\/([^/]+)\/([^/]+)\/book$/, () => ({ booked: true })],

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
