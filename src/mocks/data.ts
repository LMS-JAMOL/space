// ⚠️ DEVELOPMENT-ONLY fake data for the mock adapter. Not real student data.
import type {
  CourseSummary, Dashboard, Lesson, Notification,
  Payment, PaymentInfo, Product, Purchase, ShopCategory, Student,
} from '../types'

const art = (emoji: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="330" cy="60" r="90" fill="#fff" opacity=".12"/><text x="200" y="185" font-size="120" text-anchor="middle">${emoji}</text></svg>`,
  )}`

const day = (offset: number, h = 10) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(h, 0, 0, 0)
  return d.toISOString()
}

const student: Student = {
  id: 'st_1', fullName: 'Aziz Karimov', avatarUrl: null, group: 'FE-214', level: 7, levelProgress: 64,
  coins: 1240, points: 8650, energy: 7, maxEnergy: 10, streak: 12, isPremium: true,
}

const courses: CourseSummary[] = [
  { id: 'c_fe', title: 'Frontend Development', code: 'FE-214', status: 'active', progress: 58, lessonsTotal: 48, lessonsDone: 28, mentor: 'Sardor Aliyev' },
  { id: 'c_py', title: 'Python Foundation', code: 'PY-101', status: 'completed', progress: 100, lessonsTotal: 36, lessonsDone: 36, mentor: 'Dilnoza R.' },
  { id: 'c_sc', title: 'Scratch Junior', code: 'SC-010', status: 'completed', progress: 100, lessonsTotal: 24, lessonsDone: 24, mentor: 'Bekzod T.' },
  { id: 'c_git', title: 'Git va GitHub asoslari', code: 'FREE-GIT', status: 'free', progress: 20, lessonsTotal: 10, lessonsDone: 2 },
  { id: 'c_typ', title: "Tez yozish (Typing)", code: 'FREE-TYP', status: 'free', progress: null, lessonsTotal: 12, lessonsDone: 0 },
]

const topics = ['HTML semantikasi', 'CSS Flex & Grid', 'JavaScript asoslari', 'DOM bilan ishlash', 'Async JS', 'React kirish', 'React hooks', 'Router', 'API bilan ishlash', 'Yakuniy loyiha']
const lessons = (c: CourseSummary): Lesson[] =>
  Array.from({ length: Math.min(c.lessonsTotal, 12) }, (_, i) => ({
    id: `${c.id}_l${i + 1}`, order: i + 1, title: topics[i % topics.length], durationMin: 90,
    status: i < c.lessonsDone ? 'done' : i === c.lessonsDone ? 'available' : 'locked',
  }))

const categories: ShopCategory[] = [
  { id: 'merch', name: 'Merch' }, { id: 'stationery', name: 'Kanselyariya' },
  { id: 'gadgets', name: 'Gadjetlar' }, { id: 'digital', name: 'Raqamli' },
]

const products: Product[] = [
  { id: 'pr1', name: 'MARS futbolka', description: "100% paxta, MARS logotipi bilan. O'lchamni olishda tanlanadi.", price: 600, stock: 14, categoryId: 'merch', images: [art('👕', '#ffd2b8', '#ff7a3d')] },
  { id: 'pr2', name: 'MARS hudi', description: 'Issiq hudi, kapyushonli.', price: 1500, stock: 3, categoryId: 'merch', images: [art('🧥', '#c9d3f0', '#5d72a8')] },
  { id: 'pr3', name: 'Daftar (A5)', description: 'Nuqtali sahifalar, 120 varaq.', price: 150, stock: 40, categoryId: 'stationery', images: [art('📓', '#fff1c2', '#ffb703')] },
  { id: 'pr4', name: 'Stikerlar to\'plami', description: '20 ta dasturchi stikerlari.', price: 80, stock: 0, categoryId: 'stationery', images: [art('✨', '#ffe0f0', '#ff5aa0')] },
  { id: 'pr5', name: 'Simsiz sichqoncha', description: 'Jim tugmalar, USB-C zaryad.', price: 2200, stock: 5, categoryId: 'gadgets', images: [art('🖱️', '#d7f5e6', '#21b573')] },
  { id: 'pr6', name: 'Mexanik klaviatura', description: 'Hot-swap, RGB yorug\'lik.', price: 5200, stock: 2, categoryId: 'gadgets', images: [art('⌨️', '#e3e6ee', '#26355f')] },
  { id: 'pr7', name: 'Premium 1 oy', description: "MARS Space Premium obunasi — 1 oy.", price: 900, stock: 999, categoryId: 'digital', images: [art('💎', '#e6dcff', '#7b5cff')] },
  { id: 'pr8', name: 'Bottle MARS', description: 'Termos-butilka, 500 ml.', price: 700, stock: 9, categoryId: 'merch', images: [art('🥤', '#cdeffd', '#0ea5e9')] },
]

const purchases: Purchase[] = [
  { id: 'ord_1', productId: 'pr3', productName: 'Daftar (A5)', productImage: products[2].images[0], quantity: 1, totalPrice: 150, status: 'delivered', createdAt: day(-20) },
]

const payments: Payment[] = [
  { id: 'pay_1', amount: 790000, currency: 'UZS', status: 'paid', provider: 'Payme', createdAt: day(-31), description: "Sentyabr oyi to'lovi" },
  { id: 'pay_2', amount: 790000, currency: 'UZS', status: 'failed', provider: 'Click', createdAt: day(-2), description: "Oktyabr oyi to'lovi" },
]

const paymentInfo: PaymentInfo = { amountDue: 790000, currency: 'UZS', suggestedAmounts: [395000, 790000, 1580000], providers: ['Payme', 'Click', 'Uzum'] }

const notifications: Notification[] = [
  { id: 'n1', title: 'Vazifa tekshirildi', body: '"Landing page" — 92 ball', createdAt: day(-1), read: false },
  { id: 'n2', title: 'Hakaton ro\'yxati ochildi', body: 'MARS Hack: Kuz 2026', createdAt: day(-2), read: false },
  { id: 'n3', title: 'Streak 12 kun!', body: 'Davom eting 🔥', createdAt: day(-3), read: true },
]

const dashboard: Omit<Dashboard, 'student'> = {
  journey: [
    { id: 'j1', title: 'HTML', status: 'done' }, { id: 'j2', title: 'CSS', status: 'done' },
    { id: 'j3', title: 'JavaScript', status: 'done' }, { id: 'j4', title: 'DOM', status: 'current' },
    { id: 'j5', title: 'React', status: 'locked' }, { id: 'j6', title: 'Loyiha', status: 'locked' },
  ],
  activeCourse: courses[0],
  assignments: { total: 18, pending: 2, reviewed: 15, overdue: 1 },
  schedule: [
    { id: 'sc1', title: 'Frontend: Async JS', startsAt: day(0, 15), type: 'lesson', room: 'Xona 204' },
    { id: 'sc2', title: "Qo'shimcha dars: Git", startsAt: day(1, 17), type: 'extra', room: 'Onlayn' },
    { id: 'sc3', title: 'Frontend: React kirish', startsAt: day(2, 15), type: 'lesson', room: 'Xona 204' },
  ],
  unfinishedLessons: [{ id: 'c_fe_l29', courseId: 'c_fe', title: 'DOM bilan ishlash', courseTitle: 'Frontend Development' }],
  typing: { bestWpm: 46, lastWpm: 41, accuracy: 94 },
}

export const db = {
  student, courses, lessons, categories, products, purchases, payments,
  paymentInfo, notifications, dashboard,
}
