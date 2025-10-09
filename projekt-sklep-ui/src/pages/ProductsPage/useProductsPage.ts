import { useEffect } from 'react'

import { useApp } from '../../context/AppContext'
import { useCart } from '../../hooks/useCart'
import { productService, categoryService } from '../../services'
import type { ProductOrderBy } from '../../types'

/**
 * useProductsPage - custom hook orkiestrujący logikę strony produktów
 *
 * Architektura "Page Hook":
 * - Hook izoluje logikę biznesową od komponentu UI
 * - Komponent otrzymuje gotowe dane i funkcje handlery
 * - Łatwiejsze testowanie - hook można testować oddzielnie od UI
 * - Separation of concerns: hook = logika, komponent = prezentacja
 *
 * Odpowiedzialności:
 * 1. Ładowanie kategorii (raz przy mount)
 * 2. Ładowanie produktów z filtrami i paginacją (re-fetch przy zmianie filtrów)
 * 3. Dodawanie produktów do koszyka
 * 4. Obsługa zmian filtrów (kategoria, sortowanie, strona)
 * 5. Error handling i loading states
 *
 * Data flow:
 * Services (API) → Page Hook (logika) → Context (stan) → Component (UI)
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
   * Effect 1: Ładowanie kategorii przy mount komponentu
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
   * Effect 2: Ładowanie produktów z filtrami i paginacją
   *
   * Re-fetch triggers (zależności useEffect):
   * - currentCategory - zmiana kategorii filtrującej
   * - sortBy - zmiana sortowania (name, price, newest)
   * - currentPage - zmiana strony paginacji
   * - itemsPerPage - zmiana liczby produktów na stronę
   *
   * Każda zmiana tych wartości → nowy fetch produktów z backendu
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
   * setCategoryFilter automatycznie resetuje currentPage do 1 (patrz AppContext)
   */
  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category)
  }

  /**
   * Handler: Zmiana sortowania
   * setSortBy automatycznie resetuje currentPage do 1 (patrz AppContext)
   */
  const handleSortChange = (sort: ProductOrderBy) => {
    setSortBy(sort)
  }

  /**
   * Handler: Zmiana strony paginacji
   */
  const handlePageChange = (page: number) => {
    setPage(page)
  }

  /**
   * Return: API hooka - dane i funkcje dla komponentu UI
   *
   * Komponent ProductsPage.tsx otrzymuje:
   * - State (produkty, kategorie, filtry, loading, etc.)
   * - Actions (handlery do obsługi interakcji użytkownika)
   *
   * Dzięki temu komponent jest "głupi" - tylko renderuje UI i wywołuje handlery
   *
   * handleAddToCart pochodzi z useCart() - reużywalny hook dla operacji koszyka
   */
  return {
    // State
    products,
    categories,
    currentCategory,
    sortBy,
    currentPage,
    totalPages,
    isLoading,
    // Actions
    handleAddToCart: addToCart,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
  }
}
