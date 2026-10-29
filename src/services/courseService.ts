import type { CourseDetail, CourseStatus, CourseSummary, Lesson } from '../types'
import { api } from './apiClient'

export const courseService = {
  list: (status?: CourseStatus) => api.get<CourseSummary[]>('/courses', { status }),
  get: (id: string) => api.get<CourseDetail>(`/courses/${id}`),
  lessons: (id: string) => api.get<Lesson[]>(`/courses/${id}/lessons`),
}
