export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

// Mocks are only reachable in `vite dev`; production builds always hit the real API.
export const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'

// TODO(backend): the auth scheme is not confirmed. Assumes a bearer access token
// stored by the existing login flow + cookie-based refresh at POST /auth/refresh.
export const TOKEN_KEY = 'access_token'

/**
 * Fallback copy of the refresh token, used only when the browser does not
 * send the httpOnly cookie (e.g. the panel is opened as `127.0.0.1` while the
 * API lives on `localhost`, so the cookie is cross-site). The cookie stays the
 * primary channel; this copy only keeps the session alive when it is missing.
 */
export const REFRESH_TOKEN_KEY = 'refresh_token'

/** Drops both session tokens — used on logout and on a dead session. */
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Query
  body?: unknown
  signal?: AbortSignal
  idempotencyKey?: string
}

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`
}

let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  refreshPromise ??= (async () => {
    const tryRefresh = async (body?: { refreshToken: string }): Promise<boolean> => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        })
        if (!res.ok) return false
        const data = await res.json().catch(() => null)
        if (!data?.accessToken) return false
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
        return true
      } catch {
        return false
      }
    }

    // 1) httpOnly cookie (primary channel).
    if (await tryRefresh()) return true
    // 2) Fallback: send the stored refresh token in the body.
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY)
    return stored ? tryRefresh({ refreshToken: stored }) : false
  })().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

/** Reads `exp` (ms) out of the access token sitting in localStorage. */
function tokenExpiresAt(): number | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=')
    const { exp } = JSON.parse(atob(padded)) as { exp?: number }
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

/**
 * Keeps the session alive: the access token only lives `JWT_ACCESS_EXPIRES_IN`
 * (15 min), so refresh it a minute *before* it expires instead of waiting for
 * a request to come back 401. The 401 path then only fires when the session is
 * genuinely dead.
 */
const REFRESH_MARGIN_MS = 60_000
const KEEP_ALIVE_INTERVAL_MS = 30_000

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    const exp = tokenExpiresAt()
    if (exp && exp - Date.now() < REFRESH_MARGIN_MS) void refreshToken()
  }, KEEP_ALIVE_INTERVAL_MS)
}

async function parseError(res: Response): Promise<ApiError> {
  const data = await res.json().catch(() => null)
  const message =
    data?.message ?? data?.error ?? (res.status >= 500 ? 'Server xatosi' : `So'rov bajarilmadi (${res.status})`)
  return new ApiError(res.status, String(message), data?.code, data?.details)
}

export async function request<T>(path: string, opts: RequestOptions = {}, retried = false): Promise<T> {
  const method = opts.method ?? 'GET'

  if (USE_MOCKS) {
    const { mockAdapter } = await import('../mocks/mockAdapter')
    return mockAdapter<T>(method, path, opts.query, opts.body)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey

  let body: BodyInit | undefined
  if (opts.body instanceof FormData) body = opts.body
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  let res: Response
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body,
      signal: opts.signal,
      credentials: 'include',
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ApiError(0, "Tarmoq xatosi: serverga ulanib bo'lmadi")
  }

  if (res.status === 401 && !retried && (await refreshToken())) {
    return request<T>(path, opts, true)
  }
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, idempotencyKey?: string) =>
    request<T>(path, { method: 'POST', body, idempotencyKey }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return "Noma'lum xato"
}
