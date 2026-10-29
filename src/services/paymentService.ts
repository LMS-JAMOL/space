import type { CheckoutResponse, Payment, PaymentInfo } from '../types'
import { api } from './apiClient'

// TODO(backend): GET /payments/info is a proposed endpoint (amount due, suggested amounts, providers).
export const paymentService = {
  info: () => api.get<PaymentInfo>('/payments/info'),
  history: () => api.get<Payment[]>('/payments/history'),
  get: (id: string) => api.get<Payment>(`/payments/${id}`),
  // Card data is entered only on the provider's hosted page returned in checkoutUrl.
  checkout: (data: { amount: number; provider: string }, idempotencyKey: string) =>
    api.post<CheckoutResponse>('/payments/checkout', data, idempotencyKey),
}
