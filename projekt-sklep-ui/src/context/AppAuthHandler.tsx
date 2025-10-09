import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiClient } from '../services'
import { useApp } from './AppContext'

/**
 * AppAuthHandler - globalny handler wygasłych tokenów
 *
 * Odpowiedzialności:
 * 1. Rejestruje callback w ApiClient dla błędów 401 (Unauthorized)
 * 2. Gdy refresh token wygaśnie → czyści stan aplikacji i przekierowuje na /login
 *
 * Dlaczego osobny komponent?
 * - Wymaga dostępu do useNavigate() (hook z react-router)
 * - useNavigate() działa tylko wewnątrz <Router>
 * - AppContext jest poza <Router> w hierarchii providerów
 *
 * Hierarchia:
 * <AppProvider>              ← AppContext (brak dostępu do Router)
 *   <Router>
 *     <AppAuthHandler>       ← Tu możemy użyć useNavigate()
 *       <Routes>
 *     </AppAuthHandler>
 *   </Router>
 * </AppProvider>
 *
 * Flow wygaśnięcia sesji:
 * 1. ApiClient.request() dostaje 401
 * 2. Próbuje odświeżyć token (/auth/refresh)
 * 3. Refresh token wygasł → wywołuje authErrorHandler
 * 4. authErrorHandler (ten handler) → czyszczenie stanu + redirect na /login
 */
export function AppAuthHandler({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { setUser, setCart } = useApp()

  useEffect(() => {
    /**
     * Rejestracja callbacku wywoływanego gdy:
     * - Access token wygasł (401)
     * - Refresh token wygasł lub nieprawidłowy (błąd /auth/refresh)
     *
     * Działanie:
     * - Czyści stan użytkownika i koszyka
     * - Przekierowuje na stronę logowania
     */
    apiClient.setAuthErrorHandler(() => {
      setUser(null)
      setCart([])
      navigate('/login')
    })

    /**
     * Cleanup function - wykonywana przy unmount komponentu
     * Usuwa handler
     */
    return () => {
      apiClient.setAuthErrorHandler(() => {})
    }
  }, [navigate, setUser, setCart])

  return <>{children}</>
}
