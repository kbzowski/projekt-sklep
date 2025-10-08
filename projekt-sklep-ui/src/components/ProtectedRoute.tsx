import { Navigate, useLocation } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { ROUTES } from '../lib/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * ProtectedRoute - Route guard chroniący trasy przed nieautoryzowanym dostępem
 *
 * Dwa tryby działania:
 * 1. requireAuth=true (domyślny) - trasa wymaga zalogowania
 *    → Niezalogowany user → redirect na /login z zapisem intended destination
 * 2. requireAuth=false - trasa tylko dla niezalogowanych (np. /login, /register)
 *    → Zalogowany user → redirect na stronę główną (lub intended destination)
 *
 * Pattern "Intended Destination":
 * Zapisujemy w location.state.from dokąd user chciał wejść przed przekierowaniem.
 * Po zalogowaniu przekierowujemy go tam, zamiast zawsze na home page.
 *
 * Przykład:
 * 1. Niezalogowany user klika "Koszyk" → /cart
 * 2. ProtectedRoute widzi brak state.user
 * 3. Zapisuje location.pathname (/cart) w state.from
 * 4. Przekierowuje na /login
 * 5. User się loguje
 * 6. useLoginPage odczytuje location.state.from → /cart
 * 7. Przekierowuje na /cart zamiast na /
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const { state } = useApp()
  const location = useLocation()

  /**
   * Przypadek 1: Trasa chroniona, user niezalogowany
   * Akcja: Zapisz intended destination + redirect na /login
   *
   * replace=true → nie dodaje wpisu do historii przeglądarki
   * Zapobiega: user loguje się → wciśnie "wstecz" → znowu /login → redirect → pętla
   */
  if (requireAuth && !state.user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  /**
   * Przypadek 2: Trasa tylko dla niezalogowanych, user zalogowany
   * Akcja: Redirect na intended destination lub home page
   *
   * Przykład: user już zalogowany próbuje wejść na /login
   * → automatyczny redirect na stronę główną
   */
  if (!requireAuth && state.user) {
    const from = location.state?.from || ROUTES.HOME
    return <Navigate to={from} replace />
  }

  // Wszystko OK - renderuj chronioną stronę
  return <>{children}</>
}
