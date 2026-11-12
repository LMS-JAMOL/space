import { api } from './apiClient'

export interface QuizQuestion {
  id: string
  text: string
  type: 'single' | 'multiple' | 'true_false' | 'code_snippet' | 'ordering' | 'matching' | 'fill_blank' | 'numeric'
  points: number
  options?: { id: string; text: string }[]
  elements?: { id: string; text: string }[]
  leftItems?: { id: string; text: string }[]
  rightItems?: { id: string; text: string }[]
  blanks?: unknown[]
  codeSnippet?: { code?: string; language?: string }
}

export interface QuizSummary {
  _id: string
  title: string
  description?: string
  course?: { _id: string; name: string }
}

export interface QuizAttempt {
  _id?: string
  id?: string
  attemptNumber: number
  status: string
  percentage?: number
  scorePercent?: number
  passed?: boolean
  submittedAt?: string
}

export const quizAttemptId = (attempt: QuizAttempt) => attempt.id || attempt._id || ''

export interface QuizAnswer {
  questionId: string
  optionId?: string
  optionIds?: string[]
  value?: boolean | number
  order?: string[]
  pairs?: { leftId: string; rightId: string }[]
  answers?: string[]
}

export interface QuizResult {
  id: string
  quiz: { id: string; title: string }
  percentage: number
  passingScore: number
  passed: boolean
  attemptNumber: number
  questions: { id: string; text: string; isCorrect: boolean | null; studentAnswer: unknown;
    studentAnswerDisplay?: unknown;
    earnedPoints: number | null; maxPoints: number; correctAnswer?: unknown }[]
}

export const quizService = {
  list: async () => (await api.get<{ quizzes: QuizSummary[] }>('/student/quizzes')).quizzes,
  attempts: async (quizId: string) => (await api.get<{ attempts: QuizAttempt[] }>(`/student/quizzes/${quizId}/attempts`)).attempts,
  start: (quizId: string) => api.post<{ attempt: QuizAttempt; version: { questions: QuizQuestion[] } }>(`/student/quizzes/${quizId}/attempts`),
  resume: (attemptId: string) => api.get<{ attempt: QuizAttempt; version: { questions: QuizQuestion[] } }>(`/student/quiz-attempts/${attemptId}/session`),
  submit: (attemptId: string, answers: QuizAnswer[]) => api.post<{ attempt: QuizAttempt }>(`/student/quiz-attempts/${attemptId}/submit`, { answers }),
  result: async (attemptId: string) => (await api.get<{ result: QuizResult }>(`/student/quiz-attempts/${attemptId}/result`)).result,
}
