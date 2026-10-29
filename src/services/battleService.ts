import type { BattleMatch, BattleOpponent, BattleProfile, LeaderboardEntry } from '../types'
import { api } from './apiClient'

// TODO(backend): real-time protocol (WebSocket/SSE) is not confirmed — match state is polled.
export const battleService = {
  profile: () => api.get<BattleProfile>('/battle/profile'),
  leaderboard: () => api.get<LeaderboardEntry[]>('/battle/leaderboard'),
  opponents: () => api.get<BattleOpponent[]>('/battle/opponents'),
  createMatch: (data: { opponentId?: string; language?: string; difficulty?: string }) =>
    api.post<BattleMatch>('/battle/matches', data),
  match: (id: string) => api.get<BattleMatch>(`/battle/matches/${id}`),
  cancel: (id: string) => api.post<BattleMatch>(`/battle/matches/${id}/cancel`),
  history: () => api.get<BattleMatch[]>('/battle/history'),
}
