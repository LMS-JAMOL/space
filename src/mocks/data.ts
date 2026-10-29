// ⚠️ DEVELOPMENT-ONLY fake data for the mock adapter. Not real student data.
import type {
  AlgoTask, BattleMatch, BattleOpponent, BattleProfile, BlogPost, CourseSummary, Dashboard, EdverseItem,
  Hackathon, HackathonResult, HackathonSubmission, HackathonTeam, LeaderboardEntry, Lesson, Notification,
  Payment, PaymentInfo, Product, Purchase, ShopCategory, Student, Submission, Work,
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

const works: Work[] = [
  { id: 'w1', title: 'Landing page (Flex/Grid)', kind: 'assignment', courseTitle: 'Frontend Development', status: 'accepted', deadline: day(-10), submittedAt: day(-12), score: 92, mentorFeedback: 'Juda yaxshi! Adaptivlikni yana tekshiring.', attachments: [{ id: 'a1', name: 'landing.zip', url: '#', sizeBytes: 2_400_000 }] },
  { id: 'w2', title: 'Todo app (DOM)', kind: 'assignment', courseTitle: 'Frontend Development', status: 'in_review', deadline: day(-1), submittedAt: day(-2), attachments: [{ id: 'a2', name: 'todo-app.zip', url: '#', sizeBytes: 840_000 }] },
  { id: 'w3', title: 'Weather app (fetch API)', kind: 'assignment', courseTitle: 'Frontend Development', status: 'not_submitted', deadline: day(4), attachments: [] },
  { id: 'w4', title: 'Kalkulyator', kind: 'assignment', courseTitle: 'Frontend Development', status: 'rejected', deadline: day(-6), submittedAt: day(-7), score: 40, mentorFeedback: "Edge-case'lar ishlamayapti: 0 ga bo'lish.", attachments: [{ id: 'a3', name: 'calc.zip', url: '#' }] },
  { id: 'w5', title: 'Shaxsiy portfolio sayt', kind: 'portfolio', status: 'accepted', submittedAt: day(-30), attachments: [{ id: 'a4', name: 'portfolio-link.txt', url: '#' }] },
  { id: 'w6', title: 'Oktabr oyi ish rejasi', kind: 'plan', status: 'submitted', submittedAt: day(-20), attachments: [] },
]

const submissions: Record<string, Submission[]> = {
  w1: [{ id: 's1', createdAt: day(-12), status: 'accepted', comment: 'Tayyor', feedback: 'Juda yaxshi!', attachments: works[0].attachments }],
  w4: [{ id: 's2', createdAt: day(-7), status: 'rejected', comment: '', feedback: "Edge-case'lar ishlamayapti.", attachments: works[3].attachments }],
}

const opponents: BattleOpponent[] = [
  { id: 'p2', nickname: 'codeNinja', rating: 1420, online: true },
  { id: 'p3', nickname: 'bitMaster', rating: 1385, online: true },
  { id: 'p4', nickname: 'jsQueen', rating: 1510, online: false },
  { id: 'p5', nickname: 'loopHero', rating: 1290, online: true },
]

const battleProfile: BattleProfile = {
  playerId: 'st_1', nickname: 'aziz_dev', rating: 1398, wins: 34, losses: 19, streak: 3,
  achievements: [
    { id: 'ac1', title: 'Birinchi g\'alaba', icon: '🏆', earnedAt: day(-60) },
    { id: 'ac2', title: '5 ketma-ket', icon: '🔥', earnedAt: day(-14) },
    { id: 'ac3', title: 'Tezkor', icon: '⚡', earnedAt: day(-3) },
  ],
}

const battleHistory: BattleMatch[] = [
  { id: 'bm1', status: 'finished', result: 'win', ratingDelta: 18, opponent: opponents[1], language: 'JavaScript', difficulty: "O'rta", createdAt: day(-1, 16) },
  { id: 'bm2', status: 'finished', result: 'loss', ratingDelta: -12, opponent: opponents[2], language: 'Python', difficulty: 'Qiyin', createdAt: day(-2, 18) },
  { id: 'bm3', status: 'finished', result: 'win', ratingDelta: 15, opponent: opponents[3], language: 'JavaScript', difficulty: 'Oson', createdAt: day(-3, 11) },
]

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, playerId: 'p9', nickname: 'algoKing', rating: 1890 },
  { rank: 2, playerId: 'p4', nickname: 'jsQueen', rating: 1510 },
  { rank: 3, playerId: 'p2', nickname: 'codeNinja', rating: 1420 },
  { rank: 4, playerId: 'st_1', nickname: 'aziz_dev', rating: 1398 },
  { rank: 5, playerId: 'p3', nickname: 'bitMaster', rating: 1385 },
]

const hackathons: Hackathon[] = [
  { id: 'h_fall', title: 'MARS Hack: Kuz 2026', description: "48 soatlik hakaton: ta'lim va ekologiya uchun web-ilovalar.", status: 'registration', startsAt: day(6), endsAt: day(8), submissionDeadline: day(8, 18), topics: ['EdTech', 'Eko-shahar', 'AI yordamchi'], maxTeamSize: 4, myTeamId: null },
  { id: 'h_old', title: 'MARS Hack: Bahor 2026', description: "O'yin-ta'lim mavzusidagi hakaton.", status: 'finished', startsAt: day(-160), endsAt: day(-158), submissionDeadline: day(-158), topics: ['GameDev'], maxTeamSize: 4, myTeamId: 't_old' },
]

const teams: HackathonTeam[] = [
  { id: 't1', name: 'Pixel Pioneers', topic: 'EdTech', isOpen: true, members: [{ id: 'u1', fullName: 'Madina S.', role: 'Kapitan' }, { id: 'u2', fullName: 'Jasur K.' }] },
  { id: 't2', name: 'Green Code', topic: 'Eko-shahar', isOpen: true, members: [{ id: 'u3', fullName: 'Otabek N.', role: 'Kapitan' }] },
  { id: 't3', name: 'NeuroKids', topic: 'AI yordamchi', isOpen: false, members: [{ id: 'u4', fullName: 'Lola M.' }, { id: 'u5', fullName: 'Islom T.' }, { id: 'u6', fullName: 'Kamron A.' }, { id: 'u7', fullName: 'Nodira B.' }] },
]

const hackSubmissions: HackathonSubmission[] = [
  { id: 'hs1', teamId: 't3', teamName: 'NeuroKids', projectTitle: 'AI uy vazifa yordamchisi', repoUrl: 'https://github.com', demoUrl: null, status: 'submitted', submittedAt: day(-1) },
]

const hackResults: HackathonResult[] = [
  { rank: 1, teamId: 'x1', teamName: 'Byte Riders', score: 94 },
  { rank: 2, teamId: 't_old', teamName: 'Aziz & Co', score: 88 },
  { rank: 3, teamId: 'x3', teamName: 'Game Lab', score: 81 },
]

const cats = ['Frontend', 'Karyera', 'MARS yangiliklari', 'Algoritmlar']
const posts: BlogPost[] = Array.from({ length: 14 }, (_, i) => ({
  id: `b${i + 1}`,
  title: ['CSS Grid: 5 ta amaliy layout', 'Junior dasturchi portfoliosi', 'MARS Space yangi mavsum', 'Binary search sodda tilda', 'React hooks xatolari', 'Git workflow jamoada'][i % 6] + (i >= 6 ? ` #${i + 1}` : ''),
  excerpt: "Qisqa va amaliy maqola: asosiy g'oyalar, misollar va keyingi qadamlar.",
  content: "Bu maqola demo matn (mock). Haqiqiy kontent backend'dan keladi.\n\nBirinchi bo'lim — muammo. Ikkinchi bo'lim — yechim va misollar. Uchinchi bo'lim — xulosa.",
  coverUrl: art(['🎨', '💼', '🚀', '🔍', '⚛️', '🌿'][i % 6], '#ffb38a', '#ff5a1f'),
  category: cats[i % cats.length], author: 'MARS IT', publishedAt: day(-i * 3), readMinutes: 4 + (i % 5),
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

const algoTasks: AlgoTask[] = [
  { id: 'a1', title: 'Ikki son yig\'indisi', difficulty: 'easy', tags: ['array', 'hash'], solved: true, attempts: 1 },
  { id: 'a2', title: 'Palindrom satr', difficulty: 'easy', tags: ['string'], solved: true, attempts: 2 },
  { id: 'a3', title: 'Binary search', difficulty: 'medium', tags: ['search'], solved: false, attempts: 1 },
  { id: 'a4', title: 'Qavslar balansi', difficulty: 'medium', tags: ['stack'], solved: false, attempts: 0 },
  { id: 'a5', title: 'Eng uzun o\'suvchi ketma-ketlik', difficulty: 'hard', tags: ['dp'], solved: false, attempts: 0 },
]

const edverse: EdverseItem[] = []

export const db = {
  student, courses, lessons, works, submissions, opponents, battleProfile, battleHistory, leaderboard,
  hackathons, teams, hackSubmissions, hackResults, posts, categories, products, purchases, payments,
  paymentInfo, notifications, dashboard, algoTasks, edverse,
  activeMatch: null as BattleMatch | null,
  matchStartedAt: 0,
}
