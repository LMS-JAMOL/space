/**
 * A random id for this phone/browser, used by lesson check-in: the backend
 * lets one device check in one student per lesson. It is not a fingerprint
 * and carries no personal data.
 */
const KEY = 'mars-device-id'

let memoryId: string | null = null

const randomId = (): string => {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function deviceId(): string {
  try {
    const saved = window.localStorage.getItem(KEY)
    if (saved && /^[A-Za-z0-9_-]{16,64}$/.test(saved)) return saved
    const created = randomId()
    window.localStorage.setItem(KEY, created)
    return created
  } catch {
    // Storage blocked (private mode): keep one id for this tab.
    memoryId ??= randomId()
    return memoryId
  }
}
