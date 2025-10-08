import { apiClient } from './apiClient'

export interface OrderItem {
  productId: number
  quantity: number
  price: number
}

export interface CreateOrderData {
  items: OrderItem[]
  totalAmount: number
}

export interface Order {
  id: number
  userId: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  items: Array<{
    id: number
    quantity: number
    price: number
    product: {
      id: number
      name: string
      price: number
      description: string
      image: string
    }
  }>
}

export const orderService = {
  async createOrder(data: CreateOrderData): Promise<Order> {
    return apiClient.post<Order>('/orders', data)
  },

  async getUserOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders')
  },

  async getOrderById(orderId: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`)
  },
}
