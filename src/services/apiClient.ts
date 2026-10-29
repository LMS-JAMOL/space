export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

// Mocks are only reachable in `vite dev`; production builds always hit the real API.
export const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'

// TODO(backend): the auth scheme is not confirmed. Assumes a bearer access token
// stored by the existing login flow + cookie-based refresh at POST /auth/refresh.
const TOKEN_KEY = 'access_token'

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
  refreshPromise ??= fetch(buildUrl('/auth/refresh'), { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) return false
      const data = await res.json().catch(() => null)
      if (data?.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
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
