import type { BlogPost, Paginated } from '../types'
import { api } from './apiClient'

export const blogService = {
  list: (q: { page: number; search?: string; category?: string }) =>
    api.get<Paginated<BlogPost> & { categories?: string[] }>('/blog/posts', { ...q, pageSize: 9 }),
  get: (id: string) => api.get<BlogPost>(`/blog/posts/${id}`),
}
