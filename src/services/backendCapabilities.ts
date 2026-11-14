import { API_BASE_URL } from './apiClient'

type ApiSchema = { paths: Record<string, Record<string, unknown>> }
let schemaPromise: Promise<ApiSchema> | null = null

/** This detects deployed routes; authorization remains with the Backend. */
export async function getAttendanceCapabilities() {
  if (!schemaPromise) {
    schemaPromise = fetch(new URL('/api-docs.json', API_BASE_URL), {
      signal: AbortSignal.timeout(15000),
    }).then(async (response) => {
      if (!response.ok) throw new Error('Backend imkoniyatlarini tekshirib bo‘lmadi')
      const schema = await response.json() as ApiSchema
      if (!schema.paths || typeof schema.paths !== 'object') {
        throw new Error('Backend API hujjati noto‘g‘ri')
      }
      return schema
    }).catch((error: unknown) => {
      schemaPromise = null
      throw error
    })
  }
  const schema = await schemaPromise
  return {
    pin: Boolean(schema.paths['/api/v1/attendance-checkin/pin']?.post),
    history: Boolean(schema.paths['/api/v1/attendance-checkin/history']?.get),
  }
}
