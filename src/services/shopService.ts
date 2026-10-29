import type { Product, Purchase, ShopCategory } from '../types'
import { api } from './apiClient'

export const shopService = {
  products: () => api.get<Product[]>('/shop/products'),
  product: (id: string) => api.get<Product>(`/shop/products/${id}`),
  categories: () => api.get<ShopCategory[]>('/shop/categories'),
  balance: () => api.get<{ coins: number }>('/shop/balance'),
  // Only productId/quantity are sent: price and balance are verified server-side.
  purchase: (data: { productId: string; quantity: number }, idempotencyKey: string) =>
    api.post<Purchase>('/shop/purchases', data, idempotencyKey),
  purchases: () => api.get<Purchase[]>('/shop/purchases'),
  purchaseById: (id: string) => api.get<Purchase>(`/shop/purchases/${id}`),
}
