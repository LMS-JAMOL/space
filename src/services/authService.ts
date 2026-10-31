import type { Student } from '../types'
import { api } from './apiClient'

export interface LoginCredentials {
  /** Phone (`+998901112233`) or email — the backend accepts either. */
  phone?: string
  email?: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  /** Back-compat alias of `accessToken`. */
  token?: string
  refreshToken?: string
  student: Student
}

export const authService = {
  login: (credentials: LoginCredentials) => api.post<LoginResponse>('/auth/login', credentials),
  me: () => api.get<Student>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
}
