import type { Notification } from '../types'
import { api } from './apiClient'

export const notificationService = {
  list: () => api.get<Notification[]>('/notifications'),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
}
