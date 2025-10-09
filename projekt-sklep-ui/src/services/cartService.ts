import type { Product } from '../types'
import { apiClient } from './apiClient'

export interface CartItem {
  product: Product
  quantity: number
}

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    return apiClient.get<CartItem[]>('/cart')
  },

  async addToCart(productId: number, quantity: number = 1): Promise<void> {
    await apiClient.post('/cart', { productId, quantity })
  },

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(productId)
    }
    else {
      await apiClient.put(`/cart/${productId}`, { quantity })
    }
  },

  async removeItem(productId: number): Promise<void> {
    await apiClient.delete(`/cart/${productId}`)
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart')
  },
}
