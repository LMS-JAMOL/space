import { api } from './apiClient'
import { deviceId } from './deviceId'

type CheckinResult = { checkin: { checkedIn: boolean; repeated: boolean; group: string | null; lessonAt: string; method?: 'qr' | 'pin' } }

/** One confirmed (finalized) lesson mark of the student — Attendance v1.4. */
export type AttendanceMark = {
  attendanceId: string
  date: string
  lessonStartsAt: string | null
  group: { id: string; name: string } | null
  status: 'present' | 'absent' | 'unmarked'
  late: boolean
  arrivedAt: string | null
  lateMinutes: number | null
  finalizedAt: string
}

export const attendanceService = {
  /** The student confirms he is at the lesson with the code the mentor shows in class. */
  checkin: (code: string) => api.post<CheckinResult>('/attendance-checkin', { code, deviceId: deviceId() }),
  /** Same, with the 6-digit PIN shown next to the QR (a laptop without a camera). */
  checkinWithPin: (pin: string) => api.post<CheckinResult>('/attendance-checkin/pin', { pin, deviceId: deviceId() }),
  /** Own confirmed attendance: arrival time and minutes late. */
  history: () => api.get<{ attendance: AttendanceMark[] }>('/attendance-checkin/history', { limit: 60 }),
}
