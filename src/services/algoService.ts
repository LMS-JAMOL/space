import type { AlgoTask } from '../types'
import { api } from './apiClient'

// UNCONFIRMED: no Algo API contract exists yet. Endpoint is a placeholder.
export const ALGO_CONTRACT_CONFIRMED = false

export const algoService = {
  tasks: () => api.get<AlgoTask[]>('/algo/tasks'),
}
