/**
 * Central HTTP status registry (Space panel).
 *
 * Same contract as the other panels: one place decides what a status means,
 * whether retrying can help, and which copy the user reads. `title` /
 * `message` are Uzbek source strings — pass them through tr() so the Russian
 * UI picks up the matching ru.phrases.json entry.
 *
 * 3xx codes are documented so the UI can explain them if they ever surface;
 * fetch follows redirects on its own, nothing here rewrites them.
 */

export const SUCCESS = 'success'
export const REDIRECT = 'redirect'
export const CLIENT = 'client'
export const SERVER = 'server'

export interface StatusInfo {
  kind: string
  retryable: boolean
  title: string
  message: string
}

export const HTTP_STATUS: Record<number, StatusInfo> = {
  // ---------------------------------------------------------------- 2xx
  200: { kind: SUCCESS, retryable: false, title: 'Muvaffaqiyatli', message: 'So‘rov muvaffaqiyatli bajarildi.' },
  201: { kind: SUCCESS, retryable: false, title: 'Yaratildi', message: 'Yangi yozuv yaratildi.' },
  202: { kind: SUCCESS, retryable: false, title: 'Qabul qilindi', message: 'So‘rov qabul qilindi va navbatda bajariladi.' },
  204: { kind: SUCCESS, retryable: false, title: 'Kontent yo‘q', message: 'Amal bajarildi, javob tanasi bo‘sh.' },

  // ---------------------------------------------------------------- 3xx
  301: { kind: REDIRECT, retryable: false, title: 'Manzil o‘zgargan', message: 'So‘rov boshqa manzilga yo‘naltiriladi.' },
  302: { kind: REDIRECT, retryable: false, title: 'Vaqtincha yo‘naltirish', message: 'Manzil vaqtincha boshqa joyga yo‘naltirilgan.' },
  304: { kind: REDIRECT, retryable: false, title: 'O‘zgarish yo‘q', message: 'Keshdagi nusxa dolzarb.' },

  // ---------------------------------------------------------------- 4xx
  400: { kind: CLIENT, retryable: false, title: 'Noto‘g‘ri so‘rov', message: 'Noto‘g‘ri ma’lumot kiritildi. Maydonlarni tekshiring.' },
  401: { kind: CLIENT, retryable: false, title: 'Avtorizatsiya talab qilinadi', message: 'Sessiya tugagan yoki avtorizatsiya talab qilinadi. Qaytadan kiring.' },
  403: { kind: CLIENT, retryable: false, title: 'Ruxsat yo‘q', message: 'Bu amalni bajarishga ruxsatingiz yo‘q.' },
  404: { kind: CLIENT, retryable: false, title: 'Topilmadi', message: 'Sahifa yoki ma’lumot topilmadi.' },
  405: { kind: CLIENT, retryable: false, title: 'Usul qo‘llab-quvvatlanmaydi', message: 'Bu manzil uchun so‘rov usuli ruxsat etilmagan.' },
  408: { kind: CLIENT, retryable: true, title: 'So‘rov vaqti tugadi', message: 'So‘rov vaqti tugadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.' },
  409: { kind: CLIENT, retryable: false, title: 'Ziddiyat', message: 'Ma’lumotlar o‘rtasida ziddiyat mavjud. Ma’lumotni yangilab, qayta urinib ko‘ring.' },
  413: { kind: CLIENT, retryable: false, title: 'Fayl juda katta', message: 'Yuborilgan ma’lumot hajmi ruxsat etilganidan katta.' },
  415: { kind: CLIENT, retryable: false, title: 'Format qo‘llab-quvvatlanmaydi', message: 'Yuborilgan ma’lumot formati qo‘llab-quvvatlanmaydi.' },
  422: { kind: CLIENT, retryable: false, title: 'Tekshirish xatosi', message: 'Kiritilgan ma’lumotlarni tekshiring.' },
  429: { kind: CLIENT, retryable: true, title: 'Juda ko‘p so‘rov', message: 'Juda ko‘p so‘rov yuborildi. Birozdan so‘ng qayta urinib ko‘ring.' },

  // ---------------------------------------------------------------- 5xx
  500: { kind: SERVER, retryable: true, title: 'Server xatosi', message: 'Serverda ichki xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.' },
  501: { kind: SERVER, retryable: false, title: 'Amalga oshirilmagan', message: 'Bu funksiya serverda hali amalga oshirilmagan.' },
  502: { kind: SERVER, retryable: true, title: 'Noto‘g‘ri javob', message: 'Serverdan noto‘g‘ri javob olindi.' },
  503: { kind: SERVER, retryable: true, title: 'Xizmat mavjud emas', message: 'Xizmat vaqtincha mavjud emas. Keyinroq qayta urinib ko‘ring.' },
  504: { kind: SERVER, retryable: true, title: 'Server javob bermadi', message: 'Server javob bermadi. Keyinroq qayta urinib ko‘ring.' },
}

/** Transport failures that never carry an HTTP status. */
export const TRANSPORT: Record<'network' | 'timeout' | 'canceled' | 'unknown', StatusInfo> = {
  network: { kind: 'network', retryable: true, title: 'Tarmoq xatosi', message: 'Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.' },
  timeout: { kind: 'timeout', retryable: true, title: 'So‘rov vaqti tugadi', message: 'Server belgilangan vaqtda javob bermadi. Qayta urinib ko‘ring.' },
  canceled: { kind: 'canceled', retryable: false, title: 'Bekor qilindi', message: 'So‘rov bekor qilindi.' },
  unknown: { kind: 'unknown', retryable: true, title: 'Kutilmagan xatolik', message: 'Xatolik yuz berdi. Qayta urinib ko‘ring.' },
}

/** Info for a numeric status; unknown/absent statuses fall back to `unknown`. */
export function statusInfo(status?: number | null): StatusInfo {
  if (status == null) return TRANSPORT.unknown
  return HTTP_STATUS[Number(status)] || TRANSPORT.unknown
}

export const isRetryableStatus = (status?: number | null) => statusInfo(status).retryable === true

export default HTTP_STATUS
