import { api } from './apiClient'

/** Homework as the student sees it (the backend `/works` bridge to the mentor's homework). */
export type HomeworkStatus = 'not_submitted' | 'submitted' | 'accepted' | 'rejected'

export interface HomeworkAttachment { id: string; name: string; url: string; sizeBytes: number | null }

export interface Homework {
  id: string
  title: string
  description: string
  groupId: string | null
  groupName: string | null
  courseTitle: string | null
  status: HomeworkStatus
  deadline: string | null
  submittedAt: string | null
  mentorFeedback: string | null
  score: number | null
  attempt: number
  canSubmit: boolean
  needsAttention: boolean
}

export interface HomeworkSubmission {
  id: string
  createdAt: string
  status: HomeworkStatus
  comment: string | null
  link: string | null
  feedback: string | null
  score: number | null
  attempt: number
  attachments: HomeworkAttachment[]
}

export const MAX_FILE_MB = 20 // the server refuses bigger files

export const homeworkService = {
  list: () => api.get<Homework[]>('/works', { kind: 'assignment' }),
  history: (id: string) => api.get<HomeworkSubmission[]>(`/works/${id}/submissions`),
  submit: (id: string, data: { comment: string; link: string; files: File[] }) => {
    const form = new FormData()
    form.append('comment', data.comment)
    if (data.link) form.append('link', data.link)
    data.files.forEach((f) => form.append('files', f))
    return api.post<HomeworkSubmission>(`/works/${id}/submissions`, form)
  },
}
