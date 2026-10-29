import type { Tone } from '../components/ui'

export const fmtNum = (n: number) => new Intl.NumberFormat('ru-RU').format(n)
export const fmtMoney = (n: number, cur = 'UZS') => `${fmtNum(n)} ${cur === 'UZS' ? "so'm" : cur}`
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
export const fmtSize = (b?: number | null) => (b ? (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`) : '')

export const newIdempotencyKey = () => crypto.randomUUID()

export const statusMap: Record<string, [string, Tone]> = {
  not_submitted: ['Topshirilmagan', 'gray'], submitted: ['Topshirildi', 'blue'], in_review: ['Tekshirilmoqda', 'yellow'],
  accepted: ['Qabul qilindi', 'green'], rejected: ['Qaytarildi', 'red'], draft: ['Qoralama', 'gray'],
  pending: ['Kutilmoqda', 'yellow'], paid: ["To'landi", 'green'], failed: ['Xato', 'red'], cancelled: ['Bekor qilindi', 'gray'],
  processing: ['Tayyorlanmoqda', 'blue'], ready: ['Olib ketishga tayyor', 'violet'], delivered: ['Topshirildi', 'green'],
  active: ['Faol', 'orange'], completed: ['Tugallangan', 'green'], free: ['Bepul', 'blue'],
  upcoming: ['Tez kunda', 'gray'], registration: ["Ro'yxat ochiq", 'green'], running: ['Davom etmoqda', 'orange'],
  judging: ['Baholanmoqda', 'yellow'], finished: ['Yakunlangan', 'gray'],
}
