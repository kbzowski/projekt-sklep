import type { Category } from '../types'

import { apiClient } from './apiClient'

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories')
  },
}
