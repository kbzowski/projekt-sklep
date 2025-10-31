import { useEffect, useTransition, useDeferredValue } from 'react'

import { useApp } from '../../context/AppContext'
import { useCart } from '../../hooks/useCart'
import { productService, categoryService } from '../../services'
import type { ProductOrderBy } from '../../types'

/**
 * useProductsPage - custom hook orkiestrujący logikę strony produktów
 */
export const useProductsPage = () => {
  const {
    state,
    setProducts,
    setCategories,
    setLoading,
    setError,
    setCategoryFilter,
    setSortBy,
    setSearchQuery,
    setPage,
    setPagination,
  } = useApp()

  const {
    products,
    categories,
    currentCategory,
    sortBy,
    searchQuery,
    currentPage,
    itemsPerPage,
    totalPages,
    isLoading,
  } = state

  const { addToCart } = useCart()

  /**
   * useTransition - React 19 hook dla nie blokujących zmian stanu
   */
  const [isPending, startTransition] = useTransition()

  /**
   * useDeferredValue - React 19 hook dla opóźnionych wartości
   *
   * Benefit:
   * - User wpisuje w SearchBar → instant update input value (searchQuery)
   * - deferredSearchQuery aktualizuje się z opóźnieniem (nie blokuje UI)
   * - Filtrowanie produktów używa deferredSearchQuery → płynne UX
   *
   * isPending dla search:
   * - searchQuery !== deferredSearchQuery → user jeszcze wpisuje
   * - pokazujemy spinner w SearchBar
   */
  const deferredSearchQuery = useDeferredValue(searchQuery)

  /**
   * Ładowanie kategorii przy mount komponentu
   *
   * Optymalizacja: sprawdza czy już załadowane (categories.length > 0)
   * Dzięki temu nie ładujemy ponownie przy każdym wejściu na /products
   *
   * useEffect dependencies:
   * - categories.length - sprawdza czy już załadowane
   * - setCategories - setter z kontekstu (React Compiler zapewnia stabilną referencję)
   */
  useEffect(() => {
    const loadCategories = async () => {
      if (categories.length > 0) return // Już załadowane - skip

      try {
        const categoriesData = await categoryService.getCategories()
        setCategories(categoriesData)
      }
      catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    loadCategories()
  }, [categories.length, setCategories])

  /**
   * Ładowanie produktów z filtrami i paginacją
   *
   * Zależności useEffect:
   * - currentCategory - zmiana kategorii filtrującej
   * - sortBy - zmiana sortowania (name, price, newest)
   * - deferredSearchQuery - wyszukiwanie (backend search)
   * - currentPage - zmiana strony paginacji
   * - itemsPerPage - zmiana liczby produktów na stronę
   *
   * WAŻNE: Używamy deferredSearchQuery (nie searchQuery)
   * - User wpisuje → searchQuery aktualizuje się natychmiast (input)
   * - deferredSearchQuery aktualizuje się z opóźnieniem (nie blokuje UI)
   * - Fetch używa deferredSearchQuery → backend search z debounce efektem
   *
   * Loading states:
   * - setLoading(true) przed fetch
   * - setLoading(false) w finally (zawsze, nawet przy błędzie)
   * - setError(null) przed fetch aby wyczyścić poprzedni błąd
   */
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await productService.getProducts({
          category: currentCategory || undefined,
          sortBy,
          search: deferredSearchQuery || undefined,
          page: currentPage,
          limit: itemsPerPage,
        })

        setProducts(response.products)
        setPagination(response.totalPages, response.total)
      }
      catch (error) {
        setError('Błąd podczas ładowania produktów')
        console.error('Failed to load products:', error)
      }
      finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [currentCategory, sortBy, deferredSearchQuery, currentPage, itemsPerPage, setProducts, setPagination, setLoading, setError])

  /**
   * Handler: Zmiana kategorii filtrującej
   */
  const handleCategoryChange = (category: string | null) => {
    startTransition(() => {
      setCategoryFilter(category)
    })
  }

  /**
   * Handler: Zmiana sortowania
   */
  const handleSortChange = (sort: ProductOrderBy) => {
    startTransition(() => {
      setSortBy(sort)
    })
  }

  /**
   * Handler: Zmiana strony paginacji
   */
  const handlePageChange = (page: number) => {
    startTransition(() => {
      setPage(page)
    })
  }

  /**
   * Handler: Zmiana search query
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  /**
   * isPending dla search - czy user jeszcze wpisuje?
   * searchQuery !== deferredSearchQuery → pokazujemy spinner w SearchBar
   *
   * Backend search flow:
   * 1. User wpisuje → searchQuery update natychmiast (input responsive)
   * 2. deferredSearchQuery update z opóźnieniem (debounce effect)
   * 3. useEffect z deferredSearchQuery → fetch z backendu
   * 4. Podczas wpisywania: isSearchPending = true → spinner w SearchBar
   *
   * Benefit:
   * - Płynny input (instant feedback)
   * - Mniej requestów do backendu (debounce via useDeferredValue)
   * - Backend search (database indexing, case-insensitive, itp.)
   */
  const isSearchPending = searchQuery !== deferredSearchQuery

  return {
    // State
    products, // ← Produkty z backendu (już przefiltrowane)
    categories,
    currentCategory,
    sortBy,
    searchQuery,
    currentPage,
    totalPages,
    isLoading,
    isPending, // ← React 19 useTransition state (filters)
    isSearchPending, // ← React 19 useDeferredValue state (search)
    // Actions
    handleAddToCart: addToCart,
    handleCategoryChange,
    handleSortChange,
    handleSearchChange,
    handlePageChange,
  }
}
