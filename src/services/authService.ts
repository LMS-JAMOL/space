import type { Student } from '../types'
import { api } from './apiClient'

export interface LoginCredentials {
  /** 7-digit panel ID issued by the admin panel. */
  loginId?: string
  /** Legacy identifier, still accepted by the backend. */
  phone?: string
  /** Legacy identifier, still accepted by the backend. */
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
