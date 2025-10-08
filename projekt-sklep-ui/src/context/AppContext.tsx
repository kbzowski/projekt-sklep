import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

import type { CartItem } from '../services'
import type {AppContextType, AppState, Category, Product, ProductOrderBy, User} from '../types'

/**
 * Stan początkowy aplikacji
 * Zawiera wszystkie dane globalne: user, koszyk, produkty, kategorie, filtry, paginację
 */
const initialState: AppState = {
  user: null,
  cart: [],
  products: [],
  categories: [],
  currentCategory: null,
  sortBy: 'name',
  currentPage: 1,
  itemsPerPage: 6,
  totalPages: 1,
  totalProducts: 0,
  isLoading: false,
  error: null,
}

const AppContext = createContext<AppContextType | null>(null)

/**
 * AppProvider - globalny kontener stanu aplikacji
 *
 * Architektura "Passive State Container":
 * - Context przechowuje TYLKO stan i proste settery
 * - Logika biznesowa w custom hooks (useProductsPage, useLoginPage etc.)
 * - Serwisy zajmują się komunikacją z API
 *
 * Podział odpowiedzialności:
 * AppContext → stan globalny
 * Page hooks → orkiestracja logiki (fetch, error handling, state updates)
 * Services → API calls
 * Components → UI (prezentacja)
 *
 * Korzyści:
 * - Łatwiejsze testowanie (logika oddzielona od UI)
 * - Reużywalność hooków
 * - Czytelność kodu (separation of concerns)
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  // === PODSTAWOWE SETTERY STANU ===

  /**
   * useCallback zapobiega niepotrzebnym re-renderom komponentów
   * które otrzymują te funkcje jako propsy
   *
   * Pusta tablica zależności [] → funkcja tworzona raz, nigdy nie zmienia referencji
   */
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }))
  }, [])

  const setCart = useCallback((cart: CartItem[]) => {
    setState(prev => ({ ...prev, cart }))
  }, [])

  const setProducts = useCallback((products: Product[]) => {
    setState(prev => ({ ...prev, products }))
  }, [])

  const setCategories = useCallback((categories: Category[]) => {
    setState(prev => ({ ...prev, categories }))
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  // === FILTRY I PAGINACJA ===

  /**
   * Zmiana kategorii automatycznie resetuje paginację do strony 1
   * Zapobiega sytuacji, gdzie użytkownik jest na stronie 3 kategorii A,
   * przełącza się na kategorię B (która ma tylko 1 stronę) → błąd 404
   */
  const setCategoryFilter = useCallback((category: string | null) => {
    setState(prev => ({
      ...prev,
      currentCategory: category,
      currentPage: 1, // Reset strony przy zmianie kategorii
    }))
  }, [])

  /**
   * Zmiana sortowania również resetuje paginację
   * Analogiczne powody jak przy setCategoryFilter
   */
  const setSortBy = useCallback((sortBy: ProductOrderBy) => {
    setState(prev => ({
      ...prev,
      sortBy,
      currentPage: 1, // Reset strony przy zmianie sortowania
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const setPagination = useCallback((totalPages: number, totalProducts: number) => {
    setState(prev => ({ ...prev, totalPages, totalProducts }))
  }, [])

  /**
   * Wartość kontekstu - wyłącznie stan i settery
   * BRAK logiki biznesowej - to zadanie page hooks
   */
  const contextValue: AppContextType = {
    state,
    setUser,
    setCart,
    setProducts,
    setCategories,
    setLoading,
    setError,
    setCategoryFilter,
    setSortBy,
    setPage,
    setPagination,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Custom hook do używania kontekstu aplikacji
 *
 * Wzorzec: context + custom hook zapewnia:
 * - Type safety (TypeScript wie, że context nie jest null)
 * - Walidację (error jeśli użyty poza AppProvider)
 * - Wygodniejsze API (useApp() zamiast useContext(AppContext))
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
