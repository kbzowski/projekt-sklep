import { useEffect, useTransition } from 'react'

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
    setPage,
    setPagination,
  } = useApp()

  const {
    products,
    categories,
    currentCategory,
    sortBy,
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
   * - currentPage - zmiana strony paginacji
   * - itemsPerPage - zmiana liczby produktów na stronę
   *
   * Każda zmiana tych wartości - nowy fetch produktów z backendu
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
  }, [currentCategory, sortBy, currentPage, itemsPerPage, setProducts, setPagination, setLoading, setError])

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

  return {
    // State
    products,
    categories,
    currentCategory,
    sortBy,
    currentPage,
    totalPages,
    isLoading,
    isPending, // ← React 19 useTransition state
    // Actions
    handleAddToCart: addToCart,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
  }
}
