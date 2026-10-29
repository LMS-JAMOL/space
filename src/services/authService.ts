import type { Student } from '../types'
import { api } from './apiClient'

export const authService = {
  me: () => api.get<Student>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
}
