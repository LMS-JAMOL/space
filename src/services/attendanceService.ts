import { api } from './apiClient'
import { deviceId } from './deviceId'

export const attendanceService = {
  /** The student confirms he is at the lesson with the code the mentor shows in class. */
  checkin: (code: string) => api.post<{ checkin: { checkedIn: boolean; repeated: boolean; group: string | null; lessonAt: string } }>(
    '/attendance-checkin', { code, deviceId: deviceId() }),
}
