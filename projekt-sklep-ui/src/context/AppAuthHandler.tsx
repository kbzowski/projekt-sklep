import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiClient, authService, cartService } from '../services'
import { useApp } from './AppContext'

/**
 * Sprawdza czy cookie o danej nazwie istnieje (tylko dla cookies BEZ httpOnly)
 *
 * @param name - Nazwa cookie
 * @returns true jeśli cookie istnieje, false w przeciwnym razie
 */
function hasCookie(name: string): boolean {
  return document.cookie.split(';').some((item) => item.trim().startsWith(`${name}=`))
}

/**
 * AppAuthHandler - globalny handler autentykacji i rehydracji sesji
 *
 * Odpowiedzialności:
 * 1. **Rehydracja sesji przy starcie** - Sprawdza cookie 'is-logged' i przywraca stan
 * 2. Rejestruje callback w ApiClient dla błędów 401 (Unauthorized)
 * 3. Gdy refresh token wygaśnie - czyści stan aplikacji i przekierowuje na /login
 *
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

    // REHYDRACJA SESJI przy starcie aplikacji
    async function rehydrateSession() {
      // Sprawdź czy użytkownik ma aktywną sesję (cookie 'is-logged')
      if (hasCookie('is-logged')) {
        try {
          // Pobierz dane użytkownika z API
          const user = await authService.getCurrentUser()
          setUser(user)

          // Pobierz koszyk użytkownika
          try {
            const cart = await cartService.getCart()
            setCart(cart)
          } catch {
            // Koszyk może być pusty - nie jest błędem
            setCart([])
          }
        } catch {
          // 401 lub inny błąd → sesja wygasła lub tokeny nieprawidłowe
          // authErrorHandler automatycznie wyczyści stan i przekieruje
          // Nic nie robimy tutaj
        }
      }
    }

    // Wykonaj rehydrację przy montowaniu komponentu
    void rehydrateSession()

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
