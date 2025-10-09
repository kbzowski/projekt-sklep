import type { User } from '../types'
import { apiClient } from './apiClient'

export const authService = {
  async login(email: string, password: string): Promise<void> {
    const credentials = btoa(`${email}:${password}`)

    await apiClient.request('/auth/login', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async register(email: string, password: string, name: string): Promise<User> {
    return apiClient.post<User>('/user', { email, password, name })
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/user/me')
  },
}
