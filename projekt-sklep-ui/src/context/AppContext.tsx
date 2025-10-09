import { createContext, type ReactNode, useContext, useState } from 'react'

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
   * Bez React Compiler: użyj useCallback z pustą tablicą zależności []
   * aby zapobiec niepotrzebnym re-renderom komponentów otrzymujących te funkcje jako propsy
   *
   * React Compiler automatycznie memoizuje funkcje gdzie potrzeba,
   * dlatego useCallback nie jest już konieczny
   */
  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }))
  }

  const setCart = (cart: CartItem[]) => {
    setState(prev => ({ ...prev, cart }))
  }

  const setProducts = (products: Product[]) => {
    setState(prev => ({ ...prev, products }))
  }

  const setCategories = (categories: Category[]) => {
    setState(prev => ({ ...prev, categories }))
  }

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }

  // === FILTRY I PAGINACJA ===

  /**
   * Zmiana kategorii automatycznie resetuje paginację do strony 1
   * Zapobiega sytuacji, gdzie użytkownik jest na stronie 3 kategorii A,
   * przełącza się na kategorię B (która ma tylko 1 stronę) → błąd 404
   *
   * Bez React Compiler: użyj useCallback z pustą tablicą zależności []
   */
  const setCategoryFilter = (category: string | null) => {
    setState(prev => ({
      ...prev,
      currentCategory: category,
      currentPage: 1, // Reset strony przy zmianie kategorii
    }))
  }

  /**
   * Zmiana sortowania również resetuje paginację
   * Analogiczne powody jak przy setCategoryFilter
   *
   * Bez React Compiler: użyj useCallback z pustą tablicą zależności []
   */
  const setSortBy = (sortBy: ProductOrderBy) => {
    setState(prev => ({
      ...prev,
      sortBy,
      currentPage: 1, // Reset strony przy zmianie sortowania
    }))
  }

  /**
   * Bez React Compiler: użyj useCallback z pustą tablicą zależności []
   */
  const setPage = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  /**
   * Bez React Compiler: użyj useCallback z pustą tablicą zależności []
   */
  const setPagination = (totalPages: number, totalProducts: number) => {
    setState(prev => ({ ...prev, totalPages, totalProducts }))
  }

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
