import type { EdverseItem } from '../types'
import { api } from './apiClient'

// UNCONFIRMED: no Edverse API contract exists yet. Endpoint is a placeholder.
export const EDVERSE_CONTRACT_CONFIRMED = false

export const edverseService = {
  list: () => api.get<EdverseItem[]>('/edverse'),
}
