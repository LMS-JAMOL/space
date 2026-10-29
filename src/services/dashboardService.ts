import type { Dashboard } from '../types'
import { api } from './apiClient'

export const dashboardService = {
  get: () => api.get<Dashboard>('/dashboard'),
}
