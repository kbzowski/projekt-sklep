import type {Product, ProductOrderBy} from '../types'
import { apiClient } from './apiClient'

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export interface ProductsParams {
  category?: string
  sortBy?: ProductOrderBy
  search?: string
  page?: number
  limit?: number
}

export const productService = {
  async getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams()

    if (params.category) searchParams.set('category', params.category)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.search) searchParams.set('search', params.search)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const endpoint = `/products${searchParams.toString() ? `?${searchParams}` : ''}`
    return apiClient.get<ProductsResponse>(endpoint)
  },

  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`)
  },

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await this.getProducts({ limit })
    return response.products
  },
}
