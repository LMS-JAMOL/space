import type { Submission, Work } from '../types'
import { api } from './apiClient'

export const worksService = {
  list: (kind?: Work['kind']) => api.get<Work[]>('/works', { kind }),
  get: (id: string) => api.get<Work>(`/works/${id}`),
  submissions: (id: string) => api.get<Submission[]>(`/works/${id}/submissions`),
  submit: (id: string, data: { comment: string; files: File[] }) => {
    const form = new FormData()
    form.append('comment', data.comment)
    data.files.forEach((f) => form.append('files', f))
    return api.post<Submission>(`/works/${id}/submissions`, form)
  },
}
