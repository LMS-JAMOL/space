import type { Certificate, Hackathon, HackathonResult, HackathonSubmission, HackathonTeam } from '../types'
import { api } from './apiClient'

export const hackathonService = {
  list: () => api.get<Hackathon[]>('/hackathons'),
  get: (id: string) => api.get<Hackathon>(`/hackathons/${id}`),
  teams: (id: string) => api.get<HackathonTeam[]>(`/hackathons/${id}/teams`),
  createTeam: (id: string, data: { name: string; topic?: string }) =>
    api.post<HackathonTeam>(`/hackathons/${id}/teams`, data),
  join: (id: string, teamId: string) => api.post<HackathonTeam>(`/hackathons/${id}/join`, { teamId }),
  submissions: (id: string) => api.get<HackathonSubmission[]>(`/hackathons/${id}/submissions`),
  submit: (id: string, data: { projectTitle: string; repoUrl?: string; demoUrl?: string }) =>
    api.post<HackathonSubmission>(`/hackathons/${id}/submissions`, data),
  results: (id: string) => api.get<HackathonResult[]>(`/hackathons/${id}/results`),
  certificates: (id: string) => api.get<Certificate[]>(`/hackathons/${id}/certificates`),
}
