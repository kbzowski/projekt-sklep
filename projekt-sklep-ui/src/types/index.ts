export interface Product {
  id: number
  name: string
  price: number
  category: string
  categoryId: number
  image: string
  description: string
}

export type ProductOrderBy = 'name' | 'price-asc' | 'price-desc'

export interface Category {
  id: number
  name: string
  slug: string
}

export interface User {
  id: number
  email: string
  name: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface AppState {
  user: User | null
  cart: CartItem[]
  products: Product[]
  categories: Category[]
  currentCategory: string | null
  sortBy: ProductOrderBy
  searchQuery: string
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalProducts: number
  isLoading: boolean
  error: string | null
}

export interface AppContextType {
  state: AppState
  // Settery stanu
  setUser: (user: User | null) => void
  setCart: (cart: CartItem[]) => void
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  // Filtry i paginacja
  setCategoryFilter: (category: string | null) => void
  setSortBy: (sortBy: ProductOrderBy) => void
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  setPagination: (totalPages: number, totalProducts: number) => void
}
