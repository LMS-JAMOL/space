import { HTTP_STATUS, TRANSPORT, statusInfo, type StatusInfo } from './httpStatus'
import { ApiError } from '../services/apiClient'

/**
 * One description of a failure for the whole Space panel.
 *
 * Nothing in the UI reads `error.message` directly any more: describeError()
 * returns the status, a sanitised message, the backend validation details and
 * whether retrying can help. Backend copy is trusted only when short and
 * plain — stack traces / driver dumps never reach the screen.
 */

const MAX_MESSAGE_LENGTH = 300

const UNSAFE_MESSAGE = /(^|\s)at\s+[^\n]*?:\d+:\d+|MongoServerError|MongooseError|ECONNREFUSED|mongodb(\+srv)?:\/\/|postgres:\/\//i

export interface ErrorDetail {
  field: string
  message: string
}

export interface DescribedError {
  status: number | null
  code: string
  kind: string
  title: string
  message: string
  details: ErrorDetail[]
  retryable: boolean
  canceled: boolean
  isNetwork: boolean
  isTimeout: boolean
}

/** Short, single-line, plain-text version of a backend message ('' if unsafe). */
export function safeMessage(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const text = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text || UNSAFE_MESSAGE.test(text)) return ''
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : text
}

/** Backend validation details ({ field: 'message' }) → a short, safe list. */
export function normalizeDetails(details: unknown): ErrorDetail[] {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return []
  return Object.entries(details as Record<string, unknown>)
    .map(([field, value]) => ({ field, message: safeMessage(String(value)) }))
    .filter((entry) => entry.message)
    .slice(0, 10)
}

function infoFor(status: number | null, code: string): StatusInfo {
  if (code === 'ERR_CANCELED') return TRANSPORT.canceled
  if (code === 'ERR_TIMEOUT') return TRANSPORT.timeout
  if (code === 'ERR_NETWORK' || status === 0) return TRANSPORT.network
  return statusInfo(status)
}

export function describeError(error: unknown): DescribedError {
  const isApiError = error instanceof ApiError
  const name = error instanceof Error ? error.name : ''
  const rawCode = isApiError ? (error.code ?? '') : ''
  const canceled = rawCode === 'ERR_CANCELED' || name === 'AbortError'
  const isTimeout = rawCode === 'ERR_TIMEOUT'
  const status = isApiError ? (error.status || null) : null
  const code = canceled ? 'ERR_CANCELED' : isTimeout ? 'ERR_TIMEOUT' : rawCode || (status ? `HTTP_${status}` : 'ERR_UNKNOWN')
  const info = canceled ? TRANSPORT.canceled : infoFor(status, code)
  const generic = info.message
  const specific = isApiError ? safeMessage(error.message) : ''
  return {
    status,
    code,
    kind: info.kind,
    title: info.title,
    message: specific && specific !== generic ? specific : generic,
    details: isApiError ? normalizeDetails(error.details) : [],
    retryable: canceled ? false : info.retryable === true,
    canceled,
    isNetwork: code === 'ERR_NETWORK' || status === 0,
    isTimeout,
  }
}

/** Convenience for the few places that only need the sentence. */
export const errorText = (error: unknown) => describeError(error).message

/** True when repeating the same request can reasonably succeed. */
export const isRetryableError = (error: unknown) => describeError(error).retryable

export { HTTP_STATUS, TRANSPORT, statusInfo }
